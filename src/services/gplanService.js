import api from '../API/axiosInstance';

/**
 * Récupère toutes les pages d'un endpoint paginé DRF.
 *
 * @param {string} path - Chemin initial (ex: '/travaux/')
 * @returns {Promise<Array>}
 */
const fetchAllPages = async (path) => {
    const collected = [];
    let currentPath = path;

    while (currentPath) {
        const response = await api.get(currentPath);
        const data = response.data;

        if (Array.isArray(data)) {
            collected.push(...data);
            break;
        }

        collected.push(...(data.results || []));

        if (data.next) {
            const nextPage = new URL(data.next).searchParams.get('page');
            const basePath = path.split('?')[0];
            currentPath = `${basePath}?page=${nextPage}`;
        } else {
            currentPath = null;
        }
    }

    return collected;
};

/**
 * Récupère tous les travaux (toutes pages confondues).
 *
 * @returns {Promise<Array<Travail>>}
 */
export const fetchAllTravaux = () => fetchAllPages('/travaux/');

/**
 * Récupère les IDs des travaux en conflit et en opportunité d'harmonisation.
 *
 * @returns {Promise<{ conflitIds: Set<string>, opportuniteIds: Set<string> }>}
 */
export const fetchConflitIds = async () => {
    const response = await api.get('/travaux/conflits/');
    return {
        conflitIds:     new Set(response.data?.conflits                    || []),
        opportuniteIds: new Set(response.data?.opportunites_harmonisation  || []),
    };
};

/**
 * Construit des groupes d'alerte depuis la liste des travaux et les IDs en conflit.
 * Regroupe les travaux par référence commune.
 */
export function buildGroupes(travaux, conflitIds) {
    console.log('[buildGroupes] conflitIds:', [...conflitIds]);
    console.log('[buildGroupes] total travaux:', travaux.length);
    const enConflit = travaux.filter(t => conflitIds.has(t.id));
    console.log('[buildGroupes] travaux en conflit trouvés:', enConflit.length);
    enConflit.forEach(t => console.log('  ->', t.id, '| reference:', t.reference?.id, t.reference?.valeur));

    const byRef = {};
    for (const t of enConflit) {
        const key = t.reference?.id ?? `_${t.id}`;
        if (!byRef[key]) byRef[key] = [];
        byRef[key].push(t);
    }

    const fmtD = (iso) => new Date(iso).toLocaleString('fr-FR', {
        weekday: 'short', day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });

    return Object.entries(byRef)
        .filter(([, grp]) => grp.length > 1)
        .map(([key, grp]) => {
            const refValeur = grp[0].reference?.valeur || 'Référence inconnue';
            const statut = grp.every(t => t.travail_en_alignement) ? 'RESOLU' : 'OUVERT';

            const debuts = grp.map(t => new Date(t.heure_debut_planifie).getTime());
            const fins   = grp.map(t => new Date(t.heure_fin_planifie).getTime());
            const overlapStart = new Date(Math.max(...debuts));
            const overlapEnd   = new Date(Math.min(...fins));
            const chevauchement = overlapStart < overlapEnd
                ? `${fmtD(overlapStart)} → ${fmtD(overlapEnd)}`
                : '—';

            return {
                id_groupe:           key.slice(0, 12),
                type:                'CONFLIT',
                statut,
                ressources_communes: [refValeur],
                chevauchement,
                nb_travaux:          grp.length,
                travaux: grp.map(t => ({
                    id:           t.id,
                    reference:    t.reference?.valeur || `Travail ${t.id.slice(0, 8)}`,
                    segment:      t.segment,
                    planning_id:  t.planning?.id  ?? null,
                    planning_nom: t.planning?.nom ?? '—',
                    debut:        t.heure_debut_planifie,
                    fin:          t.heure_fin_planifie,
                })),
            };
        });
}

/**
 * Récupère les groupes de conflits en combinant les IDs en conflit
 * et les détails des travaux — sans endpoint supplémentaire côté backend.
 *
 * @returns {Promise<Array>}
 */
export const fetchAlertes = async () => {
    const [{ conflitIds }, travaux] = await Promise.all([
        fetchConflitIds(),
        fetchAllTravaux(),
    ]);
    return buildGroupes(travaux, conflitIds);
};

/**
 * Lance l'analyse des chevauchements d'un planning et génère les propositions d'alignement.
 * POST /plannings/<planningId>/analyser-chevauchements/
 *
 * @param {string} planningId
 * @returns {{ message, resume, chevauchements, propositions }}
 */
export const analyserChevauchements = async (planningId) => {
    const response = await api.post(`/plannings/${planningId}/analyser-chevauchements/`);
    return response.data;
};

/**
 * Récupère les propositions d'un planning.
 * GET /plannings/<planningId>/propositions/?statut=EN_ATTENTE
 *
 * @param {string} planningId
 * @param {string} [statut] - Filtre optionnel : EN_ATTENTE | ACCEPTEE | REFUSEE | BLOQUEE
 * @returns {Array<PropositionAlignement>}
 */
export const fetchPropositions = async (planningId, statut = null) => {
    const query = statut ? `?statut=${statut}` : '';
    const response = await api.get(`/plannings/${planningId}/propositions/${query}`);
    return response.data;
};

/**
 * Accepte une proposition et applique les nouveaux horaires au travail.
 * POST /plannings/<planningId>/appliquer-proposition/
 *
 * @param {string} planningId
 * @param {string} propositionId
 * @returns {{ message, travail, proposition }}
 */
export const appliquerProposition = async (planningId, propositionId) => {
    const response = await api.post(`/plannings/${planningId}/appliquer-proposition/`, {
        proposition_id: propositionId,
    });
    return response.data;
};

/**
 * Refuse une proposition sans modifier le travail.
 * POST /plannings/<planningId>/refuser-proposition/
 *
 * @param {string} planningId
 * @param {string} propositionId
 * @returns {{ message, proposition }}
 */
export const refuserProposition = async (planningId, propositionId) => {
    const response = await api.post(`/plannings/${planningId}/refuser-proposition/`, {
        proposition_id: propositionId,
    });
    return response.data;
};
