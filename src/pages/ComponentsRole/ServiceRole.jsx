import { useMemo, useState } from "react";

const useServiceRole = () => {

    const [service, setService] = useState("transport");

  const fields = useMemo(() => {
    switch (service.toLowerCase()) {
      case "transport":
        return [
          "Reference",
          "Segments",
          "Ouvrages",
          "Poste",
          "Type_de_travaux",
          "Unite_demanderesse",
          "Consistances_Des_Travaux",

          "Charges_de_consignation",

          "Debut_planifiee",
          "Duree",
          "Fin_planifiee",
          "Date_programmee",
          "Jour_avant_travaux",

          "Prevision_puissance_sollicite",
          "Prevision_puissance_interrompue",
          "Prevision_ENF",
          "Centrale_thermique",
          "Qte_de_fuel",
          "Observations",
        ];

      case "production":
        return [
          "Reference",
          "Segments",
          "Ouvrages",
          "Poste",
          "Type_de_travaux",
          "Unite_demanderesse",
          "Consistances_Des_Travaux",

          "Disponibilite_mecanique",

          "Debut_planifiee",
          "Duree",
          "Fin_planifiee",
          "Date_programmee",
          "Jour_avant_travaux",
          "Observations",
        ];

      case "distribution":
        return [
          "Reference",
          "Segments",
          "Ouvrages",
          "Poste",
          "Departs",
          "Unite_demanderesse",
          "Type_de_travaux",
          "Types_de_reseau",

          "Troncons",
          "Consistances_Des_Travaux",
          "Localites_impactees",
          "Moyens_mis_en_oeuvre",
          "Charges_de_consignation",
          
          "Debut_planifiee",
          "Duree",
          "Fin_planifiee",
          "Date_programmee",
          "Jour_avant_travaux",
          "Observations",
          
        ];

      default:
        return [];
    }
  }, [service]);

  // Configuration de la génération de la référence
  const referenceConfig = useMemo(() => {
    switch (service.toLowerCase()) {
      case "transport":
      case "production":
        return ["Segments", "Ouvrages", "Poste"];
      case "distribution":
        return ["Segments", "Ouvrages", "Poste", "Departs"];
      default:
        return [];
    }
  }, [service]);

    // Les options des listes déroulantes sont maintenant chargées depuis le backend
    // via getOptionsByService(service) dans ProgressBar.jsx — plus de mock data ici.
    return { service, setService, fields, referenceConfig, options: {} };
};

export default useServiceRole;