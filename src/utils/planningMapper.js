export const mapPlanningPayload = (data) => {
  return {
    reference_id: data.reference_id,
    ouvrage_id: data.ouvrage_id,
    poste_id: data.poste_id,
    depart_id: data.depart_id,
    troncon_id: data.troncon_id,

    reference: data.Reference,

    unite_demanderesse: data.Unite_demanderesse,
    exploitations: data.Exploitations,
    types_de_reseau: data.Types_de_reseau,

    type_travaux_id: data.type_travaux_id,
    charge_consignation_id:
      data.charge_consignation_id,

    /* ETAPE 2 */
    troncons: data.Troncons,
    consistances_des_travaux:
      data.Consistances_Des_Travaux,

    localites_impactees:
      data.Localites_impactees,

    moyens_mis_en_oeuvre:
      data.Moyens_mis_en_oeuvre,

    /* ETAPE 3 */
    debut_planifiee:
      data.Debut_planifiee,

    duree: data.Duree,

    fin_planifiee:
      data.Fin_planifiee,

    date_programmee:
      data.Date_programmee,

    prevision_puissance_sollicite:
      data.Prevision_puissance_sollicite,

    prevision_puissance_interrompue:
      data.Prevision_puissance_interrompue,

    prevision_enf:
      data.Prevision_ENF,

    centrale_thermique:
      data.Centrale_thermique,

    qte_de_fuel:
      data.Qte_de_fuel,

    observations:
      data.Obervations,

    service: data.service,
  };
};