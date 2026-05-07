import { useMemo } from "react";
import { MOCK_OPTIONS } from "../../config/mockData";

const ServiceSwitcher = () => {

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2
            ? parts.pop().split(";").shift()
            : "";
        };

    const service = getCookie("service") || "transport"; // "transport" par défaut pour les tests

  

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
          "Obervations",
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
        ];

      case "distribution":
        return [
          "Reference",
          "Segments",
          "Ouvrages",
          "Poste",
          "Departs",
          "Unite_demanderesse",
          "Types_de_travaux",
          "Types_de_reseau",

          "Troncons",
          "Consistances_Des_Travaux",
          "Localites_impactees",
          "Moyens_mis_en_oeuvre",
          "Charges_de_consignations",
          
          "Debut_planifiee",
          "Duree",
          "Fin_planifiee",
          "Date_programmee",
          "Jour_avant_travaux",
          
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

    return { service, fields, referenceConfig, options: MOCK_OPTIONS };
};

export default ServiceSwitcher;