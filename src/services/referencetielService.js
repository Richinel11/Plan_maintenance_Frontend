import api from "../API/axiosInstance";

/* REFERENCES */
export const getReferences = async (entiteMetierId) => {
  const response = await api.get(`references/?entite_metier_id=${entiteMetierId}`);
  return response.data;
};

export const getReferenceById = async (id) => {
  const response = await api.get(`/references/${id}/`);
  return response.data;
};


// Les anciens endpoints (/ouvrage/, /postes/, /departs/, /troncons/, /Localisation/)
// ont été supprimés du backend. Ils sont gérés via le système de Référence (items).
// Les fonctions ci-dessous sont gardées temporairement pour éviter de casser des
// composants qui les appelleraient, mais elles retournent un tableau vide.

export const getOuvrages = async () => [];
export const getPostes = async () => [];
export const getDeparts = async () => [];
export const getLocalisations = async () => [];
export const getTroncons = async () => [];


export const getTypesActivite = async () => {
  try {
    const response = await api.get("/types-activite/");
    return response.data;
  } catch {
    console.warn("Types activite endpoint not available, returning empty array");
    return [];
  }
};

export const getChargesConsignation = async (entiteMetierId = null) => {
  try {
    const url = entiteMetierId
      ? `/charges-consignation/?entite_metier_id=${entiteMetierId}`
      : "/charges-consignation/";
    const response = await api.get(url);
    return response.data;
  } catch {
    console.warn("Charges consignation endpoint not available, returning empty array");
    return [];
  }
};

export const getUnites = async (entiteMetierId) => {
  try {
    const response = await api.get(`/users/unites-demanderesses/?entite_metier_id=${entiteMetierId}`);
    return response.data;
  } catch {
    console.warn("Unites endpoint not available, returning empty array");
    return [];
  }
};

export const getUniteById = async (id) => {
  const response = await api.get(`/users/unites-demanderesses/${id}/`);
  return response.data;
};



