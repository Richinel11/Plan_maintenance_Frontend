import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../services/Authservice";
import { toast } from "sonner";

import FileInput from "../Importer_Plannings/importation";
import readExcel from "./readFile";

import "./Planning.css";
import PlanningForm from "../Creer_Travail/components/PlanningForm";
import SearchBar from "../components/Filter_search/search";
import Filter from "./filterCards/filter";
import useServiceRole from "../../../pages/ComponentsRole/ServiceRole";
import { createPlanning, createTravail } from "../../../API/planningService";
import { mapPlanningPayload } from "../../../utils/planningMapper";
import Etape2 from "../Creer_Travail/Etape2/etape2";
import Etape3 from "../Creer_Travail/etape3/etape3";
import Recap from "../Creer_Travail/Recap/recap";
import {
  getReferences,
  getTypesActivite,
} from "../../../services/referencetielService";


const ExcelDisplay = () => {
  const navigate = useNavigate();
  const { service, fields, options, referenceConfig } = useServiceRole();
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

  /* REFERENTIEL DATA */
  const [references, setReferences] = useState([]);
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
  Exploitations: "",
  Type_de_travaux: "",
  Types_de_reseau: "",

  service: "",
});

  /* LOAD REFERENTIEL */
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [refs, tps] = await Promise.all([
          getReferences(), getTypesActivite()
        ]);
        setReferences(refs || []);
        setTypesActivite(tps || []);
      } catch (err) { console.error("Referentiel load error", err); }
    };
    fetchData();
  }, []);


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
        options={options}
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
        navigate("/dashboard/Tableaux_De_Bord");
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

          {/* HEADER */}

          <div className="header-text">

          <div className="text">

            <div className="file-name-edit">

              <label
                htmlFor="fileName"
                className="file-label"
              >
                File Name :
              </label>

              <input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(e) =>
                  setFileName(e.target.value)
                }
                className="file-name-input"
              />

            </div>

            <p>
              Vérifiez les données
              avant validation
            </p>

          </div>

            <SearchBar
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

          <Filter />

          {/* ADD BUTTON */}

          <div
            style={{
              marginBottom: "15px",
            }}
          >
            <button
              type="button"
              onClick={
                handleOpenAddModal
              }
            >
              ➕ Ajouter une ligne
            </button>
          </div>

          {/* TABLE */}

          <div className="table-scroll-wrapper">

            <table className="excel-table">

              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i}>{h.replace(/_/g, " ")}</th>
                  ))}
                  <th>Actions</th>
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

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>


          {/* FOOTER */}

          <div className="btn">

            <button type="button">
              Enregistrer brouillon
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Envoi..."
                : "Soumission de planning"}
            </button>

          </div>
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
          <div className="modal-grid" style={{ width: "400px", textAlign: "center", padding: "30px" }}>
            <h2>Soumission en cours</h2>
            <p style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>{submissionStatus}</p>
            
            <div style={{ 
              width: "100%", 
              height: "20px", 
              background: "#eee", 
              borderRadius: "10px", 
              overflow: "hidden",
              marginBottom: "10px"
            }}>
              <div style={{ 
                width: `${submissionProgress}%`, 
                height: "100%", 
                background: "#4caf50", 
                transition: "width 0.3s ease" 
              }} />
            </div>
            <span style={{ fontWeight: "bold" }}>{submissionProgress}%</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExcelDisplay;