import api from '../API/axiosInstance';

/* ─── Cache en mémoire (TTL 5 minutes) ─────────────────────────────────────
 *
 * Principe : la première visite fait les vrais appels API et stocke le
 * résultat ici. Les visites suivantes (dans la même session navigateur)
 * reçoivent la donnée immédiatement, sans requête réseau.
 * Après 5 minutes, la donnée est considérée périmée et re-téléchargée.
 * Le bouton "Actualiser" appelle clearCache() pour forcer un rechargement.
 *
 * ─────────────────────────────────────────────────────────────────────────── */
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const _cache = {};

function getCached(key) {
    const entry = _cache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > TTL_MS) { delete _cache[key]; return null; }
    return entry.data;
}

function setCached(key, data) {
    _cache[key] = { data, ts: Date.now() };
}

/** Vide tout le cache (à appeler avant un rechargement forcé par l'utilisateur). */
export function clearCache() {
    Object.keys(_cache).forEach(k => delete _cache[k]);
}

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
 * Résultat mis en cache 5 min.
 *
 * @returns {Promise<Array<Travail>>}
 */
export const fetchAllTravaux = async () => {
    const cached = getCached('travaux');
    if (cached) return cached;
    const data = await fetchAllPages('/travaux/');
    setCached('travaux', data);
    return data;
};

/**
 * Récupère tous les plannings (toutes pages confondues).
 * Résultat mis en cache 5 min.
 *
 * @returns {Promise<Array<Planning>>}
 */
export const fetchAllPlannings = async () => {
    const cached = getCached('plannings');
    if (cached) return cached;
    const data = await fetchAllPages('/plannings/');
    setCached('plannings', data);
    return data;
};

/**
 * Récupère les IDs des travaux en conflit et en opportunité d'harmonisation.
 * Résultat mis en cache 5 min.
 *
 * @returns {Promise<{ conflitIds: Set<string>, opportuniteIds: Set<string> }>}
 */
export const fetchConflitIds = async () => {
    const cached = getCached('conflitIds');
    if (cached) return cached;
    const response = await api.get('/travaux/conflits/');
    const data = {
        conflitIds:     new Set(response.data?.conflits                    || []),
        opportuniteIds: new Set(response.data?.opportunites_harmonisation  || []),
    };
    setCached('conflitIds', data);
    return data;
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
 * Résultat mis en cache 5 min par planning (clé = planningId).
 *
 * @param {string} planningId
 * @returns {{ message, resume, chevauchements, propositions }}
 */
export const analyserChevauchements = async (planningId) => {
    const key = `chevauchements_${planningId}`;
    const cached = getCached(key);
    if (cached) return cached;
    const response = await api.post(`/plannings/${planningId}/analyser-chevauchements/`);
    setCached(key, response.data);
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

/**
 * Modifie partiellement un travail (réajustement manuel des horaires).
 * PATCH /travaux/<travailId>/
 *
 * Champs utiles pour le réajustement :
 *   heure_debut_planifie  — ISO 8601 (ex: "2024-04-03T08:30")
 *   duree                 — entier positif
 *   unite_duree           — "HEURES" | "JOURS" | "SEMAINES"
 *
 * heure_fin_planifie est calculée automatiquement par le backend (save()).
 *
 * @param {string} travailId
 * @param {object} data
 * @returns {object} travail mis à jour
 */
export const patchTravail = async (travailId, data) => {
    const response = await api.patch(`/travaux/${travailId}/`, data);
    return response.data;
};

export const analyserMois = async (annee = null, mois = null) => {
    const body = {};
    if (annee) body.annee = annee;
    if (mois) body.mois = mois;
    const response = await api.post('/plannings/analyser-mois/', body);
    return response.data;
};
