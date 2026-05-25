// src/API/planningService.js
import api from "./axiosInstance";

/* -------------------------------------------------- */
/*  PLANNINGS                                          */
/* -------------------------------------------------- */

/**
 * Liste paginée des plannings.
 * Retourne { results, count, next, previous } ou [] en cas d'erreur 500.
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
    // Retourne une réponse vide compatible avec le reste du code
    return { results: [], count: 0, next: null, previous: null };
  }
};

export const getPlanningsBySegment = async (segment, page = 1) => {
  try {
    const response = await api.get(
      `/plannings/par_segment/?segment=${segment}&page=${page}`
    );
    return response.data;
  } catch (err) {
    console.error("Erreur plannings par segment:", err?.response?.data || err.message);
    return { results: [], count: 0, next: null, previous: null };
  }
};

export const createPlanning = (data) => {
  return api.post("/plannings/", data);
};

export const createTravail = (data) => {
  return api.post("/travaux/", data);
};

export const createPlanningBatch = async (payloads) => {
  return Promise.all(payloads.map((payload) => createPlanning(payload)));
};

/* -------------------------------------------------- */
/*  CENTRALES THERMIQUES                               */
/* -------------------------------------------------- */

export const getCentrales = async () => {
  try {
    const response = await api.get("/centrales/");
    return response.data?.results || response.data || [];
  } catch (err) {
    console.warn("Centrales endpoint not available:", err?.response?.status);
    return [];
  }
};

/* -------------------------------------------------- */
/*  RÉFÉRENTIEL — OPTIONS PAR SERVICE                 */
/* -------------------------------------------------- */

/**
 * Récupère toutes les listes déroulantes filtrées pour le service donné.
 * NOTE: Cet endpoint n'existe pas encore dans le backend actuel.
 * On retourne un objet vide pour ne pas bloquer le formulaire.
 */
export const getOptionsByService = async (service) => {
  try {
    const response = await api.get(`/api/options/?service=${service}`);
    return response.data;
  } catch (err) {
    if (err?.response?.status === 404 || err?.response?.status === 500) {
      console.warn(`getOptionsByService: endpoint /api/options/ non disponible (${err?.response?.status})`);
      return {};
    }
    console.error("getOptionsByService error:", err?.response?.data || err.message);
    return {};
  }
};

/* -------------------------------------------------- */
/*  RÉFÉRENCES — DÉTAILS PAR ID                       */
/* -------------------------------------------------- */

/**
 * Récupère les champs liés à une référence (items : ouvrage, poste,
 * départ, segment…) à partir de son ID.
 * Route : GET /references/<id>/
 */
export const getReferenceDetails = async (id) => {
  const response = await api.get(`/references/${id}/`);
  return response.data;
};
