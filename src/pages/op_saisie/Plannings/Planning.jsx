import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import FileInput from "../Importer_Plannings/importation";
import readExcel from "./readFile";
import "./Planning.css";
import SearchBar from "../components/Filter_search/search";
import Filter from "./filterCards/filter";

const ExcelDisplay = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [fileName, setFileName] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [showImport, setShowImport] = useState(true);
  const [fade, setFade] = useState("fade-in");

  const [searchTerm, setSearchTerm] = useState("");

  /* EDIT MODAL */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editData, setEditData] = useState([]);

  /* ADD MODAL */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState([]);

  /* SUBMIT */
  const [loading, setLoading] = useState(false);

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
    return excelData.length > 0 ? excelData[0] : [];
  }, [excelData]);

  const rows = useMemo(() => {
    return excelData.length > 1 ? excelData.slice(1) : [];
  }, [excelData]);

  /* ---------------- SEARCH ---------------- */
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;

    return rows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [rows, searchTerm]);

  /* ---------------- EDIT ---------------- */
  const handleEditRow = (rowIndex) => {
    setSelectedRow(rowIndex + 1);
    setEditData([...rows[rowIndex]]);
    setIsModalOpen(true);
  };

  const handleChange = (index, value) => {
    const updated = [...editData];
    updated[index] = value;
    setEditData(updated);
  };

  const handleSave = () => {
    const updated = [...excelData];
    updated[selectedRow] = editData;
    setExcelData(updated);
    setIsModalOpen(false);
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteRow = (rowIndex) => {
    const confirmDelete = window.confirm(
      "Voulez-vous supprimer cette ligne ?"
    );

    if (!confirmDelete) return;

    const updated = excelData.filter(
      (_, index) => index !== rowIndex + 1
    );

    setExcelData(updated);
  };

  /* ---------------- ADD NEW ROW ---------------- */
  const handleOpenAddModal = () => {
    setNewRowData(headers.map(() => ""));
    setIsAddModalOpen(true);
  };

  const handleAddChange = (index, value) => {
    const updated = [...newRowData];
    updated[index] = value;
    setNewRowData(updated);
  };

  const handleAddRow = () => {
    const updated = [...excelData, newRowData];
    setExcelData(updated);
    setIsAddModalOpen(false);
  };

  /* ---------------- HEADER MAP ---------------- */
  const headerMap = {
    titr: "", 
    reference:"",
    type_activite :"",
    jour_debut_planifie: "",
    jour_debut_effectif :"",
    duree_planifiee: "",
    jour_fin_planifie :"",
    observation: "",
    statut_travaux: "",
  };

  /* ---------------- CONVERT ROW ---------------- */
  const convertRowToPayload = (headers, row) => {
    const obj = {};

    headers.forEach((header, i) => {
      const field = headerMap[header];

      if (field) {
        obj[field] = row[i];
      }
    });

    return obj;
  };

  /* ---------------- SUBMIT TO BACKEND ---------------- */
  const handleSubmit = async () => {
    if (rows.length === 0) {
      alert("Aucune donnée");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      for (const row of rows) {
        const payload = convertRowToPayload(headers, row);

        await axios.post(
          "http://localhost:8000/api/plannings/",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      alert("Planning soumis avec succès");

      /* REDIRECT TO NEXT PAGE */
      navigate("/dashboard/travaux-de-bord");

    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="excel-container">

      {/* IMPORT SCREEN */}
      {showImport && (
        <div className={fade}>
          <FileInput
            onFileSelect={handleFileSelect}
            onContinue={handleContinue}
          />
        </div>
      )}

      {/* TABLE SCREEN */}
      {!showImport && (
        <div className="fade-in">

          {/* HEADER */}
          <div className="header-text">
            <div className="text">
              <h1>📄 {fileName}</h1>

              <p>
                Veuillez vérifier et ajuster les données
                extraites du fichier source avant validation
              </p>
            </div>

            <SearchBar
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <Filter />

          {/* ADD ROW BUTTON */}
          <div style={{ marginBottom: "15px" }}>
            <button
              type="button"
              onClick={handleOpenAddModal}
            >
              ➕ Ajouter une ligne
            </button>
          </div>

          {/* TABLE */}
          <table className="excel-table">

            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}

                {/* ACTIONS HEADER */}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, rowIndex) => (
                <tr key={rowIndex}>

                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}

                  {/* ACTION BUTTONS */}
                  <td className="action-cell">

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() =>
                        handleEditRow(rowIndex)
                      }
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDeleteRow(rowIndex)
                      }
                    >
                      🗑
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          {/* FOOTER BUTTONS */}
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

            <h2>Modifier la ligne</h2>

            <div className="grid-form">
              {headers.map((header, i) => (
                <div className="grid-item" key={i}>
                  <label>{header}</label>

                  <input
                    value={editData[i] || ""}
                    onChange={(e) =>
                      handleChange(i, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="modal-actions">

              <button
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                Annuler
              </button>

              <button onClick={handleSave}>
                Sauvegarder
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-grid">

            <h2>Ajouter une ligne</h2>

            <div className="grid-form">
              {headers.map((header, i) => (
                <div className="grid-item" key={i}>
                  <label>{header}</label>

                  <input
                    value={newRowData[i] || ""}
                    onChange={(e) =>
                      handleAddChange(i, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="modal-actions">

              <button
                onClick={() =>
                  setIsAddModalOpen(false)
                }
              >
                Annuler
              </button>

              <button onClick={handleAddRow}>
                Ajouter
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ExcelDisplay;