import api from "./axiosInstance";

/* GET ALL (dashboard) */
export const getPlannings = () =>
  api.get("/plannings/");

/* GET ONE */
export const getPlanningById = (id) =>
  api.get(`/plannings/${id}/`);

/* CREATE */
export const createPlanning = (data) =>
  api.post("/plannings/", data);

/* UPDATE */
export const updatePlanning = (id, data) =>
  api.put(`/plannings/${id}/`, data);

/* DELETE */
export const deletePlanning = (id) =>
  api.delete(`/plannings/${id}/`);

/* WORKFLOW */
export const submitPlanning = (id) =>
  api.post(`/plannings/${id}/soumettre/`);

export const validatePlanning = (id) =>
  api.post(`/plannings/${id}/valider/`);

export const startPlanning = (id) =>
  api.post(`/plannings/${id}/demarrer/`);

export const finishPlanning = (id) =>
  api.post(`/plannings/${id}/terminer/`);

export const postponePlanning = (id) =>
  api.post(`/plannings/${id}/reporter/`);

/* CONFLICTS */
export const getConflicts = () =>
  api.get("/plannings/conflits/");

/* FILTER */
export const getBySegment = (segment) =>
  api.get(`/plannings/par_segment/?segment=${segment}`);