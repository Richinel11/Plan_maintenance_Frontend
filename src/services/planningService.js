import api from "../API/axiosInstance";

/* ============================================================
   PLANNINGS
   ============================================================ */

/**
 * Récupère la liste paginée de tous les plannings.
 *
 * @param {number} page - Numéro de page (défaut : 1)
 * @returns {{ results: [], count: number, next: string|null, previous: string|null }}
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
 * @param {string} planningId - UUID du planning
 * @returns {Object} - Objet planning complet
 * @throws {Error} - Si le planning n'existe pas (404) ou erreur serveur
 */
export const getPlanningById = async (planningId) => {
  const response = await api.get(`/plannings/${planningId}/`);
  return response.data;
};

/**
 * Récupère les travaux filtrés par segment métier.
 *
 * @param {string} segment - "DISTRIBUTION" | "TRANSPORT" | "PRODUCTION"
 * @param {number} page    - Numéro de page (défaut : 1)
 * @returns {{ results: [], count: number, next: string|null, previous: string|null }}
 */
export const getPlanningsBySegment = async (segment, page = 1) => {
  try {
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
 * @param {{ nom: string, entite_metier_id?: string }} data
 * @returns {AxiosResponse}
 */
export const createPlanning = (data) => {
  return api.post("/plannings/", data);
};

/**
 * Supprime un planning par son UUID.
 *
 * @param {string} id - UUID du planning
 * @returns {AxiosResponse} - HTTP 204 No Content si succès
 */
export const deletePlanning = (id) => {
  return api.delete(`/plannings/${id}/`);
};

/* ============================================================
   TRAVAUX
   ============================================================ */

/**
 * Récupère les travaux d'un planning.
 *
 * @param {string} planningId
 * @param {{ statut?: string, segment?: string }} filters
 * @returns {Array}
 */
export const getTravaux = async (planningId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.statut)  params.append("statut",  filters.statut);
    if (filters.segment) params.append("segment", filters.segment);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await api.get(`/plannings/${planningId}/travaux/${query}`);
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
 * Crée un nouveau travail.
 *
 * @param {Object} data
 * @returns {AxiosResponse}
 */
export const createTravail = (data) => {
  return api.post("/travaux/", data);
};

/**
 * Met à jour partiellement un travail existant.
 *
 * @param {string} travailId
 * @param {Object} data
 */
export const updateTravail = (travailId, data) => {
  return api.patch(`/travaux/${travailId}/`, data);
};

/**
 * Supprime un travail par son UUID.
 *
 * @param {string} travailId
 */
export const deleteTravail = (travailId) => {
  return api.delete(`/travaux/${travailId}/`);
};

/**
 * Crée plusieurs plannings en parallèle (mode batch).
 *
 * @param {Array<Object>} payloads
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
 *
 * @returns {Array}
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
 * Récupère les listes déroulantes filtrées par service.
 *
 * @param {string} service
 * @returns {Object}
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
 * Récupère les informations d'une référence par son ID.
 *
 * @param {string|number} id
 * @returns {Object}
 */
export const getReferenceDetails = async (id) => {
  const response = await api.get(`/references/${id}/`);
  return response.data;
};
