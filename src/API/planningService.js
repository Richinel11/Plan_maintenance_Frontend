// src/API/planningService.js
import api from "./axiosInstance";

export const getPlannings = async (
  page = 1
) => {
  const response = await api.get(
    `/plannings/?page=${page}`
  );
  return response.data;
};

export const getPlanningsBySegment =
  async (
    segment,
    page = 1
  ) => {
    const response = await api.get(
      `/plannings/par_segment/?segment=${segment}&page=${page}`
    );
    return response.data;
};

export const createPlanning = (data) => {
  return api.post("/plannings/", data);
};

export const createTravail = (data) => {
  return api.post("/travaux/", data);
};

export const createPlanningBatch =
  async (payloads) => {
    return Promise.all(
      payloads.map((payload) =>
        createPlanning(payload)
      )
    );
};