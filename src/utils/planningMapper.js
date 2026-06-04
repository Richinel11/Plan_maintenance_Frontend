const clean = (val) => (val === "" || val === undefined ? null : val);
const cleanStr = (val) => (val === undefined || val === null ? "" : String(val).trim());

// ─────────────────────────────────────────────────────────────────────────────
// Convertisseurs de dates — harmonisation avec le format attendu par Django :
//   YYYY-MM-DDTHH:mm  (ex : 2026-05-20T08:00)
//
// Cas gérés :
//   1. Objet Date JS     → produit par XLSX avec cellDates: true
//   2. ISO existant      → YYYY-MM-DD ou YYYY-MM-DDTHH:mm (déjà correct)
//   3. Format français   → DD/MM/YYYY ou DD/MM/YYYY HH:mm (venant d'un fichier texte/CSV)
//   4. Vide / null       → null (champ non renseigné dans le fichier)
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

/**
 * Convertit n'importe quelle valeur de date/heure en chaîne ISO YYYY-MM-DDTHH:mm.
 * Retourne null si la valeur est vide ou non reconnaissable.
 */
const toISODateTime = (val) => {
  if (val === null || val === undefined || val === '') return null;

  // Cas 1 : objet Date JS (produit par XLSX cellDates: true)
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return `${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())}T${pad(val.getHours())}:${pad(val.getMinutes())}`;
  }

  const str = String(val).trim();
  if (!str) return null;

  // Cas 2 : déjà au format ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm...)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    // Si c'est une date seule, on complète avec T00:00
    return str.length === 10 ? `${str}T00:00` : str.substring(0, 16);
  }

  // Cas 3 : format français DD/MM/YYYY ou DD/MM/YYYY HH:mm
  const frMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (frMatch) {
    const [, dd, mm, yyyy, hh = '00', mi = '00'] = frMatch;
    return `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(hh)}:${pad(mi)}`;
  }

  return null; // Format inconnu → on ignore plutôt que d'envoyer une valeur invalide
};

/**
 * Convertit une valeur de date (sans heure) en chaîne ISO YYYY-MM-DD.
 * Retourne null si vide ou non reconnaissable.
 */
const toISODate = (val) => {
  const dt = toISODateTime(val);
  return dt ? dt.substring(0, 10) : null;
};

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
    
    // Tronçons consignés : champ texte libre, distincte des items de référence.
    // La clé Excel est "Tronçons" (avec cédille) — il faut la tester explicitement.
    troncons_consignes: cleanStr(
      find(["troncons_consignes", "Troncons", "Troncon", "Tronçons", "Tronçon"])
    ),

    localites_impactees: cleanStr(find(["localites_impactees", "Localites_impactees", "Localités impactées", "Localité"])),
    moyens_mis_en_oeuvre: cleanStr(find(["moyens_mis_en_oeuvre", "Moyens_mis_en_oeuvre", "Moyens mis en oeuvre"])),
    observations: cleanStr(find(["observations", "Observations", "Obervations", "Remarques"])),
    probleme_rencontre: cleanStr(find(["probleme_rencontre"])),
    type_reseau: (() => {
      // "Types_de_reseau" → spaceKey = "Types de reseau" (sans accent) ≠ "Types de réseau"
      // Il faut ajouter le label exact avec accent pour matcher la clé Excel.
      const val = find(["type_reseau", "Types_de_reseau", "Types de réseau", "Type de réseau"]);
      return val ? String(val).toUpperCase().trim() : null;
    })(),

    // Dates / Times
    // Toutes les dates passent par toISODateTime / toISODate pour garantir
    // le format YYYY-MM-DDTHH:mm attendu par Django, quel que soit le format
    // d'origine (Date JS, chaîne française, ISO partiel, etc.)
    heure_debut_planifie: toISODateTime(find(["heure_debut_planifie", "Debut_planifiee", "Début planifiée", "Début planifié", "Heure début"])),
    heure_fin_planifie:   toISODateTime(find(["heure_fin_planifie",   "Fin_planifiee",   "Fin planifiée",   "Fin planifié",   "Heure fin"])),
    date_programmee:      toISODate(find(["date_programmee", "Date_programmee", "Date programmée", "Date"])),
    date_report_travaux:  toISODate(find(["date_report_travaux"])),

    // Numbers
    duree: data.Duree ? parseInt(data.Duree) : (data.duree ? parseInt(data.duree) : (data["Durée"] ? parseInt(data["Durée"]) : null)),
    unite_duree: find(["unite_duree", "Unité de durée"]) || "HEURES",
    disponibilite_mecanique_mw: (() => {
      const val = find(["disponibilite_mecanique_mw", "Disponibilite_mecanique", "Disponibilité mécanique"]);
      if (val === null || val === undefined || val === "") return null;
      const num = parseFloat(String(val).replace(",", "."));
      return isNaN(num) ? null : num;
    })(),
    // Labels Excel avec accents ajoutés — sans eux le find() rate la clé du rowObject.
    prevision_puissance_sollicitee: clean(find([
      "prevision_puissance_sollicitee", "Prevision_puissance_sollicite",
      "Prévision puissance sollicitée", "Puissance sollicitée",
    ])),
    prevision_puissance_interrompue: clean(find([
      "prevision_puissance_interrompue", "Prevision_puissance_interrompue",
      "Prévision puissance interrompue", "Puissance interrompue",
    ])),
    prevision_enf_mwh: clean(find([
      "prevision_enf_mwh", "Prevision_ENF", "Prévision ENF",
    ])),
    // "Quantité fuel" est le label exact du template — "Quantité de fuel" ne correspond pas.
    qte_fuel_sollicitee: clean(find([
      "qte_fuel_sollicitee", "Qte_de_fuel", "Quantité fuel", "Quantité de fuel",
    ])),

    // Booleans
    statut_probleme: data.statut_probleme || false,
    travail_en_alignement: data.travail_en_alignement || false,

    // Statut
    statut_travaux: data.statut_travaux || "  CREER",
  };
};