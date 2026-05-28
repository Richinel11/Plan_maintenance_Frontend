const clean = (val) => (val === "" || val === undefined ? null : val);
const cleanStr = (val) => (val === undefined || val === null ? "" : String(val).trim());

export const mapPlanningPayload = (data) => {
  // Fonction utilitaire pour chercher une valeur dans plusieurs clés possibles (insensible à la casse)
  const find = (keys) => {
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== "") return data[key];
      // Test version minuscule
      if (data[key.toLowerCase()] !== undefined && data[key.toLowerCase()] !== "") return data[key.toLowerCase()];
      // Test version avec espaces au lieu de underscores
      const spaceKey = key.replace(/_/g, " ");
      if (data[spaceKey] !== undefined && data[spaceKey] !== "") return data[spaceKey];
    }
    return null;
  };

  // Helper pour s'assurer que la valeur est bien un ID (nombre ou UUID)
  const findId = (key) => {
     const val = data[key] || data[key.toLowerCase()];
     if (!val) return null;
     
     // Si c'est un UUID ou un nombre, c'est un ID
     if (/^[0-9a-fA-F-]{36}$/.test(String(val)) || !isNaN(Number(val))) {
         return clean(val);
     }
     return null; // C'est probablement un libellé textuel
  };

  const rawOuvrage = find(["Ouvrages", "Ouvrage", "Ouvrage_id"]);
  const rawPoste = find(["Poste", "Postes", "Poste_id"]);
  const rawDepart = find(["Departs", "Depart", "Départs", "Départ", "Depart_id"]);
  const rawTroncon = find(["Troncons", "Troncon", "Tronçon", "Tronçons", "Troncon_id"]);

  return {
    // Required
    planning_id: clean(data.planning_id),
    segment: data.segment || (data.service ? data.service.toUpperCase() : "TRANSPORT"),

    // Identifiers (ForeignKeys) - Ne doivent récupérer que les vrais IDs
    type_travaux_id: findId("type_travaux_id") || findId("Type_de_travaux"),
    entite_metier_id: findId("entite_metier_id"),
    ouvrage_id: findId("ouvrage_id"),
    poste_id: findId("poste_id"),
    depart_id: findId("depart_id"),
    troncon_id: findId("troncon_id"),
    charge_consignation_id: findId("charge_consignation_id") || findId("Charges_de_consignation"),
    centrale_thermique_sollicitee_id: findId("centrale_thermique_sollicitee_id") || findId("Centrale_thermique"),
    unite_demanderesse_id: findId("unite_demanderesse_id") || findId("Unite_demanderesse"),
    reference_id: findId("reference_id") || findId("Reference"),


    // Text fields
    reference: cleanStr(find(["reference", "Reference", "Référence", "Code"])),
    consistance_travaux: cleanStr(find(["consistance_travaux", "Consistances_Des_Travaux", "Consistance des travaux", "Description"])),
    
    // Pour troncons_consignes, on concatène les libellés si on n'a pas pu extraire d'IDs
    troncons_consignes: cleanStr(
      find(["troncons_consignes", "Troncons", "Troncon"]) || 
      [rawOuvrage, rawPoste, rawDepart, rawTroncon].filter(v => v && isNaN(Number(v)) && !/^[0-9a-fA-F-]{36}$/.test(String(v))).join(" / ")
    ),

    localites_impactees: cleanStr(find(["localites_impactees", "Localites_impactees", "Localités impactées", "Localité"])),
    moyens_mis_en_oeuvre: cleanStr(find(["moyens_mis_en_oeuvre", "Moyens_mis_en_oeuvre", "Moyens mis en oeuvre"])),
    observations: cleanStr(find(["observations", "Observations", "Obervations", "Remarques"])),
    probleme_rencontre: cleanStr(find(["probleme_rencontre"])),
    type_reseau: (() => {
      const val = find(["type_reseau", "Types_de_reseau", "Type de réseau"]);
      return val ? String(val).toUpperCase().trim() : null;
    })(),

    // Dates / Times
    heure_debut_planifie: clean(find(["heure_debut_planifie", "Debut_planifiee", "Début planifiée", "Début planifié", "Heure début"])),
    heure_fin_planifie: clean(find(["heure_fin_planifie", "Fin_planifiee", "Fin planifiée", "Fin planifié", "Heure fin"])),
    date_programmee: clean(find(["date_programmee", "Date_programmee", "Date programmée", "Date"])),
    date_report_travaux: clean(find(["date_report_travaux"])),

    // Numbers
    duree: data.Duree ? parseInt(data.Duree) : (data.duree ? parseInt(data.duree) : (data["Durée"] ? parseInt(data["Durée"]) : null)),
    unite_duree: find(["unite_duree", "Unité de durée"]) || "HEURES",
    disponibilite_mecanique_mw: clean(find(["disponibilite_mecanique_mw", "Disponibilite_mecanique", "Disponibilité mécanique"])),
    prevision_puissance_sollicitee: clean(find(["prevision_puissance_sollicitee", "Prevision_puissance_sollicite", "Puissance sollicitée"])),
    prevision_puissance_interrompue: clean(find(["prevision_puissance_interrompue", "Prevision_puissance_interrompue", "Puissance interrompue"])),
    qte_fuel_sollicitee: clean(find(["qte_fuel_sollicitee", "Qte_de_fuel", "Quantité de fuel"])),

    // Booleans
    statut_probleme: data.statut_probleme || false,
    travail_en_alignement: data.travail_en_alignement || false,

    // Statut
    statut_travaux: data.statut_travaux || "BROUILLON",
  };
};