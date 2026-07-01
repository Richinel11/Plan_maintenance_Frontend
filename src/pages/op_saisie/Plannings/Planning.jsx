import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import { getCurrentUser } from "../../../services/Authservice";
import { toast } from "sonner";
import { genererDDR } from "../../../services/exploitationService";

import FileInput from "../Importer_Plannings/importation";
import readExcel from "./readFile";
import PlanningValidationBar from "../../../components/Workflow/PlanningValidationBar";

import "./Planning.css";
import "./TableauxDeBord/Tableaux.css";
import PlanningForm from "../Creer_Travail/components/PlanningForm";
import SearchBar from "../components/Filter_search/search";
import Filter from "./filterCards/filter";
import useServiceRole from "../../../pages/ComponentsRole/ServiceRole";
import { createPlanning, createTravail, updateTravail, deleteTravail, getPlanningById, getTravaux, getCentrales, terminerTravail } from "../../../services/planningService";
import { mapPlanningPayload } from "../../../utils/planningMapper";
import Etape3 from "../Creer_Travail/etape3/etape3";
import {
  getReferences,
  getTypesActivite,
  getUnites,
  getChargesConsignation,
  createReference,
  getTypesReferentiel,
  createReferentielItem,
  getReferenceById,
} from "../../../services/referencetielService";
import { getEntites } from "../../../services/userService";

import CreatePlanningModal from "./NewPlanning/CreatePlanningModal";
import ExportPlanningButton from "./ExportPlanning/ExportPlanningButton";

// Helper : retourne la liste des colonnes correspondant à un service
const getFieldsForService = (service) => {
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
};
;
// Retourne la valeur d'un ReferentielItem pour un type donné (ex: "Segment", "Ouvrage").
// Les items sont stockés dans travail.reference.items (sérialisé par ReferenceSerializer).
// Types disponibles : "Segment", "Ouvrage", "Poste", "Départ" (voir seed_referentiel.py).
const getRefItem = (travail, typeNom) => {
  const items = travail.reference?.items;
  if (!Array.isArray(items)) return "";
  const normalize = (s) =>
    (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const target = normalize(typeNom);
  const item = items.find(i => normalize(i.type?.nom) === target);
  return item?.valeur || "";
};

// Helper : Mappe un objet Travail du backend vers une ligne de tableau (tableau 1D).
//
// RÈGLE IMPORTANTE : chaque case doit toujours retourner une CHAÎNE de caractères.
// Ne jamais laisser un objet imbriqué comme valeur de retour — React ne peut pas
// rendre un objet directement dans un <td> et plante avec :
//   "Objects are not valid as a React child"
const mapTravailToExcelRow = (travail, fields) => {
  return fields.map((field) => {
    switch (field) {

      case "Reference":
        // reference est un objet {id, valeur, items, ...} → extraire .valeur
        return travail.reference?.valeur || "";

      case "Segments":
        // Le segment géographique est un ReferentielItem de type "Segment" dans la référence.
        // travail.segment contient la catégorie métier (DISTRIBUTION/TRANSPORT/PRODUCTION),
        // pas le segment réseau — on ne l'utilise qu'en dernier recours.
        return getRefItem(travail, "Segment") || travail.segment || "";

      case "Ouvrages":
        return getRefItem(travail, "Ouvrage") || travail.troncons_consignes || "";

      case "Poste":
        return getRefItem(travail, "Poste") || "";

      case "Type_de_travaux":
        return travail.type_travaux?.libelle || "";

      case "Unite_demanderesse":
        return travail.unite_demanderesse?.nom || "";

      case "Consistances_Des_Travaux":
        return travail.consistance_travaux || "";

      case "Charges_de_consignation":
        if (!travail.charge_consignation) return "";
        const cc = travail.charge_consignation;
        return cc.username || `${cc.first_name || ""} ${cc.last_name || ""}`.trim() || "";

      case "Debut_planifiee":
        return travail.heure_debut_planifie
          ? new Date(travail.heure_debut_planifie).toLocaleDateString("fr-FR")
          : "";

      case "Duree":
        return travail.duree != null ? String(travail.duree) : "";

      case "Fin_planifiee":
        return travail.heure_fin_planifie
          ? new Date(travail.heure_fin_planifie).toLocaleDateString("fr-FR")
          : "";

      case "Date_programmee":
        return travail.date_programmee || "";

      case "Jour_avant_travaux":
        // Le champ s'appelle nombre_jours_avant_travaux dans le sérialiseur Django.
        return travail.nombre_jours_avant_travaux != null ? String(travail.nombre_jours_avant_travaux) : "";

      case "Prevision_puissance_sollicite":
        return travail.prevision_puissance_sollicitee != null
          ? String(travail.prevision_puissance_sollicitee)
          : "";

      case "Prevision_puissance_interrompue":
        return travail.prevision_puissance_interrompue != null
          ? String(travail.prevision_puissance_interrompue)
          : "";

      case "Prevision_ENF":
        return travail.prevision_enf_mwh != null ? String(travail.prevision_enf_mwh) : "";

      case "Centrale_thermique":
        return travail.centrale_thermique_sollicitee?.valeur || "";

      case "Qte_de_fuel":
        return travail.qte_fuel_sollicitee != null ? String(travail.qte_fuel_sollicitee) : "";

      case "Observations":
        return travail.observations || "";

      case "Departs":
        // Le départ est un ReferentielItem de type "Départ" dans la référence.
        return getRefItem(travail, "Départ") || "";

      case "Types_de_reseau":
        return travail.type_reseau || "";

      case "Troncons":
        // Tronçons consignés : champ texte libre sur le modèle Travail.
        return travail.troncons_consignes || "";

      case "Localites_impactees":
        return travail.localites_impactees || "";

      case "Moyens_mis_en_oeuvre":
        return travail.moyens_mis_en_oeuvre || "";

      case "Disponibilite_mecanique":
        return travail.disponibilite_mecanique_mw != null
          ? String(travail.disponibilite_mecanique_mw)
          : "";

      default:
        return "";
    }
  });
};


const ExcelDisplay = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { service, setService, fields, options/*, referenceConfig*/ } = useServiceRole();
  const [addStep, setAddStep] = useState(0);

  // ... other states

const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);



  const activeRoleName = Cookies.get('activeRoleName') || '';
  const isResponsable = activeRoleName.toUpperCase().replace(/[\s']/g, '_').includes('RESPONSABLE') &&
                        activeRoleName.toUpperCase().replace(/[\s']/g, '_').includes('EXPLOIT');

  const [fileName, setFileName] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [showImport, setShowImport] = useState(true);
  const [fade, setFade] = useState("fade-in");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [editData, setEditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);

  /* PLANNING DETAIL STATE FOR READ-ONLY MODE */
  const [loadingPlanning, setLoadingPlanning] = useState(false);
  const [planningDetail, setPlanningDetail] = useState(null);

  /* ENTITES METIER */
  const [entites, setEntites] = useState([]);

  /* UTILISATEURS — Chargés de consignation */
  const [users, setUsers] = useState([]);

  /* REFERENTIEL DATA */
  const [references, setReferences] = useState([]);
  const [unites, setUnites] = useState([]);
  const [typesActivite, setTypesActivite] = useState([]);
  const [centrales, setCentrales] = useState([]);

  /* SUBMISSION PROGRESS */
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState("");

  /* MODE ÉDITION TRAVAIL */
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTravailId, setEditingTravailId] = useState(null);

  /* PAGINATION */
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  /* FILTRES AVANCÉS */
  const [filterType, setFilterType] = useState("");
  const [filterReseau, setFilterReseau] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  /* WARNINGS — Références introuvables */
  const [rowWarnings, setRowWarnings] = useState([]);
  const [activeWarningIdx, setActiveWarningIdx] = useState(0);
  const [warningModal, setWarningModal] = useState(null);
  const [warningTab, setWarningTab] = useState("select");
  const [refSearch, setRefSearch] = useState("");
  const [selectedRefId, setSelectedRefId] = useState("");
  const [newRefValeur, setNewRefValeur] = useState("");
  const [newRefEntiteId, setNewRefEntiteId] = useState("");
  const [savingRef, setSavingRef] = useState(false);

  /* TYPES RÉFÉRENTIEL — pour créer les items (Segment, Ouvrage, Poste, Départ) */
  const [typesReferentiel, setTypesReferentiel] = useState([]);
  const [newItemSegment, setNewItemSegment] = useState("");
  const [newItemOuvrage, setNewItemOuvrage] = useState("");
  const [newItemPoste, setNewItemPoste] = useState("");
  const [newItemDepart, setNewItemDepart] = useState("");
  const rowRefs = useRef({});

  /* MULTI-SÉLECTION — Validation en lot */
  const [selectedTravailIds, setSelectedTravailIds] = useState(new Set());
  const [isValidatingBatch, setIsValidatingBatch] = useState(false);

  // const step = addStep;
  // const filteredFields = fields ? fields.filter(f => f.step === step) : [];
  const [planningFormData, setPlanningFormData] = useState({
    Reference: "",
    reference_id: null,
    ouvrage_id: null,
    poste_id: null,
    depart_id: null,
    troncon_id: null,

    Segments: "",
    Ouvrages: "",
    Poste: "",
    Departs: "",

    Unite_demanderesse: "",
    unite_demanderesse_id: null,
    Exploitations: "",
    Type_de_travaux: "",
    Types_de_reseau: "",

    service: "",
  });

  /* LOAD REFERENTIEL & ENTITES */
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // const user = getCurrentUser();
        // const entiteMetierId = user?.entite_metier?.id;

        const [refs, tps, units, ents, centralesData, chargesData, typesRef] = await Promise.all([
          getReferences(),
          getTypesActivite(),
          getUnites(),
          getEntites(),
          getCentrales(),
          getChargesConsignation(),
          getTypesReferentiel(),
        ]);
        setReferences(Array.isArray(refs) ? refs : (refs?.results || []));
        setTypesActivite(Array.isArray(tps) ? tps : (tps?.results || []));
        setUnites(Array.isArray(units) ? units : (units?.results || []));
        setEntites(Array.isArray(ents) ? ents : (ents?.results || []));
        setCentrales(Array.isArray(centralesData) ? centralesData : (centralesData?.results || []));
        setUsers(Array.isArray(chargesData) ? chargesData : (chargesData?.results || chargesData?.data || []));
        setTypesReferentiel(Array.isArray(typesRef) ? typesRef : (typesRef?.results || []));
      } catch (err) { console.error("Referentiel load error", err); }
    };
    fetchData();
  }, []);

  /* CALCUL AUTO — Fin planifiée et Jours avant travaux (copie exacte de ProgressBar.jsx) */
  useEffect(() => {
    let updates = {};

    if (planningFormData.Debut_planifiee && planningFormData.Duree) {
      const start = new Date(planningFormData.Debut_planifiee);
      const end = new Date(start.getTime() + planningFormData.Duree * 60 * 60 * 1000);
      const endStr = end.toLocaleString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      if (planningFormData.Fin_planifiee !== endStr) {
        updates.Fin_planifiee = endStr;
      }
    }

    if (planningFormData.Debut_planifiee && planningFormData.Date_programmee) {
      const start = new Date(planningFormData.Debut_planifiee);
      const programmed = new Date(planningFormData.Date_programmee);
      start.setHours(0, 0, 0, 0);
      programmed.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((start.getTime() - programmed.getTime()) / (1000 * 60 * 60 * 24));
      if (planningFormData.Jour_avant_travaux !== diffDays) {
        updates.Jour_avant_travaux = diffDays;
      }
    }

    if (Object.keys(updates).length > 0) {
      setPlanningFormData((prev) => ({ ...prev, ...updates }));
    }
  }, [
    planningFormData.Debut_planifiee,
    planningFormData.Duree,
    planningFormData.Date_programmee,
    planningFormData.Fin_planifiee,
    planningFormData.Jour_avant_travaux,
  ]);

  /* CHARGEMENT DU PLANNING EXISTANT — extrait en useCallback pour pouvoir
     être rappelé après une génération DDR en lot sans remonter l'effect. */
  const loadExistingPlanning = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingPlanning(true);

      const [planning, listTravaux] = await Promise.all([
        getPlanningById(id),
        getTravaux(id),
      ]);

      setPlanningDetail(planning);

      const planningService = (
          planning.entite_metier?.name?.toLowerCase()
          || planning.service
          || planning.segment?.toLowerCase()
          || "transport"
      );
      setService(planningService);
      setFileName(planning.nom || planning.name || "");

      const serviceFromTravaux = listTravaux[0]?.segment?.toLowerCase();
      const finalService = planningService !== "transport"
          ? planningService
          : (serviceFromTravaux || planningService);

      const fieldsForService = getFieldsForService(finalService);

      const mappedRows = listTravaux.map((t) => {
        const row = mapTravailToExcelRow(t, fieldsForService);
        row.__id = t.id;
        row.__travail = t;
        return row;
      });

      setExcelData([fieldsForService, ...mappedRows]);
      setShowImport(false);
    } catch (err) {
      console.error("Erreur lors du chargement du planning existant:", err);
      toast.error("Impossible de charger les détails de ce planning.");
    } finally {
      setLoadingPlanning(false);
    }
  }, [id, setService]);

  useEffect(() => {
    loadExistingPlanning();
  }, [loadExistingPlanning]);


  /* =========================================================
      WARNINGS — Calcul et navigation
  ========================================================= */

  const norm = useCallback((s) =>
    String(s).trim().replace(/\s+/g, " ").toLowerCase(), []);

  // Normalise un header pour comparer sans accent ni casse.
  // Permet de matcher "Reference" ET "Référence" (label Excel avec accent).
  const normHeader = useCallback((h) =>
    String(h).toLowerCase()
      .replace(/[éèêë]/g, "e").replace(/[àâ]/g, "a")
      .replace(/[îï]/g, "i").replace(/[ôö]/g, "o")
      .replace(/[ùûü]/g, "u").replace(/ç/g, "c")
      .trim()
  , []);

  // Calcule la liste des warnings : une cellule "Reference" est en warning si sa
  // valeur ne correspond à aucune Reference en base (comparaison normalisée).
  const computeWarnings = useCallback((dataRows, hdrs, refs) => {
    if (!Array.isArray(refs) || refs.length === 0 || !Array.isArray(hdrs)) return [];
    // Cherche la colonne "Référence" ou "Reference" sans tenir compte des accents.
    const refColIdx = hdrs.findIndex(h => normHeader(h) === "reference");
    if (refColIdx === -1) return [];

    const warns = [];
    dataRows.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) return;
      const cellValue = row[refColIdx];
      if (!cellValue || String(cellValue).trim() === "") return;

      const normalizedCell = norm(cellValue);
      const found = refs.find(r =>
        norm(r.valeur) === normalizedCell ||
        norm(r.valeur).startsWith(normalizedCell) ||
        normalizedCell.startsWith(norm(r.valeur))
      );
      if (!found) {
        warns.push({ rowIndex, colIndex: refColIdx, value: String(cellValue) });
      }
    });
    return warns;
  }, [norm, normHeader]);

  // Navigation entre warnings — scroll vers la ligne cible.
  const navWarning = useCallback((direction) => {
    if (rowWarnings.length === 0) return;
    const newIdx = (activeWarningIdx + direction + rowWarnings.length) % rowWarnings.length;
    setActiveWarningIdx(newIdx);
    const target = rowWarnings[newIdx];
    rowRefs.current[target.rowIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeWarningIdx, rowWarnings]);

  // Ouvrir le modal de résolution pour un warning donné.
  const openWarningModal = useCallback((warning) => {
    setWarningModal(warning);
    setWarningTab("select");
    setRefSearch("");
    setSelectedRefId("");
    setNewRefValeur(warning.value);
    const defaultEntite = entites.find(e => e.name.toLowerCase() === service);
    setNewRefEntiteId(defaultEntite?.id || "");

    // Lire les valeurs directement depuis la ligne du tableau.
    // excelData[0] = headers, excelData[warning.rowIndex + 1] = la ligne en warning.
    const hdrs = excelData[0] || [];
    const row  = excelData[warning.rowIndex + 1] || [];

    // Cherche l'index d'une colonne parmi plusieurs noms possibles (insensible à la casse
    // et aux underscores/espaces). Retourne la valeur de la cellule ou "".
    const getColValue = (candidates) => {
      const norm = (s) => String(s).toLowerCase().replace(/_/g, " ").trim();
      for (const name of candidates) {
        const idx = hdrs.findIndex(h => norm(h) === norm(name));
        if (idx !== -1 && row[idx]) return String(row[idx]);
      }
      return "";
    };

    setNewItemSegment(getColValue(["Segments", "Segment"]));
    setNewItemOuvrage(getColValue(["Ouvrages", "Ouvrage"]));
    setNewItemPoste(getColValue(["Poste", "Postes"]));
    setNewItemDepart(getColValue(["Departs", "Départs", "Depart", "Départ"]));
  }, [entites, service, excelData]);

  // Appliquer une référence existante sélectionnée.
  // rows[rowIndex] = excelData[rowIndex + 1] (les headers sont à l'index 0).
  // On utilise rowIndex+1 directement pour éviter une dépendance sur `rows`
  // qui est défini plus bas dans le composant (useMemo).
  const applyExistingRef = useCallback(() => {
    if (!selectedRefId || !warningModal) return;
    const ref = references.find(r => r.id === selectedRefId);
    if (!ref) return;

    const excelRowIndex = warningModal.rowIndex + 1;
    if (excelRowIndex >= excelData.length) return;

    const updated = [...excelData];
    const newRow = [...updated[excelRowIndex]];
    newRow[warningModal.colIndex] = ref.valeur;
    updated[excelRowIndex] = newRow;
    setExcelData(updated);
    setWarningModal(null);
  }, [selectedRefId, warningModal, references, excelData]);

  // Créer une nouvelle référence puis l'appliquer à la cellule.
  const createAndApplyRef = useCallback(async () => {
    if (!newRefValeur.trim() || !warningModal) return;
    setSavingRef(true);
    try {
      // 1. Créer la Reference
      const newRef = await createReference({
        valeur: newRefValeur.trim(),
        entite_metier_id: newRefEntiteId || null,
      });

      // 2. Créer les items renseignés (Segment, Ouvrage, Poste, Départ)
      const findType = (nom) =>
        typesReferentiel.find(t => t.nom.toLowerCase() === nom.toLowerCase());

      const itemsToCreate = [
        { valeur: newItemSegment, nom: "Segment" },
        { valeur: newItemOuvrage, nom: "Ouvrage" },
        { valeur: newItemPoste,   nom: "Poste" },
        { valeur: newItemDepart,  nom: "Départ" },
      ].filter(item => item.valeur.trim());

      for (const item of itemsToCreate) {
        const type = findType(item.nom);
        if (type) {
          await createReferentielItem({
            valeur: item.valeur.trim(),
            reference_id: newRef.id,
            type_id: type.id,
          });
        }
      }

      // 3. Recharger la référence complète (avec ses items) avant de l'ajouter à la liste
      const fullRef = await getReferenceById(newRef.id);
      setReferences(prev => [...prev, fullRef]);

      // 4. Appliquer la valeur dans la cellule du tableau
      const excelRowIndex = warningModal.rowIndex + 1;
      if (excelRowIndex < excelData.length) {
        const updated = [...excelData];
        const newRow = [...updated[excelRowIndex]];
        newRow[warningModal.colIndex] = fullRef.valeur;
        updated[excelRowIndex] = newRow;
        setExcelData(updated);
      }

      const nbItems = itemsToCreate.length;
      toast.success(`Référence créée avec ${nbItems} item${nbItems > 1 ? "s" : ""}.`);
      setWarningModal(null);
    } catch (err) {
      toast.error("Impossible de créer la référence : " + (err?.response?.data?.valeur?.[0] || err.message));
    } finally {
      setSavingRef(false);
    }
  }, [newRefValeur, newRefEntiteId, warningModal, excelData, newItemSegment, newItemOuvrage, newItemPoste, newItemDepart, typesReferentiel]);

/* OPTIONS STABLES — memoïsées pour éviter que SearchableSelect
   se réinitialise à chaque re-render de Planning.jsx */
const planningFormOptions = useMemo(() => ({
  ...options,
  Unite_demanderesse: unites,
  Charges_de_consignation: users,
  Centrale_thermique: centrales,
}), [options, unites, users, centrales]);

/* RÉFÉRENCES FILTRÉES PAR ENTITÉ MÉTIER COURANTE — utilisées dans le modal d'ajout
   pour n'afficher que les références du service en cours d'import. */
const referencesForModal = useMemo(() => {
  if (!service || !entites.length) return references;
  const entite = entites.find(e => e.name.toLowerCase() === service.toLowerCase());
  if (!entite) return references;
  return references.filter(r => r.entite_metier?.id === entite.id);
}, [references, service, entites]);

const handleOpenAddModal = () => {
  setPlanningFormData({
    Reference: "",
    reference_id: null,
    ouvrage_id: null,
    poste_id: null,
    depart_id: null,
    troncon_id: null,
    Segments: "",
    Ouvrages: "",
    Poste: "",
    Departs: "",
    Unite_demanderesse: "",
    Exploitations: "",
    Type_de_travaux: "",
    Types_de_reseau: "",
    service: service,
  });

  setAddStep(0); // ✅ IMPORTANT
  setIsPlanningModalOpen(true);
};

const handlePlanningChange = (field, value) => {
  setPlanningFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const addSteps = [
  {
    title: "Identification & Organisation",
    content: (
      <PlanningForm
        formData={planningFormData}
        onChange={handlePlanningChange}
        service={service}
        fields={fields}
        options={planningFormOptions}
        references={referencesForModal}
        onReferenceChange={(val) => {
          const selectedRef = referencesForModal.find(r => r.id === Number(val));
          if (selectedRef) {
            handlePlanningChange("reference_id", val);
            handlePlanningChange("ouvrage_id", selectedRef.ouvrage_id);
            handlePlanningChange("poste_id", selectedRef.poste_id);
            handlePlanningChange("depart_id", selectedRef.depart_id);
            handlePlanningChange("troncon_id", selectedRef.troncon_id);
          }
        }}
        typesActivite={typesActivite}
      />
    ),
  },

  {
    title: "Programmation & Impact",
    content: (
      <Etape3
        formData={planningFormData}
        onChange={handlePlanningChange}
        fields={fields}
        options={planningFormOptions}
      />
    ),
  },
];

// Étapes pour l'édition : calquées sur ProgressBar.jsx (le vrai formulaire de création).
// ProgressBar utilise PlanningForm → Etape3 directement (Etape2 n'existe pas dans ce flux).
// On supprime aussi le Récapitulatif (inutile en édition).
const editSteps = [
  {
    title: "Identification & Organisation",
    content: (
      <PlanningForm
        formData={planningFormData}
        onChange={handlePlanningChange}
        service={service}
        fields={fields}
        options={planningFormOptions}
        references={references}
        onReferenceChange={(val) => {
          const selectedRef = references.find(r => r.id === Number(val));
          if (selectedRef) {
            handlePlanningChange("reference_id", val);
            handlePlanningChange("ouvrage_id", selectedRef.ouvrage_id);
            handlePlanningChange("poste_id", selectedRef.poste_id);
            handlePlanningChange("depart_id", selectedRef.depart_id);
            handlePlanningChange("troncon_id", selectedRef.troncon_id);
          }
        }}
        typesActivite={typesActivite}
      />
    ),
  },
  {
    title: "Programmation & Impact",
    content: (
      <Etape3
        formData={planningFormData}
        onChange={handlePlanningChange}
        fields={fields}
        options={planningFormOptions}
      />
    ),
  },
];

// Étapes actives selon le mode (création ou édition).
const activeSteps = isEditMode ? editSteps : addSteps;

const nextStep = () => {
  setAddStep((prev) => Math.min(prev + 1, activeSteps.length - 1));
};

const prevStep = () => {
  setAddStep((prev) => Math.max(prev - 1, 0));

};
  /* ---------------- IMPORT ---------------- */

  const handleContinue = () => {
    setFade("fade-out");

    setTimeout(() => {
      setShowImport(false);
    }, 300);
  };

  const handleFileSelect = async (file) => {
    try {
      setFileName(file.name);
      const data = await readExcel(file);
      setExcelData(data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'importation du fichier. Vérifiez le format.");
    }
  };

  /* ---------------- HEADERS / ROWS ---------------- */

  const headers = useMemo(() => {
    if (excelData.length > 0) {
      return excelData[0];
    }
    return fields || [];
  }, [excelData, fields]);

  const rows = useMemo(() => {
    return excelData.length > 1
      ? excelData.slice(1)
      : (excelData.length === 1 && !showImport ? excelData : []);
  }, [excelData, showImport]);

  /* ---------------- SEARCH & FILTRES ---------------- */

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!Array.isArray(row)) return false;

      // ── Recherche texte ──
      if (searchTerm.trim()) {
        const matches = row.some((cell) =>
          String(cell).toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!matches) return false;
      }

      // Helper : valeur d'une cellule par nom de colonne (mode import)
      const getCell = (fieldName) => {
        const idx = headers.findIndex(h => h === fieldName);
        return idx !== -1 ? String(row[idx] || "").toLowerCase() : "";
      };

      // ── Type de travaux ──
      if (filterType) {
        const val = row.__travail
          ? (row.__travail.type_travaux?.libelle || "").toLowerCase()
          : getCell("Type_de_travaux");
        if (!val.includes(filterType.toLowerCase())) return false;
      }

      // ── Type de réseau ──
      if (filterReseau) {
        const val = row.__travail
          ? (row.__travail.type_reseau || "").toLowerCase()
          : getCell("Types_de_reseau");
        if (!val.includes(filterReseau.toLowerCase())) return false;
      }

      // ── Statut (mode visualisation uniquement) ──
      if (filterStatut && row.__travail) {
        const val = (row.__travail.statut_travaux || "").toLowerCase();
        if (!val.includes(filterStatut.toLowerCase())) return false;
      }

      // ── Période (mode visualisation uniquement) ──
      if ((filterDateFrom || filterDateTo) && row.__travail) {
        const debutStr = row.__travail.heure_debut_planifie;
        if (debutStr) {
          const debut = new Date(debutStr);
          if (filterDateFrom && debut < new Date(filterDateFrom)) return false;
          if (filterDateTo && debut > new Date(filterDateTo + "T23:59:59")) return false;
        }
      }

      return true;
    });
  }, [rows, searchTerm, filterType, filterReseau, filterStatut, filterDateFrom, filterDateTo, headers]);

  // Reset de page quand la recherche ou les filtres changent.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterReseau, filterStatut, filterDateFrom, filterDateTo, excelData]);

  // Lignes éligibles à la sélection (viz mode, sans DDR existante).
  const selectableRows = filteredRows.filter(r => r.__travail && !r.__travail.demande_retrait);

  // Lignes affichées sur la page courante.
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  // Recalcule les warnings APRÈS la définition de rows et headers.
  useEffect(() => {
    if (!showImport && rows.length > 0 && references.length > 0) {
      const warns = computeWarnings(rows, headers, references);
      setRowWarnings(warns);
      setActiveWarningIdx(0);
    } else {
      setRowWarnings([]);
    }
  }, [rows, references, showImport, computeWarnings, headers]);

  /* ---------------- EDIT ---------------- */

  const handleEditRow = (rowIndex) => {
    setSelectedRowIndex(rowIndex);
    setEditData([...rows[rowIndex]]);
    setIsModalOpen(true);
  };

  const handleEditChange = (
    cellIndex,
    value
  ) => {
    const updated = [...editData];
    updated[cellIndex] = value;
    setEditData(updated);
  };

  const handleSaveEdit = () => {
    const updatedExcelData = [...excelData];
    // Si on a des headers en index 0
    const targetIndex = excelData.length > rows.length ? selectedRowIndex + 1 : selectedRowIndex;
    updatedExcelData[targetIndex] = editData;
    setExcelData(updatedExcelData);
    setIsModalOpen(false);
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteRow = (rowIndex) => {
    toast.warning("Supprimer cette ligne ?", {
      description: "Cette action est irréversible.",
      duration: 6000,
      action: {
        label: "Confirmer",
        onClick: () => {
          const targetIndex = excelData.length > rows.length ? rowIndex + 1 : rowIndex;
          const updated = excelData.filter((_, index) => index !== targetIndex);
          setExcelData(updated);
        }
      },
      cancel: {
        label: "Annuler",
        onClick: () => {}
      }
    });
  };

  /* ----------------------------------------------------------------
      MODE VISUALISATION — Modifier / Supprimer un travail en base
  ---------------------------------------------------------------- */

  // Ouvrir le formulaire multi-étapes pré-rempli pour modifier un travail existant.
  const handleEditRowDetail = (row) => {
    const t = row.__travail;
    if (!t) { toast.error("Données du travail introuvables."); return; }

    // Pré-remplissage du formulaire depuis le travail Django.
    // Les IDs FK (reference_id, type_travaux_id…) permettent aux dropdowns
    // de pré-sélectionner la bonne valeur.
    setPlanningFormData({
      Reference:                  t.reference?.valeur || "",
      reference_id:               t.reference?.id || null,
      ouvrage_id:                 null,
      poste_id:                   null,
      depart_id:                  null,
      troncon_id:                 null,

      Segments:                   getRefItem(t, "Segment") || t.segment || "",
      Ouvrages:                   getRefItem(t, "Ouvrage") || t.troncons_consignes || "",
      Poste:                      getRefItem(t, "Poste")   || "",
      Departs:                    getRefItem(t, "Départ")  || "",
      Troncons:                   t.troncons_consignes     || "",

      Unite_demanderesse:         t.unite_demanderesse?.nom  || "",
      unite_demanderesse_id:      t.unite_demanderesse?.id   || null,

      Type_de_travaux:            t.type_travaux?.libelle    || "",
      type_travaux_id:            t.type_travaux?.id         || null,

      Types_de_reseau:            t.type_reseau              || "",
      Consistances_Des_Travaux:   t.consistance_travaux      || "",
      Localites_impactees:        t.localites_impactees      || "",
      Moyens_mis_en_oeuvre:       t.moyens_mis_en_oeuvre     || "",
      charge_consignation_id:     t.charge_consignation?.id  || null,
      Obervations:                t.observations             || "",

      Debut_planifiee:            t.heure_debut_planifie     ? t.heure_debut_planifie.substring(0, 16) : "",
      Duree:                      t.duree != null ? String(t.duree) : "",
      Date_programmee:            t.date_programmee          ? t.date_programmee.substring(0, 10) : "",

      // Transport
      Prevision_puissance_sollicite:    t.prevision_puissance_sollicitee  != null ? String(t.prevision_puissance_sollicitee)  : "",
      Prevision_puissance_interrompue:  t.prevision_puissance_interrompue != null ? String(t.prevision_puissance_interrompue) : "",
      Prevision_ENF:                    t.prevision_enf_mwh               != null ? String(t.prevision_enf_mwh)               : "",
      Centrale_thermique:               t.centrale_thermique_sollicitee?.id  || null,
      Qte_de_fuel:                      t.qte_fuel_sollicitee             != null ? String(t.qte_fuel_sollicitee)             : "",

      // Production
      Disponibilite_mecanique:    t.disponibilite_mecanique_mw != null ? String(t.disponibilite_mecanique_mw) : "",

      service,
    });

    setIsEditMode(true);
    setEditingTravailId(row.__id);
    setAddStep(0);
    setIsPlanningModalOpen(true);
  };

  // Sauvegarder via PATCH /travaux/<id>/ depuis le formulaire multi-étapes.
  const handleSavePlanningEdit = async () => {
    if (!editingTravailId) return;

    const payload = mapPlanningPayload({ ...planningFormData, service });
    delete payload.planning_id;
    delete payload.statut_travaux;

    try {
      const response = await updateTravail(editingTravailId, payload);
      const updatedTravail = response.data;

      // Recalculer la ligne du tableau depuis les données fraîches retournées par le backend.
      const fieldsForService = getFieldsForService(service);
      const newRow = mapTravailToExcelRow(updatedTravail, fieldsForService);
      newRow.__id = updatedTravail.id;
      newRow.__travail = updatedTravail;

      // Remplacer l'ancienne ligne dans excelData.
      const targetRow = rows.find(r => r.__id === editingTravailId);
      const excelRowIndex = excelData.indexOf(targetRow);
      if (excelRowIndex !== -1) {
        const updated = [...excelData];
        updated[excelRowIndex] = newRow;
        setExcelData(updated);
      }

      toast.success("Travail mis à jour avec succès.");
      setIsPlanningModalOpen(false);
      setIsEditMode(false);
      setEditingTravailId(null);
    } catch (err) {
      const detail = err?.response?.data;
      const msg = typeof detail === "object"
        ? Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join(" | ")
        : err.message;
      toast.error("Erreur : " + msg);
    }
  };

  // Valider un travail (Responsable) : PATCH + génération DDR + redirection vers la page DDR.
  const handleValiderTravail = async () => {
    if (!editingTravailId) return;

    const payload = mapPlanningPayload({ ...planningFormData, service });
    delete payload.planning_id;
    delete payload.statut_travaux;

    try {
      const response = await updateTravail(editingTravailId, payload);
      const updatedTravail = response.data;

      const fieldsForService = getFieldsForService(service);
      const newRow = mapTravailToExcelRow(updatedTravail, fieldsForService);
      newRow.__id = updatedTravail.id;
      newRow.__travail = updatedTravail;

      const targetRow = rows.find(r => r.__id === editingTravailId);
      const excelRowIndex = excelData.indexOf(targetRow);
      if (excelRowIndex !== -1) {
        const updated = [...excelData];
        updated[excelRowIndex] = newRow;
        setExcelData(updated);
      }

      // Génération de la DDR
      const ddrResponse = await genererDDR(editingTravailId);
      const ddr = ddrResponse.data;

      setIsPlanningModalOpen(false);
      setIsEditMode(false);
      setEditingTravailId(null);

      toast.success("Travail validé. Redirection vers la DDR...");
      navigate(`/dashboard/ddr/${ddr.id}`);
    } catch (err) {
      const detail = err?.response?.data;
      const msg = typeof detail === "object"
        ? Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join(" | ")
        : err.message;
      toast.error("Erreur : " + msg);
    }
  };

  // Supprimer un travail via DELETE /travaux/<id>/ avec confirmation.
  const handleDeleteRowDetail = (row) => {
    const travailId = row.__id;
    if (!travailId) {
      toast.error("Identifiant du travail introuvable.");
      return;
    }

    toast.warning("Supprimer ce travail ?", {
      description: "Cette action est irréversible.",
      duration: 6000,
      action: {
        label: "Confirmer",
        onClick: async () => {
          try {
            await deleteTravail(travailId);
            // Retirer la ligne du tableau local.
            const excelRowIndex = excelData.indexOf(row);
            if (excelRowIndex !== -1) {
              setExcelData(excelData.filter((_, i) => i !== excelRowIndex));
            }
            toast.success("Travail supprimé.");
          } catch (err) {
            toast.error("Suppression impossible : " + (err?.response?.data?.detail || err.message));
          }
        }
      },
      cancel: { label: "Annuler", onClick: () => {} }
    });
  };

  // Marquer un travail comme terminé (NAPT diffusée → bouton Terminer).
  const handleTerminer = (row) => {
    const travail = row.__travail;
    if (!travail?.id) return;
    toast.warning(`Confirmer la fin du travail "${travail.reference?.valeur || ''}" ?`, {
      duration: 6000,
      action: {
        label: "Confirmer",
        onClick: async () => {
          try {
            await terminerTravail(travail.id);
            const idx = excelData.indexOf(row);
            if (idx !== -1) {
              const newRow = [...row];
              newRow.__travail = { ...travail, statut_travaux: 'TERMINE' };
              newRow.__id = row.__id;
              const updated = [...excelData];
              updated[idx] = newRow;
              setExcelData(updated);
            }
            toast.success("Travail marqué comme terminé.");
          } catch (err) {
            toast.error("Erreur : " + (err?.response?.data?.detail || err.message));
          }
        }
      },
      cancel: { label: "Annuler", onClick: () => {} }
    });
  };

  /* ---------------- VALIDATION EN LOT (multi-sélection) ---------------- */

  const handleValiderSelection = async () => {
    if (selectedTravailIds.size === 0) return;
    setIsValidatingBatch(true);

    const newDDRIds = [];
    let errorCount = 0;

    for (const travailId of selectedTravailIds) {
      try {
        const res = await genererDDR(travailId);
        newDDRIds.push(res.data.id);
      } catch (err) {
        errorCount++;
        const msg = err?.response?.data?.error || err?.response?.data?.detail || err.message;
        console.error(`Erreur génération DDR pour travail ${travailId}:`, msg);
      }
    }

    setIsValidatingBatch(false);
    setSelectedTravailIds(new Set());

    if (errorCount > 0) {
      toast.error(`${errorCount} DDR(s) n'ont pas pu être générée(s).`);
    }
    if (newDDRIds.length > 0) {
      toast.success(`${newDDRIds.length} DDR(s) générée(s). Redirection vers l'historique...`);
      navigate('/dashboard/historique', { state: { newDDRIds } });
    } else {
      await loadExistingPlanning();
    }
  };

  /* ---------------- ADD ROW ---------------- */

// Correspondance libellé Excel (template français) → clé planningFormData.
// Nécessaire car les headers du fichier importé sont des libellés français
// ("Référence", "Début planifiée"...) alors que planningFormData utilise
// les clés internes ("Reference", "Debut_planifiee"...).
const HEADER_TO_FORM_KEY = {
  "Référence":                      "Reference",
  "Segments":                       "Segments",
  "Ouvrages":                       "Ouvrages",
  "Poste":                          "Poste",
  "Départs":                        "Departs",
  "Unité demanderesse":             "Unite_demanderesse",
  "Type de travaux":                "Type_de_travaux",
  "Types de réseau":                "Types_de_reseau",
  "Tronçons":                       "Troncons",
  "Consistance des travaux":        "Consistances_Des_Travaux",
  "Charges de consignation":        "Charges_de_consignation_label",
  "Début planifiée":                "Debut_planifiee",
  "Durée":                          "Duree",
  "Fin planifiée":                  "Fin_planifiee",
  "Date programmée":                "Date_programmee",
  "Jour avant travaux":             "Jour_avant_travaux",
  "Prévision puissance sollicitée": "Prevision_puissance_sollicite",
  "Prévision puissance interrompue":"Prevision_puissance_interrompue",
  "Prévision ENF":                  "Prevision_ENF",
  "Centrale thermique":             "Centrale_thermique_label",
  "Quantité fuel":                  "Qte_de_fuel",
  "Observations":                   "Observations",
  "Localités impactées":            "Localites_impactees",
  "Moyens mis en oeuvre":           "Moyens_mis_en_oeuvre",
  "Disponibilité mécanique":        "Disponibilite_mecanique",
  // Clés internes (si headers viennent de getFieldsForService)
  "Charges_de_consignation":        "Charges_de_consignation_label",
  "Centrale_thermique":             "Centrale_thermique_label",
};

const handleAddPlanningRow = () => {
  const row = headers.map((header) => {
    const key = HEADER_TO_FORM_KEY[header] ?? header;
    return planningFormData[key] ?? "";
  });
  
  // On attache l'objet complet comme "métadonnée" à la fin de la ligne
  const rowWithMetadata = [...row];
  rowWithMetadata.__metadata = { ...planningFormData };
  
  if (excelData.length === 0 && !showImport) {
     setExcelData([headers, rowWithMetadata]);
  } else {
     setExcelData((prev) => [...prev, rowWithMetadata]);
  }
  setIsPlanningModalOpen(false);
};

  /* ---------------- CONVERT EXCEL ROW ---------------- */

  const convertRowToObject = (
    headersArray,
    rowArray
  ) => {
    const obj = {};
    headersArray.forEach((header, index) => {
      obj[header] = rowArray[index];
    });
    
    // Si la ligne a des métadonnées (saisie manuelle), on les fusionne
    if (rowArray.__metadata) {
      return { ...rowArray.__metadata, ...obj };
    }
    
    return obj;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!rows.length) {
      toast.error("Aucune donnée à soumettre. Ajoutez des lignes avant de valider.");
      return;
    }

    setIsSubmissionModalOpen(true);
    setSubmissionProgress(0);
    setSubmissionStatus("Création du planning...");

    try {
      setLoading(true);

      // Déterminer l'entité métier correspondant au service sélectionné
      const selectedEntite = entites.find(e => e.name.toLowerCase() === service.toLowerCase());
      const entiteMetierId = selectedEntite ? selectedEntite.id : null;

      if (!entiteMetierId) {
        console.warn(`Aucune entité métier trouvée pour le service : ${service}`);
      }

      // 1. Créer le planning
      const planningResponse = await createPlanning({
        nom: fileName || "Nouveau Planning",
        entite_metier_id: entiteMetierId
      });
      
      const planningId = planningResponse.data.id;
      setSubmissionProgress(10);
      setSubmissionStatus("Planning créé. Envoi des travaux...");

      // 2. Préparer les travaux
      // On s'assure de ne pas envoyer l'entête si elle est présente dans rows
      const dataRows = rows.filter(row => row !== headers);
      const totalToSubmit = dataRows.length;
      let successCount = 0;
      let errorCount = 0;

      // 3. Envoyer les travaux un à un
      for (let i = 0; i < totalToSubmit; i++) {
        const row = dataRows[i];

        try {
          const rowObject = {
            ...convertRowToObject(headers, row),
            service: service
          };

          // ── Résolution label → ID pour les champs FK ──────────────────────────
          // Le fichier Excel contient des libellés textuels, pas des UUIDs.
          // On cherche dans les listes chargées au montage pour obtenir les vrais IDs.

          // Référence : "DISTRIBUTION-MAINTENANCE POSTES_..." → reference.id
          // La comparaison normalise les espaces et ignore la casse pour être robuste
          // aux variations de formatage (espaces multiples, espaces insécables, casse).
          const refLabel = rowObject["Référence"] || rowObject["Reference"];
          if (refLabel && references.length > 0) {
            const norm = (s) =>
              String(s).trim().replace(/[ \s]+/g, " ").toLowerCase();
            const normalizedLabel = norm(refLabel);

            // 1er essai : correspondance exacte normalisée
            let matchedRef = references.find(
              r => norm(r.valeur) === normalizedLabel
            );

            // 2ème essai : la valeur DB commence par ce que l'utilisateur a écrit
            // (utile si la référence Excel est un sous-ensemble de la valeur complète en base)
            if (!matchedRef) {
              matchedRef = references.find(
                r => norm(r.valeur).startsWith(normalizedLabel)
                  || normalizedLabel.startsWith(norm(r.valeur))
              );
            }

            if (matchedRef) rowObject.reference_id = matchedRef.id;
          }

          // Unité demanderesse : "Unité Douala" → unite.id
          const uniteLabel = rowObject["Unité demanderesse"] || rowObject["Unite_demanderesse"];
          if (uniteLabel && unites.length > 0) {
            const matchedUnite = unites.find(u => u.nom === String(uniteLabel).trim());
            if (matchedUnite) rowObject.unite_demanderesse_id = matchedUnite.id;
          }

          // Type de travaux : "Maintenance" → typeActivite.id
          const typeLabel = rowObject["Type de travaux"] || rowObject["Type_de_travaux"];
          if (typeLabel && typesActivite.length > 0) {
            const matchedType = typesActivite.find(t => t.libelle === String(typeLabel).trim());
            if (matchedType) rowObject.type_travaux_id = matchedType.id;
          }

          // Centrale thermique : "Centrale A" → centrale.id
          const centraleLabel = rowObject["Centrale thermique"] || rowObject["Centrale_thermique"];
          if (centraleLabel && centrales.length > 0) {
            const matchedCentrale = centrales.find(c => c.valeur === String(centraleLabel).trim());
            if (matchedCentrale) rowObject.centrale_thermique_sollicitee_id = matchedCentrale.id;
          }

          // Charge de consignation : "charge1" ou "Alain Mbarga" → user.id
          const chargeLabel = rowObject["Charges de consignation"] || rowObject["Charges_de_consignation"];
          if (chargeLabel && users.length > 0) {
            const cleanLabel = String(chargeLabel).trim();
            const matchedUser = users.find(u =>
              u.username === cleanLabel ||
              `${u.first_name} ${u.last_name}`.trim() === cleanLabel ||
              `${u.last_name} ${u.first_name}`.trim() === cleanLabel
            );
            if (matchedUser) rowObject.charge_consignation_id = matchedUser.id;
          }

          const payload = mapPlanningPayload(rowObject);
          payload.planning_id = planningId;

          console.log(`ENVOI TRAVAIL ${i + 1}/${totalToSubmit} =>`, payload);
          setSubmissionStatus(`Envoi du travail ${i + 1} / ${totalToSubmit}...`);
          
          await createTravail(payload);
          successCount++;
        } catch (rowError) {
          console.error(`Erreur sur la ligne ${i + 1}:`, rowError?.response?.data || rowError.message);
          errorCount++;
        }

        const progress = 10 + Math.round(((i + 1) / totalToSubmit) * 90);
        setSubmissionProgress(progress);
      }

      setSubmissionStatus(errorCount > 0 ? `Terminé avec ${errorCount} erreurs` : "Terminé !");
      
      setTimeout(() => {
        setIsSubmissionModalOpen(false);
        if (successCount > 0) {
          toast.success(`${successCount} travaux importés avec succès !`);
          if (errorCount > 0) {
            toast.warning(`${errorCount} lignes n'ont pas pu être importées.`);
          }
          navigate(`/dashboard/Planning/${planningId}`);
        } else {
          toast.error("Aucun travail n'a pu être importé. Vérifiez le format des données.");
        }
      }, 1500);

    } catch (error) {
      console.error("Global submit error:", error);
      setSubmissionStatus("Erreur lors de la création du planning");
      toast.error("Erreur : " + (error.response?.data?.error || "Impossible de créer le planning"));
      setIsSubmissionModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EMPTY ---------------- */

  if (loadingPlanning) {
    return (
      <div className="wfd-page-loading" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", gap: "16px" }}>
        <div className="wfd-spinner" style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTop: "4px solid #1B75BB", borderRadius: "50%", animation: "wfd-spin 1s linear infinite" }}></div>
        <style>{`
          @keyframes wfd-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: "#64748b", fontWeight: "500" }}>Chargement du planning et des travaux...</p>
      </div>
    );
  }

  if (
    !showImport &&
    excelData.length === 0
  ) {
    return <p>Aucune donnée</p>;
  }

  return (
    <div className="excel-container">

      {/* IMPORT SCREEN */}

      {showImport && (
        <div className={fade}>

          {/* NEW CREATE BUTTON */}
          <div style={{ marginBottom: "20px", textAlign: "right" }}>
            <button
              type="button"
              className="btn-submit"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              ➕ Créer un nouveau Planning
            </button>
          </div>

          <FileInput
            onFileSelect={handleFileSelect}
            onContinue={handleContinue}
            service={service}
            setService={setService}
            references={references}
          />
        </div>
      )}

      {/* TABLE SCREEN */}

      {!showImport && (
        <div className="fade-in">

          {/* HEADER — Nom du fichier + Recherche */}

          <div className="header-text">

            <div className="text">
              <div className="file-name-edit">

                {/* Icône fichier Excel */}
                <div className="file-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>

                {id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <h2 className="tableaux-planning-name" style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                      {fileName || "Planning sans nom"}
                    </h2>
                    {(planningDetail?.current_step?.name || planningDetail?.statut) && (
                      <span className="workflow-step-badge" style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {planningDetail?.current_step?.name || planningDetail?.statut}
                      </span>
                    )}
                  </div>
                ) : (
                  <input
                    id="fileName"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="file-name-input"
                    placeholder="Nom du fichier..."
                  />
                )}
              </div>

              {id ? (
                <p>Visualisation des travaux programmés pour ce planning.</p>
              ) : (
                <p>Veuillez vérifier et ajuster les données extraites du fichier source avant la validation finale.</p>
              )}
            </div>

            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

                        {/* Inside the header-text div or after SearchBar */}
            <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
              <ExportPlanningButton 
                excelData={excelData} 
                fileName={fileName || "planning"} 
              />
            </div>

          </div>

          {/* Barre de validation Gestionnaire (CREER -> EN_ATTENTE) */}
          {id && (
            <PlanningValidationBar
              planningId={id}
              currentStepCode={planningDetail?.current_step?.code}
            />
          )}

          {/* FILTRES AVANCÉS */}
          <Filter
            filterType={filterType}       setFilterType={setFilterType}
            filterReseau={filterReseau}   setFilterReseau={setFilterReseau}
            filterStatut={filterStatut}   setFilterStatut={setFilterStatut}
            filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo}   setFilterDateTo={setFilterDateTo}
            typesActivite={typesActivite}
          />

          {/* BANNIÈRE DE WARNINGS */}
          {rowWarnings.length > 0 && (
            <div className="warning-banner">
              <div className="warning-banner-left">
                <span>⚠️</span>
                <span className="warning-badge">{rowWarnings.length}</span>
                <span>
                  référence{rowWarnings.length > 1 ? "s" : ""} introuvable{rowWarnings.length > 1 ? "s" : ""} dans le référentiel
                </span>
              </div>
              <div className="warning-nav">
                <button className="warning-nav-btn" onClick={() => navWarning(-1)} title="Warning précédent">↑</button>
                <span className="warning-nav-label">
                  {activeWarningIdx + 1} / {rowWarnings.length}
                </span>
                <button className="warning-nav-btn" onClick={() => navWarning(1)} title="Warning suivant">↓</button>
              </div>
            </div>
          )}

          {/* ADD BUTTON (caché en mode visualisation) */}

          {!id && (
            <div className="add-row-wrapper">
              <button
                type="button"
                className="add-row-btn"
                onClick={handleOpenAddModal}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Ajouter une ligne
              </button>
            </div>
          )}

          {/* TABLE */}

          <div className="table-scroll-wrapper">

            <table className="excel-table">

              <thead>
                <tr>
                  {isResponsable && id && (
                    <th style={{ width: "40px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        title="Tout sélectionner"
                        checked={selectableRows.length > 0 && selectableRows.every(r => selectedTravailIds.has(r.__id))}
                        onChange={(e) => {
                          const ids = new Set(e.target.checked ? selectableRows.map(r => r.__id) : []);
                          setSelectedTravailIds(ids);
                        }}
                      />
                    </th>
                  )}
                  {headers.map((h, i) => (
                    <th key={i}>{h.replace(/_/g, " ")}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {paginatedRows.map((row, filteredIdx) => {
                  // Retrouver l'index réel dans rows (avant filtre de recherche et pagination)
                  const realRowIndex = rows.indexOf(row);
                  const rowWarning = rowWarnings.find(w => w.rowIndex === realRowIndex);
                  const isActiveWarning = rowWarning && rowWarnings[activeWarningIdx]?.rowIndex === realRowIndex;

                  return (
                    <tr
                      key={filteredIdx}
                      ref={el => { rowRefs.current[realRowIndex] = el; }}
                      className={isActiveWarning ? "row-active-warning" : ""}
                      style={row.__travail?.statut_travaux === 'TERMINE' ? { opacity: 0.45, background: '#F1F5F9', pointerEvents: 'none' } : {}}
                    >
                      {isResponsable && id && (
                        <td style={{ textAlign: "center", width: "40px" }}>
                          {row.__travail && !row.__travail.demande_retrait ? (
                            <input
                              type="checkbox"
                              checked={selectedTravailIds.has(row.__id)}
                              onChange={(e) => {
                                setSelectedTravailIds(prev => {
                                  const next = new Set(prev);
                                  e.target.checked ? next.add(row.__id) : next.delete(row.__id);
                                  return next;
                                });
                              }}
                            />
                          ) : null}
                        </td>
                      )}
                      {Array.isArray(row) && row.map((cell, cellIndex) => {
                        const hasWarning = rowWarning && rowWarning.colIndex === cellIndex;
                        return (
                          <td key={cellIndex} className={hasWarning ? "cell-with-warning" : ""}>
                            {hasWarning ? (
                              <div className="cell-warning-content">
                                <span>{cell}</span>
                                <button
                                  className="cell-warning-btn"
                                  title={`Référence introuvable — cliquez pour corriger`}
                                  onClick={() => openWarningModal(rowWarning)}
                                >
                                  ⚠️
                                </button>
                              </div>
                            ) : cellIndex === 0 && id && !row.__travail?.demande_retrait ? (
                              <span
                                className="ref-link"
                                onClick={() => handleEditRowDetail(row)}
                                title="Cliquer pour modifier ce travail"
                              >
                                {cell}
                              </span>
                            ) : cell}
                          </td>
                        );
                      })}

                      <td className="action-cell">
                        {id ? (
                          // Mode visualisation : handlers backend (PATCH / DELETE)
                          row.__travail?.note_arret?.statut === 'DIFFUSEE' ? (
                            // NAPT diffusée — bouton Terminer
                            <button
                              className="action-btn"
                              title="Marquer ce travail comme terminé"
                              onClick={() => handleTerminer(row)}
                              style={{ cursor: 'pointer', color: '#10B981', background: 'none', border: 'none' }}
                            >
                              <span className="material-symbols-outlined">check_circle</span>
                            </button>
                          ) : row.__travail?.demande_retrait ? (
                            // DDR générée mais NAPT pas encore — travail verrouillé
                            <span
                              className="action-btn"
                              title="DDR générée — en attente de décision CCR"
                              style={{ cursor: 'default', color: '#94a3b8' }}
                            >
                              <span className="material-symbols-outlined">lock</span>
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                title="Modifier ce travail"
                                onClick={() => handleEditRowDetail(row)}
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button
                                type="button"
                                className="action-btn delete-btn"
                                title="Supprimer ce travail"
                                onClick={() => handleDeleteRowDetail(row)}
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </>
                          )
                        ) : (
                          // Mode création : handlers locaux (état React uniquement)
                          <>
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              title="Modifier cette ligne"
                              onClick={() => handleEditRow(filteredIdx)}
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              title="Supprimer cette ligne"
                              onClick={() => handleDeleteRow(filteredIdx)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <>
              <div className="tableaux-pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Précédent
                </button>

                <span className="pagination-info">
                  Page {currentPage} / {totalPages}
                </span>

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Suivant
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              <div className="pagination-total">
                {filteredRows.length} travail{filteredRows.length > 1 ? "x" : ""}
                {searchTerm && ` correspondant à "${searchTerm}"`}
                {" "}— affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)}
              </div>
            </>
          )}

          {/* FOOTER */}

          {id ? (
            <div className="btn" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="btn-draft"
                onClick={() => navigate("/dashboard/OP-home")}
                style={{ background: "#475569", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Retour aux plannings
              </button>

              {isResponsable && selectedTravailIds.size > 0 && (
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleValiderSelection}
                  disabled={isValidatingBatch}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {isValidatingBatch ? (
                    "Génération en cours..."
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Valider la sélection ({selectedTravailIds.size})
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="btn">

              <button type="button" className="btn-draft">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Enregistrer brouillon
              </button>

              <button
                type="button"
                className="btn-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Soumettre le planning
                  </>
                )}
              </button>

            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL */}

      {isModalOpen && (
        <div className="modal-overlay">

          <div className="modal-grid">

            <h2>
              Modifier la ligne
            </h2>

            <div className="grid-form">

              {headers.map(
                (header, index) => (
                  <div
                    className="grid-item"
                    key={index}
                  >

                    <label>
                      {header}
                    </label>

                    <input
                      value={
                        editData[index] ||
                        ""
                      }
                      onChange={(e) =>
                        handleEditChange(
                          index,
                          e.target.value
                        )
                      }
                    />

                  </div>
                )
              )}

            </div>

            <div className="modal-actions">

              <button
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                Annuler
              </button>

              <button onClick={handleSaveEdit}>
                Sauvegarder
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ADD MODAL */}
{isPlanningModalOpen && (
  <div
    className="modal-overlay"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        width: "85%",
        maxWidth: "760px",
        height: "88vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}
    >
      {/* HEADER — toujours visible */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Étape {addStep + 1} / {activeSteps.length}
        </p>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
          {isEditMode ? "Modifier — " : ""}{activeSteps[addStep]?.title}
        </h2>
      </div>

      {/* CONTENU — défile seul */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {activeSteps[addStep]?.content}
      </div>

      {/* FOOTER — toujours visible */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: "1px solid #e2e8f0",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8fafc",
        }}
      >
        <button
          style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#64748b" }}
          onClick={() => {
            setIsPlanningModalOpen(false);
            setIsEditMode(false);
            setEditingTravailId(null);
          }}
        >
          Annuler
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          {addStep > 0 && (
            <button
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: "14px" }}
              onClick={prevStep}
            >
              ← Précédent
            </button>
          )}

          {addStep < activeSteps.length - 1 ? (
            <button
              style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#1B75BB", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
              onClick={nextStep}
            >
              Suivant →
            </button>
          ) : (
            <button
              style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
              onClick={isEditMode ? (isResponsable ? handleValiderTravail : handleSavePlanningEdit) : handleAddPlanningRow}
            >
              {isEditMode ? (isResponsable ? "VALIDER" : "Sauvegarder") : "Ajouter"}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}

      {/* ================================================================
          MODAL DE RÉSOLUTION DE WARNING (référence introuvable)
      ================================================================ */}
      {warningModal && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="warning-modal">

            {/* Header */}
            <div className="warning-modal-header">
              <div className="warning-modal-title">
                <span>⚠️</span>
                <span>Référence introuvable</span>
              </div>
              <div className="warning-modal-subtitle">
                Valeur actuelle : <strong>{warningModal.value}</strong>
              </div>
            </div>

            {/* Onglets */}
            <div className="warning-tabs">
              <button
                className={`warning-tab-btn ${warningTab === "select" ? "active" : ""}`}
                onClick={() => setWarningTab("select")}
              >
                Sélectionner une référence existante
              </button>
              <button
                className={`warning-tab-btn ${warningTab === "create" ? "active" : ""}`}
                onClick={() => setWarningTab("create")}
              >
                Créer une nouvelle référence
              </button>
            </div>

            {/* Corps */}
            <div className="warning-modal-body">

              {warningTab === "select" && (
                <>
                  <input
                    className="warning-search-input"
                    placeholder="Rechercher une référence..."
                    value={refSearch}
                    onChange={e => setRefSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="warning-ref-list">
                    {(() => {
                      // Filtre par entité métier du service courant, puis par recherche texte.
                      const filtered = references
                        .filter(r =>
                          r.entite_metier?.name?.toLowerCase() === service.toLowerCase()
                        )
                        .filter(r => norm(r.valeur).includes(norm(refSearch)))
                        .slice(0, 60);

                      if (filtered.length === 0) return (
                        <div style={{ padding: "16px", color: "#94a3b8", textAlign: "center", fontSize: "13px" }}>
                          Aucune référence pour <strong>{service}</strong>
                          {refSearch && ` correspondant à "${refSearch}"`}
                        </div>
                      );

                      return filtered.map(r => (
                        <div
                          key={r.id}
                          className={`warning-ref-option ${selectedRefId === r.id ? "selected" : ""}`}
                          onClick={() => setSelectedRefId(r.id)}
                        >
                          {r.valeur}
                        </div>
                      ));
                    })()}
                  </div>
                </>
              )}

              {warningTab === "create" && (
                <>
                  <div className="warning-form-group">
                    <label>Valeur de la référence *</label>
                    <input
                      value={newRefValeur}
                      onChange={e => setNewRefValeur(e.target.value)}
                      placeholder="Ex: DISTRIBUTION-MAINTENANCE POSTES_..."
                      autoFocus
                    />
                  </div>
                  <div className="warning-form-group">
                    <label>Entité métier</label>
                    <select
                      value={newRefEntiteId}
                      onChange={e => setNewRefEntiteId(e.target.value)}
                    >
                      <option value="">— Aucune —</option>
                      {entites.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ margin: "14px 0 8px", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderTop: "1px solid #e2e8f0", paddingTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    Items détectés depuis le tableau
                    <span style={{ fontSize: "10px", fontWeight: "400", color: "#94a3b8", textTransform: "none" }}>— colonnes manquantes ignorées</span>
                  </div>
                  {[
                    { label: "Segment", value: newItemSegment },
                    { label: "Ouvrage", value: newItemOuvrage },
                    { label: "Poste",   value: newItemPoste   },
                    ...(service === "distribution" ? [{ label: "Départ", value: newItemDepart }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="warning-form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ minWidth: "64px", fontSize: "12px", fontWeight: "600", color: "#475569" }}>{label}</span>
                      <div style={{
                        flex: 1, padding: "6px 10px", borderRadius: "6px", fontSize: "13px",
                        background: value ? "#f0fdf4" : "#f8fafc",
                        border: `1px solid ${value ? "#bbf7d0" : "#e2e8f0"}`,
                        color: value ? "#166534" : "#94a3b8",
                        fontStyle: value ? "normal" : "italic",
                      }}>
                        {value || "— colonne absente, item non créé —"}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="warning-modal-footer">
              <button
                className="warning-btn-cancel"
                onClick={() => setWarningModal(null)}
              >
                Annuler
              </button>
              <button
                className="warning-btn-confirm"
                disabled={
                  savingRef ||
                  (warningTab === "select" && !selectedRefId) ||
                  (warningTab === "create" && !newRefValeur.trim())
                }
                onClick={warningTab === "select" ? applyExistingRef : createAndApplyRef}
              >
                {savingRef ? "Enregistrement..." : warningTab === "select" ? "Appliquer" : "Créer et appliquer"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUBMISSION PROGRESS MODAL */}
      {isSubmissionModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-grid" style={{ width: "420px", textAlign: "center", padding: "32px" }}>
            <h2 style={{ marginBottom: "8px" }}>⏳ Soumission en cours</h2>
            <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "#64748b" }}>{submissionStatus}</p>

            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${submissionProgress}%` }}
              />
            </div>
            <span style={{ fontWeight: "700", fontSize: "20px", color: "#1e40af" }}>
              {submissionProgress}%
            </span>
          </div>
        </div>
      )}

        {/* CREATE PLANNING MODAL */}
        <CreatePlanningModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newPlanning) => {
            // Optional: redirect to the new planning
            navigate(`/dashboard/Planning/${newPlanning.id}`);
          }}
        />

    </div>
  );
};

export default ExcelDisplay;