const clean = (val) => (val === "" || val === undefined ? null : val);
const cleanStr = (val) => (val === undefined || val === null ? "" : String(val));

export const mapPlanningPayload = (data) => {
  // Fonction utilitaire pour chercher une valeur dans plusieurs clés possibles (insensible à la casse)
  const find = (keys) => {
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== "") return data[key];
      // Test version minuscule
      if (data[key.toLowerCase()] !== undefined && data[key.toLowerCase()] !== "") return data[key.toLowerCase()];
    }
    return null;
  };

  // Helper pour s'assurer que la valeur est bien un ID (nombre ou UUID) et non une chaîne descriptive comme "Exemple"
  const findId = (key) => {
     const val = data[key] || data[key.toLowerCase()];
     // Si c'est une chaîne de caractères et qu'elle n'est pas au format UUID ou nombre, c'est probablement un nom d'affichage, on renvoie null
     if (typeof val === 'string' && val.trim() !== "" && !/^[0-9a-fA-F-]{36}$/.test(val) && isNaN(Number(val))) {
         return null;
     }
     return clean(val);
  };

  return {
    // Required
    planning_id: clean(data.planning_id),
    segment: data.segment || (data.service ? data.service.toUpperCase() : "TRANSPORT"),

    // Identifiers (ForeignKeys) - Ne doivent récupérer que les vrais IDs
    type_travaux_id: findId("type_travaux_id"),
    entite_metier_id: findId("entite_metier_id"),
    ouvrage_id: findId("ouvrage_id"),
    poste_id: findId("poste_id"),
    depart_id: findId("depart_id"),
    troncon_id: findId("troncon_id"),
    charge_consignation_id: findId("charge_consignation_id"),
    centrale_thermique_sollicitee_id: findId("centrale_thermique_sollicitee_id") || findId("Centrale_thermique"),
    unite_demanderesse_id: findId("unite_demanderesse_id") || findId("Unite_demanderesse"),
    reference_id: findId("reference_id"),


    // Text fields
    reference: cleanStr(find(["reference", "Reference"])),
    consistance_travaux: cleanStr(find(["consistance_travaux", "Consistances_Des_Travaux"])),
    troncons_consignes: cleanStr(find(["troncons_consignes", "Troncons", "Ouvrages", "Poste", "Departs", "Depart", "Troncon", "Ouvrage"])), // On peut utiliser ces colonnes pour la consistance si l'ID n'est pas dispo
    localites_impactees: cleanStr(find(["localites_impactees", "Localites_impactees"])),
    moyens_mis_en_oeuvre: cleanStr(find(["moyens_mis_en_oeuvre", "Moyens_mis_en_oeuvre"])),
    observations: cleanStr(find(["observations", "Observations", "Obervations"])),
    probleme_rencontre: cleanStr(find(["probleme_rencontre"])),
    type_reseau: clean(find(["type_reseau", "Types_de_reseau"])),

    // Dates / Times
    heure_debut_planifie: clean(find(["heure_debut_planifie", "Debut_planifiee"])),
    heure_fin_planifie: clean(find(["heure_fin_planifie", "Fin_planifiee"])),
    date_programmee: clean(find(["date_programmee", "Date_programmee"])),
    date_report_travaux: clean(find(["date_report_travaux"])),

    // Numbers
    duree: data.Duree ? parseInt(data.Duree) : (data.duree ? parseInt(data.duree) : null),
    unite_duree: find(["unite_duree"]) || "HEURES",
    disponibilite_mecanique_mw: clean(find(["disponibilite_mecanique_mw", "Disponibilite_mecanique"])),
    prevision_puissance_sollicitee: clean(find(["prevision_puissance_sollicitee", "Prevision_puissance_sollicite"])),
    prevision_puissance_interrompue: clean(find(["prevision_puissance_interrompue", "Prevision_puissance_interrompue"])),
    qte_fuel_sollicitee: clean(find(["qte_fuel_sollicitee", "Qte_de_fuel"])),

    // Booleans
    statut_probleme: data.statut_probleme || false,
    travail_en_alignement: data.travail_en_alignement || false,

    // Statut
    statut_travaux: data.statut_travaux || "BROUILLON",
  };
};