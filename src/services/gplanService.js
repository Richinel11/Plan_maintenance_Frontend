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
 * Récupère (et met en cache 5 min) le résultat brut d'analyser-mois pour le
 * mois en cours. Source unique utilisée par fetchConflitIds et
 * fetchGroupesConflits pour éviter d'appeler deux fois le même endpoint et,
 * surtout, pour ne jamais laisser un consommateur reconstruire les groupes
 * de conflits avec sa propre logique (voir buildGroupesDepuisChevauchements).
 */
let _analyseMoisEnCours = null;

const fetchAnalyseMoisCourant = async () => {
    const cached = getCached('analyseMois');
    if (cached) return cached;
    // fetchConflitIds et fetchGroupesConflits sont souvent appelés ensemble
    // (Promise.all) : on mutualise la requête en vol pour ne pas déclencher
    // deux POST /plannings/analyser-mois/ identiques en parallèle.
    if (_analyseMoisEnCours) return _analyseMoisEnCours;
    _analyseMoisEnCours = analyserMois()
        .then(data => {
            setCached('analyseMois', data);
            return data;
        })
        .finally(() => { _analyseMoisEnCours = null; });
    return _analyseMoisEnCours;
};

/**
 * Récupère les IDs des travaux en conflit sur le mois en cours, en s'appuyant
 * sur analyser-mois (source unique de détection des conflits/chevauchements).
 * Résultat mis en cache 5 min.
 *
 * @returns {Promise<{ conflitIds: Set<string>, opportuniteIds: Set<string> }>}
 */
export const fetchConflitIds = async () => {
    const analyse = await fetchAnalyseMoisCourant();
    const conflitIds = new Set();
    (analyse.chevauchements || []).forEach(chev => {
        if (chev.reference?.id) conflitIds.add(chev.reference.id);
        (chev.travaux_en_conflit || []).forEach(t => conflitIds.add(t.id));
    });
    // opportunites_harmonisation n'a jamais été produit par le backend :
    // conservé pour compatibilité avec les consommateurs existants.
    return { conflitIds, opportuniteIds: new Set() };
};

/**
 * Construit les groupes de conflit à partir des `chevauchements` renvoyés par
 * analyser-mois (référence + travaux_en_conflit) — la seule source qui
 * applique la vraie règle métier d'alignement (région + poste + compatibilité
 * rame/départ, cf. planning/alignement_service.py::_partage_ressource).
 *
 * Ne PAS réimplémenter le regroupement côté client à partir de la liste des
 * travaux (ex. par égalité de reference.id) : deux travaux alignables (un
 * Transport sur un poste source et un Distribution sur un départ de ce même
 * poste) n'ont jamais la même référence — un tel regroupement les manquerait
 * silencieusement.
 *
 * @param {Array} chevauchements
 * @returns {Array}
 */
/**
 * Formate une date ISO en texte lisible "JJ/MM/AAAA HH:mm", pour l'affichage
 * uniquement. Ne jamais utiliser la valeur retournée pour un calcul — passer
 * la date ISO d'origine à `new Date(...)` pour ça.
 *
 * @param {string} iso
 * @returns {string}
 */
export function formatDateTimeCourt(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function buildGroupesDepuisChevauchements(chevauchements) {
    return (chevauchements || []).map(chev => {
        const ref = chev.reference;
        return {
            id_groupe:           ref.id.slice(0, 12),
            type:                'CONFLIT',
            statut:              'OUVERT',
            ressources_communes: [ref.ressource],
            chevauchement:       `${formatDateTimeCourt(ref.debut)} → ${formatDateTimeCourt(ref.fin)}`,
            nb_travaux:          1 + chev.travaux_en_conflit.length,
            travaux: [
                {
                    id:           ref.id,
                    reference:    ref.ressource,
                    segment:      ref.segment,
                    planning_id:  ref.planning_id ?? null,
                    planning_nom: ref.planning_nom,
                    debut:        ref.debut,
                    fin:          ref.fin,
                    peut_bouger:  ref.peut_bouger,
                    alignement_verrouille: ref.alignement_verrouille ?? false,
                },
                ...chev.travaux_en_conflit.map(t => ({
                    id:           t.id,
                    reference:    t.ressource,
                    segment:      t.segment,
                    planning_id:  t.planning_id ?? null,
                    planning_nom: t.planning_nom,
                    debut:        t.debut,
                    fin:          t.fin,
                    peut_bouger:  t.peut_bouger,
                    alignement_verrouille: t.alignement_verrouille ?? false,
                })),
            ],
        };
    });
}

/**
 * Récupère les groupes de conflits du mois en cours, construits depuis
 * analyser-mois (cf. buildGroupesDepuisChevauchements).
 *
 * @returns {Promise<Array>}
 */
export const fetchGroupesConflits = async () => {
    const analyse = await fetchAnalyseMoisCourant();
    return buildGroupesDepuisChevauchements(analyse.chevauchements);
};

/**
 * Alias de fetchGroupesConflits, conservé pour les consommateurs existants
 * (widget "Alertes actives" du dashboard).
 *
 * @returns {Promise<Array>}
 */
export const fetchAlertes = fetchGroupesConflits;

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
 * Ajuste la date proposée d'une proposition EN_ATTENTE/BLOQUEE avant application
 * (le travail n'est pas modifié). Le backend revalide la disponibilité du chargé
 * de consignation sur le nouveau créneau : le statut peut changer en conséquence.
 * POST /plannings/<planningId>/modifier-proposition/
 *
 * @param {string} planningId
 * @param {string} propositionId
 * @param {string} nouveauDebut - ISO 8601 (ex: "2026-08-20T14:00")
 * @param {string} nouvelleFin - ISO 8601
 * @returns {{ message, proposition }}
 */
export const modifierProposition = async (planningId, propositionId, nouveauDebut, nouvelleFin) => {
    const response = await api.post(`/plannings/${planningId}/modifier-proposition/`, {
        proposition_id: propositionId,
        nouveau_debut: nouveauDebut,
        nouvelle_fin: nouvelleFin,
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
 *   alignement_verrouille — true pour fixer l'alignement définitivement
 *                           (le système ne proposera plus jamais de déplacer
 *                           ce travail, cf. alignement_service._peut_bouger)
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
