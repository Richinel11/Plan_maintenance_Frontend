import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../../services/Authservice";
import { toast } from "sonner";

import FileInput from "../Importer_Plannings/importation";
import readExcel from "./readFile";

import "./Planning.css";
import PlanningForm from "../Creer_Travail/components/PlanningForm";
import SearchBar from "../components/Filter_search/search";
import Filter from "./filterCards/filter";
import useServiceRole from "../../../pages/ComponentsRole/ServiceRole";
import { createPlanning, createTravail, getPlanningById, getTravaux } from "../../../API/planningService";
import { mapPlanningPayload } from "../../../utils/planningMapper";
import Etape2 from "../Creer_Travail/Etape2/etape2";
import Etape3 from "../Creer_Travail/etape3/etape3";
import Recap from "../Creer_Travail/Recap/recap";
import {
  getReferences,
  getTypesActivite,
} from "../../../services/referencetielService";

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

// Helper : Mappe un objet Travail du backend vers une ligne de tableau (tableau 1D)
const mapTravailToExcelRow = (travail, fields) => {
  return fields.map((field) => {
    switch (field) {
      case "Reference":
        return travail.reference?.valeur || travail.reference || "";
      case "Segments":
        return travail.segment || "";
      case "Ouvrages":
        return travail.ouvrage?.nom || travail.ouvrage || travail.troncons_consignes || "";
      case "Poste":
        return travail.poste?.nom || travail.poste || "";
      case "Type_de_travaux":
        return travail.type_travaux?.nom || travail.type_travaux || "";
      case "Unite_demanderesse":
        return travail.unite_demanderesse?.name || travail.unite_demanderesse || "";
      case "Consistances_Des_Travaux":
        return travail.consistance_travaux || "";
      case "Charges_de_consignation":
        return travail.charge_consignation?.nom || travail.charge_consignation || "";
      case "Debut_planifiee":
        return travail.heure_debut_planifie ? new Date(travail.heure_debut_planifie).toLocaleDateString("fr-FR") : "";
      case "Duree":
        return travail.duree || "";
      case "Fin_planifiee":
        return travail.heure_fin_planifie ? new Date(travail.heure_fin_planifie).toLocaleDateString("fr-FR") : "";
      case "Date_programmee":
        return travail.date_programmee || "";
      case "Jour_avant_travaux":
        return travail.jour_avant_travaux || "";
      case "Prevision_puissance_sollicite":
        return travail.prevision_puissance_sollicitee || "";
      case "Prevision_puissance_interrompue":
        return travail.prevision_puissance_interrompue || "";
      case "Prevision_ENF":
        return travail.prevision_ENF || "";
      case "Centrale_thermique":
        return travail.centrale_thermique_sollicitee?.name || travail.centrale_thermique_sollicitee || "";
      case "Qte_de_fuel":
        return travail.qte_fuel_sollicitee || "";
      case "Observations":
        return travail.observations || "";
      case "Departs":
        return travail.depart?.nom || travail.depart || "";
      case "Types_de_reseau":
        return travail.type_reseau || "";
      case "Troncons":
        return travail.troncon?.nom || travail.troncon || "";
      case "Localites_impactees":
        return travail.localites_impactees || "";
      case "Moyens_mis_en_oeuvre":
        return travail.moyens_mis_en_oeuvre || "";
      case "Disponibilite_mecanique":
        return travail.disponibilite_mecanique_mw || "";
      default:
        return "";
    }
  });
};


const ExcelDisplay = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { service, setService, fields, options, referenceConfig } = useServiceRole();
  const [addStep, setAddStep] = useState(0);

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

  /* REFERENTIEL DATA */
  const [references, setReferences] = useState([]);
  const [unites, setUnites] = useState([]);
  const [typesActivite, setTypesActivite] = useState([]);


  /* SUBMISSION PROGRESS */
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState("");

  const step = addStep;
  const filteredFields = fields ? fields.filter(f => f.step === step) : [];
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

  /* LOAD REFERENTIEL */
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getCurrentUser();
        const entiteMetierId = user?.entite_metier?.id;

        const [refs, tps, units] = await Promise.all([
          getReferences(), 
          getTypesActivite(),
          entiteMetierId ? getReferences(entiteMetierId) : Promise.resolve([])
        ]);
        setReferences(refs || []);
        setTypesActivite(tps || []);
        setUnites(units || []);
      } catch (err) { console.error("Referentiel load error", err); }
    };
    fetchData();
  }, []);

  /* EFFECT POUR LE CHARGEMENT DU PLANNING EXISTANT SI ID PRESENT DANS L'URL */
  useEffect(() => {
    if (!id) return;

    const loadExistingPlanning = async () => {
      try {
        setLoadingPlanning(true);
        const planning = await getPlanningById(id);
        setPlanningDetail(planning);

        const planningService = planning.service || planning.segment?.toLowerCase() || "transport";
        setService(planningService.toLowerCase());
        setFileName(planning.nom || planning.name || "");

        const listTravaux = await getTravaux(id);
        const fieldsForService = getFieldsForService(planningService);

        const mappedRows = listTravaux.map((t) => {
          const row = mapTravailToExcelRow(t, fieldsForService);
          row.__id = t.id;
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
    };

    loadExistingPlanning();
  }, [id, setService]);


  /* AUTO GENERATE REFERENCE — now derived from Reference items, no standalone lookup needed */


const handleOpenAddModal = () => {
  setPlanningFormData({
    Reference: "",
    reference_id: null,
    ouvrage_id: null,
    poste_id: null,
    depart_id: null,
    troncon_id: null,
    Segments: service.toUpperCase(),
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
        options={{
          ...options,
          Unite_demanderesse: unites,
        }}
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
    title: "Localisation & Consistance",
    content: (
      <Etape2
        formData={planningFormData}
        onChange={handlePlanningChange}
        fields={fields}
        options={options}
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
        options={options}
      />
    ),
  },

  {
    title: "Récapitulatif",
    content: <Recap formData={planningFormData} />,
  },
];

const nextStep = () => {
  setAddStep((prev) => Math.min(prev + 1, addSteps.length - 1));
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

  /* ---------------- SEARCH ---------------- */

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) {
      return rows;
    }

    return rows.filter((row) =>
      Array.isArray(row) && row.some((cell) =>
        String(cell)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [rows, searchTerm]);

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

  /* ---------------- ADD ROW ---------------- */

const handleAddPlanningRow = () => {
  const row = headers.map((header) => {
    return planningFormData[header] ?? "";
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

      // 1. Créer le planning
      const planningResponse = await createPlanning({
        nom: fileName || "Nouveau Planning",
        code: `PLAN-${Date.now()}`
      });
      
      const planningId = planningResponse.data.id;
      setSubmissionProgress(10);
      setSubmissionStatus("Planning créé. Envoi des travaux...");

      // 2. Envoyer les travaux un à un
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // S'assurer qu'on ne prend pas l'entête par erreur
        if (i === 0 && excelData.length > 0 && row === excelData[0]) continue;

        const rowObject = {
          ...convertRowToObject(headers, row),
          service: service
        };

        // Fusionner avec les IDs si on est en mode saisie manuelle (optionnel mais recommandé)
        // Note: rowObject contient déjà les valeurs indexées par headers
        
        const payload = mapPlanningPayload(rowObject);
        payload.planning_id = planningId;

        console.log(`ENVOI TRAVAIL ${i + 1} =>`, payload);
        setSubmissionStatus(`Envoi du travail ${i + 1} / ${rows.length}...`);
        await createTravail(payload);

        const progress = 10 + Math.round(((i + 1) / rows.length) * 90);
        setSubmissionProgress(progress);
      }

      setSubmissionStatus("Terminé !");
      setTimeout(() => {
        setIsSubmissionModalOpen(false);
        toast.success("Planning et travaux importés avec succès !");

        // ─────────────────────────────────────────────────────────────
        //  Navigation vers la page de détail du planning
        //
        //  On passe le planningId dans le "state" de React Router.
        //  Tableaux.jsx va lire ce state via useLocation() pour
        //  charger directement les travaux de CE planning
        //  au lieu d'afficher la liste générale.
        // ─────────────────────────────────────────────────────────────
        navigate(`/dashboard/Planning/${planningId}`);
      }, 1000);

    } catch (error) {
      console.error(error);
      setSubmissionStatus("Erreur lors de l'importation");
      toast.error("Erreur lors de l'importation : " + (error.response?.data?.error || "Erreur inconnue"));
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
          <FileInput
            onFileSelect={
              handleFileSelect
            }
            onContinue={
              handleContinue
            }
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

          </div>

          {/* FILTRES — avant la recherche avancée */}
          <Filter />

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
                  {headers.map((h, i) => (
                    <th key={i}>{h.replace(/_/g, " ")}</th>
                  ))}
                  {!id && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>

                {filteredRows.map(
                  (row, rowIndex) => (
                    <tr key={rowIndex}>

                      {Array.isArray(row) && row.map(
                        (
                          cell,
                          cellIndex
                        ) => (
                          <td
                            key={
                              cellIndex
                            }
                          >
                            {cell}
                          </td>
                        )
                      )}

                      {!id && (
                        <td className="action-cell">

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              handleEditRow(
                                rowIndex
                              )
                            }
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteRow(
                                rowIndex
                              )
                            }
                          >
                            🗑
                          </button>

                        </td>
                      )}

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>


          {/* FOOTER */}

          {id ? (
            <div className="btn" style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-draft"
                onClick={() => navigate("/dashboard/Tableaux_De_Bord")}
                style={{ background: "#475569", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Retour aux plannings
              </button>
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

              <button
                onClick={
                  handleSaveEdit
                }
              >
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
      className="modal-grid"
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "85%",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      {/* HEADER STEP */}
      <h2>
        Étape {addStep + 1} / {addSteps.length} — {addSteps[addStep].title}
      </h2>

      {/* CONTENT */}
      <div style={{ marginTop: 20 }}>
        {addSteps[addStep].content}
      </div>

      {/* FOOTER BUTTONS */}
      <div
        className="modal-actions"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <button onClick={() => setIsPlanningModalOpen(false)}>
          Annuler
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          {addStep > 0 && (
            <button onClick={prevStep}>
              Précédent
            </button>
          )}

          {addStep < addSteps.length - 1 ? (
            <button onClick={nextStep}>
              Suivant
            </button>
          ) : (
            <button onClick={handleAddPlanningRow}>
              Ajouter
            </button>
          )}
        </div>
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

    </div>
  );
};

export default ExcelDisplay;