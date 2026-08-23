import api from '../API/axiosInstance';

const MOIS_FR = {
  janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
};

// Convertit "Avril 2026" en { annee: 2026, mois: 4 } pour filtrer les endpoints KPI.
const parseMoisAnnee = (selectedMonth) => {
  if (!selectedMonth) return {};
  const [nomMois, annee] = selectedMonth.trim().split(/\s+/);
  const mois = MOIS_FR[nomMois?.toLowerCase()];
  return mois && annee ? { mois, annee } : {};
};

export const MaintenanceService = {
  // Page 1 : Disponibilité des plannings
  getPlanningsSecteur: async () => {
    const response = await api.get('/plannings-secteur/');
    return response.data;
  },

  // Page 3 : Disponibilité des IPPs
  getDispoIPPs: async () => {
    const response = await api.get('/dispo-ipps/');
    return response.data;
  },

  // Page 4 : Maintenance TRANSPORT
  getMaintenanceTransport: async () => {
    const response = await api.get('/maintenance-transport/');
    return response.data;
  },

  // Page 5 : Distribution POSTE SOURCE
  getDistributionPoste: async () => {
    const response = await api.get('/distribution-poste/');
    return response.data;
  },

  // Page 6 : Distribution RÉSEAU
  getDistributionReseau: async () => {
    const response = await api.get('/distribution-reseau/');
    return response.data;
  },

  // Page 7 : Impact KPI (SAIDI-SAIFI)
  getImpactKPI: async () => {
    const response = await api.get('/impact-kpi/');
    return response.data;
  },

  // Page 8 : Evaluation des ENDs
  getEvaluationENDs: async () => {
    const response = await api.get('/evaluation-ends/');
    return response.data;
  },

  // KPI Résumé : travaux programmés / exécutés / non exécutés
  getKpiResume: async (selectedMonth) => {
    const response = await api.get('/travaux/kpi-resume/', { params: parseMoisAnnee(selectedMonth) });
    return response.data;
  },

  // KPI : nombre de travaux harmonisés
  getTravauxHarmonises: async (selectedMonth) => {
    const response = await api.get('/travaux/harmonises/', { params: parseMoisAnnee(selectedMonth) });
    return response.data;
  },

  // KPI : travaux programmés par ouvrage
  getTravauxParOuvrage: async (selectedMonth) => {
    const response = await api.get('/travaux/par-ouvrage/', { params: parseMoisAnnee(selectedMonth) });
    return response.data;
  },

  // KPI : centrales thermiques IPP vs internes
  getCentralesIppInterne: async (selectedMonth) => {
    const response = await api.get('/travaux/centrales-ipp-interne/', { params: parseMoisAnnee(selectedMonth) });
    return response.data;
  }
};
