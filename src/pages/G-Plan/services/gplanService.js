import api from '../../../API/axiosInstance';

/**
 * Récupère toutes les pages d'un endpoint paginé DRF.
 * Gère les deux cas : réponse tableau (pas de pagination) et réponse paginée
 * { results, count, next, previous }.
 *
 * @param {string} path - Chemin initial (ex: '/travaux/')
 * @returns {Promise<Array>} - Tableau complet de tous les objets
 */
const fetchAllPages = async (path) => {
    const collected = [];
    let currentPath = path;

    while (currentPath) {
        const response = await api.get(currentPath);
        const data = response.data;

        // Réponse non paginée (tableau direct)
        if (Array.isArray(data)) {
            collected.push(...data);
            break;
        }

        // Réponse paginée DRF { results, next }
        collected.push(...(data.results || []));

        if (data.next) {
            // data.next est une URL complète (ex: http://localhost:8002/travaux/?page=2)
            // On extrait uniquement le numéro de page pour reconstruire le chemin proprement
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
 * Utilisé par le calendrier et le Gantt pour une vue globale.
 *
 * @returns {Promise<Array<Travail>>}
 */
export const fetchAllTravaux = () => fetchAllPages('/travaux/');

/**
 * Récupère les IDs des travaux en conflit de chevauchement.
 * Retourne un Set pour des lookups O(1) lors du mapping.
 *
 * @returns {Promise<Set<string>>}
 */
export const fetchConflitIds = async () => {
    try {
        const response = await api.get('/travaux/conflits/');
        return new Set(response.data?.conflits || []);
    } catch {
        // L'absence de conflits ne doit pas bloquer le chargement du calendrier
        return new Set();
    }
};
