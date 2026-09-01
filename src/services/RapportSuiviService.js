import api from '../API/axiosInstance';

/**
 * Rapport « Suivi des travaux prévisionnels » (KPI direction).
 *
 * Source unique : GET /travaux/rapport-suivi/?annee=&mois=
 * (planning/views.py -> TravailViewSet.rapport_suivi, calculs dans
 * planning/rapport_suivi_service.py).
 *
 * `mois`/`annee` désignent le « Mois M » de référence : les tuiles mensuelles
 * portent sur ce mois, les tableaux sur le cumul du 1er janvier à la fin de ce
 * mois (year-to-date).
 */
export const RapportSuiviService = {
  getRapportSuivi: async ({ annee, mois } = {}) => {
    const params = {};
    if (annee) params.annee = annee;
    if (mois) params.mois = mois;
    const response = await api.get('/travaux/rapport-suivi/', { params });
    return response.data;
  },
};

export default RapportSuiviService;
