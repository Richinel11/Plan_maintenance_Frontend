import api from "../API/axiosInstance";

/* REFERENCES */
export const getReferences = async () => {
  const response = await api.get("/references/");
  return response.data;
};

export const getReferenceById = async (id) => {
  const response = await api.get(`/references/${id}/`);
  return response.data;
};


/* OUVRAGES */
export const getOuvrages = async () => {
  const response = await api.get("/ouvrage/");
  return response.data;
};

/* POSTES */
export const getPostes = async () => {
  const response = await api.get("/postes/");
  return response.data;
};

/* DEPARTS */
export const getDeparts = async () => {
  const response = await api.get("/departs/");
  return response.data;
};

/* LOCALISATIONS (Segments) */
export const getLocalisations = async () => {
  const response = await api.get("/Localisation/");
  return response.data;
};

/* TRONCONS */
export const getTroncons = async () => {
  const response = await api.get("/troncons/");
  return response.data;
};

export const getTypesActivite = async () => {
  const response = await api.get("/types-activite/");
  return response.data;
};

export const getChargesConsignation = async () => {
  const response = await api.get("/charges-consignation/");
  return response.data;
};



