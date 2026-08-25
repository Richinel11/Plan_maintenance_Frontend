import api from "../API/axiosInstance";

/* REFERENCES */
// N'ajoute les filtres entite_metier_id / region_id QUE s'ils sont définis et non nuls.
// Sans cette garde, une valeur undefined produirait la chaîne littérale
// "undefined" dans l'URL → ValidationError Django côté backend.
export const getReferences = async (entiteMetierId, regionId) => {
  const params = new URLSearchParams();
  if (entiteMetierId) params.append('entite_metier_id', entiteMetierId);
  if (regionId) params.append('region_id', regionId);
  const query = params.toString();
  const response = await api.get(query ? `references/?${query}` : `references/`);
  return response.data;
};

export const getReferenceById = async (id) => {
  const response = await api.get(`/references/${id}/`);
  return response.data;
};

export const createReference = async ({ valeur, entite_metier_id }) => {
  const response = await api.post("references/", { valeur, entite_metier_id });
  return response.data;
};

export const updateReference = async (id, { valeur }) => {
  const response = await api.patch(`references/${id}/`, { valeur });
  return response.data;
};

export const getTypesReferentiel = async () => {
  const response = await api.get("types/");
  return response.data?.results || response.data || [];
};

export const createReferentielItem = async ({ valeur, reference_id, type_id }) => {
  const response = await api.post("items/", { valeur, reference: reference_id ?? null, type_id });
  return response.data;
};

export const updateReferentielItem = async (id, { valeur }) => {
  const response = await api.patch(`items/${id}/`, { valeur });
  return response.data;
};

export const deleteReferentielItem = async (id) => {
  const response = await api.delete(`items/${id}/`);
  return response.data;
};

export const deleteReference = async (id) => {
  const response = await api.delete(`references/${id}/`);
  return response.data;
};

// Récupère les valeurs déjà utilisées pour un type de référentiel donné,
// filtrées par entité métier (via la chaîne item -> reference -> entite_metier).
// Utilisé pour les champs de recherche/suggestion (anti-doublon, anti-faute de frappe).
export const getReferentielItemsByType = async (typeId, entiteMetierId) => {
  if (!typeId) return [];
  try {
    const params = new URLSearchParams({ type_id: typeId });
    if (entiteMetierId) params.append('entite_metier_id', entiteMetierId);
    const response = await api.get(`items/?${params.toString()}`);
    return response.data?.results || response.data || [];
  } catch {
    console.warn("Referentiel items endpoint not available, returning empty array");
    return [];
  }
};


// Les anciens endpoints (/ouvrage/, /postes/, /departs/, /Localisation/)
// ont été supprimés du backend. Ils sont gérés via le système de Référence (items).
// Les fonctions ci-dessous sont gardées temporairement pour éviter de casser des
// composants qui les appelleraient, mais elles retournent un tableau vide.

export const getOuvrages = async () => [];
export const getPostes = async () => [];
export const getDeparts = async () => [];
export const getLocalisations = async () => [];

/* TRONCONS */
// Les tronçons sont une liste totalement indépendante : ils ont leur propre
// table (modèle Troncon) et leur propre endpoint `troncons/`. Ils n'ont AUCUN
// lien avec Reference ni avec ReferentielItem/TypeReferentiel.
// Ne jamais passer par `items/` ici : ReferentielItem.reference est un FK
// obligatoire, donc un POST items/ sans référence est rejeté par le backend
// avec {"reference": ["This field may not be null."]}.

export const getTroncons = async () => {
  try {
    const response = await api.get("troncons/");
    return response.data?.results || response.data || [];
  } catch {
    console.warn("Troncons endpoint not available, returning empty array");
    return [];
  }
};

export const createTroncon = async (valeur) => {
  const response = await api.post("troncons/", { valeur });
  return response.data;
};

export const updateTroncon = async (id, { valeur }) => {
  const response = await api.patch(`troncons/${id}/`, { valeur });
  return response.data;
};

export const deleteTroncon = async (id) => {
  const response = await api.delete(`troncons/${id}/`);
  return response.data;
};


// Même protection que getReferences : le filtre entite_metier_id n'est ajouté
// que si l'entité est définie (évite d'envoyer la chaîne "undefined").
export const getTypesActivite = async (entiteMetierId) => {
  try {
    const url = entiteMetierId
      ? `/types-activite/?entite_metier_id=${entiteMetierId}`
      : "/types-activite/";
    const response = await api.get(url);
    return response.data;
  } catch {
    console.warn("Types activite endpoint not available, returning empty array");
    return [];
  }
};

export const createTypeActivite = async ({ libelle, entite_metier_id }) => {
  const response = await api.post("/types-activite/", { libelle, entite_metier_id });
  return response.data;
};

export const updateTypeActivite = async (id, { libelle }) => {
  const response = await api.patch(`/types-activite/${id}/`, { libelle });
  return response.data;
};

export const deleteTypeActivite = async (id) => {
  const response = await api.delete(`/types-activite/${id}/`);
  return response.data;
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

// Même protection que getReferences : évite d'envoyer entite_metier_id=undefined.
export const getUnites = async (entiteMetierId) => {
  try {
    const url = entiteMetierId
      ? `/users/unites-demanderesses/?entite_metier_id=${entiteMetierId}`
      : `/users/unites-demanderesses/`;
    const response = await api.get(url);
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

export const createUnite = async ({ nom, entite_metier_id }) => {
  const response = await api.post("/users/unites-demanderesses/", { nom, entite_metier_id });
  return response.data;
};

export const updateUnite = async (id, { nom }) => {
  const response = await api.patch(`/users/unites-demanderesses/${id}/`, { nom });
  return response.data;
};

export const deleteUnite = async (id) => {
  const response = await api.delete(`/users/unites-demanderesses/${id}/`);
  return response.data;
};



