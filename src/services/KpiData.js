import axios from 'axios';

// Configuration de l'instance Axios avec l'URL de votre backend Django
const API_URL = 'http://127.0.0.1:8000/api/'; // À ajuster selon votre configuration Django

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const MaintenanceService = {
  // Page 1 : Disponibilité des plannings
  getPlanningsSecteur: async () => {
    const response = await apiClient.get('plannings-secteur/');
    return response.data;
  },

  // Page 3 : Disponibilité des IPPs
  getDispoIPPs: async () => {
    const response = await apiClient.get('dispo-ipps/');
    return response.data;
  },

  // Page 4 : Maintenance TRANSPORT
  getMaintenanceTransport: async () => {
    const response = await apiClient.get('maintenance-transport/');
    return response.data;
  },

  // Page 5 : Distribution POSTE SOURCE
  getDistributionPoste: async () => {
    const response = await apiClient.get('distribution-poste/');
    return response.data;
  },

  // Page 6 : Distribution RÉSEAU
  getDistributionReseau: async () => {
    const response = await apiClient.get('distribution-reseau/');
    return response.data;
  },

  // Page 7 : Impact KPI (SAIDI-SAIFI)
  getImpactKPI: async () => {
    const response = await apiClient.get('impact-kpi/');
    return response.data;
  },

  // Page 8 : Evaluation des ENDs
  getEvaluationENDs: async () => {
    const response = await apiClient.get('evaluation-ends/');
    return response.data;
  }
};