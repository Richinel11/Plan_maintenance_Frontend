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
 * Récupère les IDs des travaux en conflit (même ouvrage/tronçon + chevauchement temporel).
 *
 * @returns {Promise<Set<string>>}
 */
export const fetchConflitIds = async () => {
    try {
        const response = await api.get('/travaux/conflits/');
        return new Set(response.data?.conflits || []);
    } catch {
        return new Set();
    }
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
