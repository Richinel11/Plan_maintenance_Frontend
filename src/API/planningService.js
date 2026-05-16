// src/services/planningService.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: false,
});

export const getPlannings = async (
  page = 1
) => {

  const response = await API.get(
    `/plannings/?page=${page}`
  );

  return response.data;
};

export const getPlanningsBySegment =
  async (
    segment,
    page = 1
  ) => {

    const response = await API.get(
      `/plannings/par_segment/?segment=${segment}&page=${page}`
    );

    return response.data;
};

export const createPlanning = (data) => {
  return API.post("/plannings/", data);
};

export const createPlanningBatch =
  async (payloads) => {

    return Promise.all(
      payloads.map((payload) =>
        createPlanning(payload)
      )
    );
};