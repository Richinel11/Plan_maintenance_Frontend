// src/API/planningService.js
//
// Ce fichier centralise tous les appels HTTP vers le backend Django
// pour les ressources Planning et Travail.
// Il utilise l'instance Axios configurée (axiosInstance.js) qui
// gère automatiquement le token JWT dans les headers.
//
import api from "./axiosInstance";

/* ============================================================
   PLANNINGS
   ============================================================ */

/**
 * Récupère la liste paginée de tous les plannings.
 *
 * @param {number} page - Numéro de page (défaut : 1)
 * @returns {{ results: [], count: number, next: string|null, previous: string|null }}
 *
 * En cas d'erreur serveur, retourne un objet vide compatible
 * pour éviter de bloquer l'affichage.
 */
export const getPlannings = async (page = 1) => {
  try {
    const response = await api.get(`/plannings/?page=${page}`);
    return response.data;
  } catch (err) {
    console.error(
      `Erreur lors de la récupération des plannings:`,
      err?.response?.data || err.message
    );
    return { results: [], count: 0, next: null, previous: null };
  }
};

/**
 * Récupère le détail complet d'un planning par son UUID.
 *
 * Correspond à : GET /plannings/<id>/
 *
 * @param {string} planningId - UUID du planning
 * @returns {Object} - Objet planning complet (nom, code, workflow, current_step, etc.)
 * @throws {Error} - Si le planning n'existe pas (404) ou erreur serveur
 */
export const getPlanningById = async (planningId) => {
  const response = await api.get(`/plannings/${planningId}/`);
  return response.data;
};

/**
 * Récupère les plannings filtrés par segment métier.
 * NOTE : cette route filtre les TRAVAUX par segment, pas les plannings directement.
 * Elle utilise : GET /travaux/par_segment/?segment=<XXX>
 *
 * @param {string} segment - "DISTRIBUTION" | "TRANSPORT" | "PRODUCTION"
 * @param {number} page    - Numéro de page (défaut : 1)
 * @returns {{ results: [], count: number, next: string|null, previous: string|null }}
 */
export const getPlanningsBySegment = async (segment, page = 1) => {
  try {
    // ⚠️ La route correcte est /travaux/par_segment/ (pas /plannings/par_segment/)
    // Le backend ne propose pas de filtre par segment sur les plannings,
    // mais sur les travaux. On adapte ici pour garder la compatibilité.
    const response = await api.get(
      `/travaux/par_segment/?segment=${segment}&page=${page}`
    );
    return response.data;
  } catch (err) {
    console.error("Erreur travaux par segment:", err?.response?.data || err.message);
    return { results: [], count: 0, next: null, previous: null };
  }
};

/**
 * Crée un nouveau planning.
 *
 * Correspond à : POST /plannings/
 *
 * @param {{ nom: string, entite_metier_id?: string }} data
 * @returns {AxiosResponse} - La réponse complète (response.data contient l'objet créé)
 */
export const createPlanning = (data) => {
  return api.post("/plannings/", data);
};

/**
 * Supprime un planning par son UUID.
 *
 * Correspond à : DELETE /plannings/<id>/
 *
 * @param {string} id - UUID du planning à supprimer
 * @returns {AxiosResponse} - HTTP 204 No Content si succès
 */
export const deletePlanning = (id) => {
  return api.delete(`/plannings/${id}/`);
};

/* ============================================================
   TRAVAUX
   ============================================================ */

/**
 * Récupère la liste des travaux d'un planning précis.
 *
 * Utilise la nouvelle action backend :
 *   GET /plannings/<planningId>/travaux/
 *
 * Filtres optionnels :
 *   - statut  : "BROUILLON" | "SOUMIS" | "VALIDE" | "EN_COURS" | "TERMINE" | "REPORTE"
 *   - segment : "DISTRIBUTION" | "TRANSPORT" | "PRODUCTION"
 *
 * @param {string} planningId         - UUID du planning parent
 * @param {{ statut?: string, segment?: string }} filters - Filtres optionnels
 * @returns {Array} - Tableau des travaux du planning
 *
 * Exemple d'appel :
 *   const travaux = await getTravaux("3fa85f64-...", { statut: "SOUMIS" });
 */
export const getTravaux = async (planningId, filters = {}) => {
  try {
    // Construction des query params optionnels (statut, segment)
    const params = new URLSearchParams();
    if (filters.statut)  params.append("statut",  filters.statut);
    if (filters.segment) params.append("segment", filters.segment);

    const query = params.toString() ? `?${params.toString()}` : "";

    // Appel vers la route imbriquée : /plannings/<id>/travaux/
    const response = await api.get(`/plannings/${planningId}/travaux/${query}`);

    // Le backend retourne directement un tableau (pas paginé ici)
    return response.data;
  } catch (err) {
    console.error(
      `Erreur lors du chargement des travaux du planning ${planningId}:`,
      err?.response?.data || err.message
    );
    return [];
  }
};

/**
 * Crée un nouveau travail et le rattache à un planning.
 *
 * Correspond à : POST /travaux/
 *
 * Le payload doit contenir au minimum :
 *   - planning_id : UUID du planning parent
 *   - segment     : "DISTRIBUTION" | "TRANSPORT" | "PRODUCTION"
 *
 * @param {Object} data - Données du travail
 * @returns {AxiosResponse} - La réponse complète (response.data contient le travail créé)
 */
export const createTravail = (data) => {
  return api.post("/travaux/", data);
};

/**
 * Crée plusieurs plannings en parallèle (mode batch).
 *
 * @param {Array<Object>} payloads - Tableau de données de plannings
 * @returns {Promise<Array<AxiosResponse>>}
 */
export const createPlanningBatch = async (payloads) => {
  return Promise.all(payloads.map((payload) => createPlanning(payload)));
};

/* ============================================================
   RÉFÉRENTIEL
   ============================================================ */

/**
 * Récupère la liste des centrales thermiques disponibles.
 * Utilisé pour le champ "Centrale thermique sollicitée" du segment PRODUCTION.
 *
 * @returns {Array} - Liste des centrales
 */
export const getCentrales = async () => {
  try {
    const response = await api.get("/centrales/");
    return response.data?.results || response.data || [];
  } catch (err) {
    console.warn("Centrales endpoint not available:", err?.response?.status);
    return [];
  }
};

/**
 * Récupère les listes déroulantes (options) filtrées par service.
 *
 * NOTE : Cet endpoint n'est pas encore implémenté côté backend.
 * On retourne un objet vide pour ne pas bloquer le formulaire.
 *
 * @param {string} service - Le service (ex: "distribution", "transport")
 * @returns {Object} - Options disponibles (vide si endpoint absent)
 */
export const getOptionsByService = async (service) => {
  try {
    const response = await api.get(`/api/options/?service=${service}`);
    return response.data;
  } catch (err) {
    if (err?.response?.status === 404 || err?.response?.status === 500) {
      console.warn(`getOptionsByService: endpoint non disponible (${err?.response?.status})`);
      return {};
    }
    console.error("getOptionsByService error:", err?.response?.data || err.message);
    return {};
  }
};

/**
 * Récupère les informations détaillées d'une référence par son ID.
 * Retourne : ouvrage, poste, départ, segment, etc.
 *
 * Correspond à : GET /references/<id>/
 *
 * @param {string|number} id - Identifiant de la référence
 * @returns {Object} - Détails de la référence
 */
export const getReferenceDetails = async (id) => {
  const response = await api.get(`/references/${id}/`);
  return response.data;
};