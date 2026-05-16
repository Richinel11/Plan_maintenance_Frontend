import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FileInput from "../Importer_Plannings/importation";
import readExcel from "./readFile";

import "./Planning.css";
import PlanningForm from "../Creer_Travail/components/PlanningForm";
import SearchBar from "../components/Filter_search/search";
import Filter from "./filterCards/filter";
import useServiceRole from "../../../pages/ComponentsRole/ServiceRole";
import { createPlanningBatch } from "../../../API/planningService";
import { mapPlanningPayload } from "../../../utils/planningMapper";
import Etape2 from "../Creer_Travail/Etape2/etape2";
import Etape3 from "../Creer_Travail/components/Etape3";
import Recap from "../Creer_Travail/components/Recap";
const ExcelDisplay = () => {
  const navigate = useNavigate();
  const step = addStep;
  const filteredFields = fields.filter(f => f.step === step);

  const [fileName, setFileName] = useState("");
  const [excelData, setExcelData] = useState([]);
  // const [planningName, setPlanningName] = useState(""); // ✅ NEW FIELD
  const [showImport, setShowImport] = useState(true);
  const [fade, setFade] = useState("fade-in");

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] =
    useState(null);
const { fields, options } = useServiceRole();
  const [editData, setEditData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
const [addStep, setAddStep] = useState(0);
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
    service: "",
  });

  setAddStep(0); // ✅ IMPORTANT
  setIsPlanningModalOpen(true);
};

const addSteps = [
  {
    title: "Identification & Organisation",
    content: (
      <PlanningForm
        formData={planningFormData}
        onChange={handlePlanningChange}
        service={planningFormData.service}
        fields={fields}
        options={options}
        step={addStep}
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

{addStep < addSteps.length - 1 ? (
  <button onClick={nextStep}>Suivant</button>
) : (
  <button onClick={handleAddPlanningRow}>Ajouter</button>
)};

const handlePlanningChange = (field, value) => {
  setPlanningFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleAddPlanningRow = () => {
  const rowObject = { ...planningFormData };

  const row = headers.map((header) => {
    return rowObject[header] ?? "";
  });

  setExcelData((prev) => [...prev, row]);
  setIsPlanningModalOpen(false);
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

      alert("Erreur importation fichier");
    }
  };

  /* ---------------- HEADERS / ROWS ---------------- */

  const headers = useMemo(() => {
    return excelData.length > 0
      ? excelData[0]
      : [];
  }, [excelData]);

  const rows = useMemo(() => {
    return excelData.length > 1
      ? excelData.slice(1)
      : [];
  }, [excelData]);

  /* ---------------- SEARCH ---------------- */

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) {
      return rows;
    }

    return rows.filter((row) =>
      row.some((cell) =>
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

    updatedExcelData[selectedRowIndex + 1] =
      editData;

    setExcelData(updatedExcelData);

    setIsModalOpen(false);
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteRow = (rowIndex) => {
    const confirmed = window.confirm(
      "Voulez-vous supprimer cette ligne ?"
    );

    if (!confirmed) {
      return;
    }

    const updated = excelData.filter(
      (_, index) => index !== rowIndex + 1
    );

    setExcelData(updated);
  };

  /* ---------------- ADD ROW ---------------- */




  /* ---------------- CONVERT EXCEL ROW ---------------- */

  const convertRowToObject = (
    headersArray,
    rowArray
  ) => {
    const obj = {};

    headersArray.forEach((header, index) => {
      obj[header] = rowArray[index];
    });

    return obj;
  };




  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!rows.length) {
      alert("Aucune donnée");

      return;
    }

    try {
      setLoading(true);

      const payloads = rows.map((row) => {
        const rowObject =
          convertRowToObject(headers, row);

        return mapPlanningPayload(
          rowObject
        );
      });

      console.log(
        "BATCH PAYLOAD =>",
        payloads
      );

      await createPlanningBatch({
        file_name: fileName,
        // planning_name: planningName, // ✅ IMPORTANT ADDITION
        data: payloads,
      });

      alert(
        "Planning importé avec succès"
      );

      navigate(
        "/dashboard/Tableaux_De_Bord"
      );

    } catch (error) {
      console.error(error);

      console.log(
        "BACKEND ERROR =>",
        error.response?.data
      );

      alert(
        "Erreur lors de l'importation"
      );

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

                

                  <th>Actions</th>

                </tr>
              </thead>

              <tbody>

                {filteredRows.map(
                  (row, rowIndex) => (
                    <tr key={rowIndex}>

                      {row.map(
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

    </div>
  );
};

export default ExcelDisplay;