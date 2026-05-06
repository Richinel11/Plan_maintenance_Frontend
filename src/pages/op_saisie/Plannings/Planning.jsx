import { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FileInput from "../Importer_Plannings/importation";
import readExcel from "./readFile";
import "./Planning.css";
import SearchBar from "../components/Filter_search/search";
import Filter from "./filterCards/filter";
import ServiceSwitcher from "../../ComponentsRole/ServiceRole";

const ExcelDisplay = () => {
  const navigate  = useNavigate();
  const { service, fields } = ServiceSwitcher();  // ← from cookie

  const [fileName, setFileName]       = useState("");
  const [excelData, setExcelData]     = useState([]);
  const [showImport, setShowImport]   = useState(true);
  const [fade, setFade]               = useState("fade-in");
  const [searchTerm, setSearchTerm]   = useState("");
  const [loading, setLoading]         = useState(false);

  /* MODALS */
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [isEditOpen, setIsEditOpen]   = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalData, setModalData]     = useState([]);

  /* ── Headers always from service fields ── */
  const headers = useMemo(() => fields, [fields]);

  const rows = useMemo(() => (excelData.length > 1 ? excelData.slice(1) : []), [excelData]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [rows, searchTerm]);

  /* ── Import ── */
  const handleFileSelect = async (file) => {
    try {
      setFileName(file.name);
      const data = await readExcel(file);
      setExcelData(data);
    } catch { alert("Erreur lors de l'importation."); }
  };

  const handleContinue = () => {
    setFade("fade-out");
    setTimeout(() => setShowImport(false), 300);
  };

  /* ── Add Row ── */
  const openAdd = ()  => { setModalData(fields.map(() => "")); setIsAddOpen(true); };
  const handleAdd = () => {
    setExcelData((prev) =>
      prev.length === 0 ? [fields, modalData] : [...prev, modalData]
    );
    setIsAddOpen(false);
  };

  /* ── Edit Row ── */
  const openEdit = (rowIndex) => {
    setSelectedRow(rowIndex);
    setModalData([...rows[rowIndex]]);
    setIsEditOpen(true);
  };
  const handleSave = () => {
    const updated = [...excelData];
    updated[selectedRow + 1] = modalData;
    setExcelData(updated);
    setIsEditOpen(false);
  };

  /* ── Delete Row ── */
  const handleDelete = (rowIndex) => {
    if (window.confirm("Supprimer cette ligne ?"))
      setExcelData(excelData.filter((_, i) => i !== rowIndex + 1));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/api/submit-planning", { service, headers, data: rows });
      alert("✅ Planning soumis !");
      navigate("/success");
    } catch { alert("❌ Erreur lors de la soumission."); }
    finally { setLoading(false); }
  };

  /* ── Reusable Modal ── */
  const Modal = ({ title, onClose, onConfirm, confirmLabel }) => (
    <div className="modal-overlay">
      <div className="modal-grid">
        <h2>{title} — {service}</h2>
        <div className="grid-form">
          {fields.map((field, i) => (
            <div className="grid-item" key={i}>
              <label>{field}</label>
              <input
                value={modalData[i] || ""}
                onChange={(e) => {
                  const updated = [...modalData];
                  updated[i] = e.target.value;
                  setModalData(updated);
                }}
                placeholder={`Entrer ${field}`}
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Annuler</button>
          <button onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="excel-container">

      {/* Import screen */}
      {showImport && (
        <div className={fade}>
          <FileInput onFileSelect={handleFileSelect} onContinue={handleContinue} />
        </div>
      )}

      {/* Table screen */}
      {!showImport && (
        <div className="fade-in">
          <div className="header-text">
            <div className="text">
              <h1>📄 {fileName || `Planning ${service}`}</h1>
              <p>Service : <strong>{service}</strong></p>
            </div>
            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <Filter />

          <button onClick={openAdd}>➕ Ajouter une ligne</button>

          <table className="excel-table">
            <thead>
              <tr>
                {headers.map((h, i) => <th key={i}>{h}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr><td colSpan={headers.length + 1} style={{ textAlign: "center" }}>
                  Aucune donnée.
                </td></tr>
              ) : filteredRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                  <td className="action-cell">
                    <button className="edit-btn"   onClick={() => openEdit(ri)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(ri)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="btn">
            <button>Enregistrer brouillon</button>
            <button onClick={handleSubmit} disabled={loading || !rows.length}>
              {loading ? "Envoi..." : "Soumettre planning"}
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <Modal
          title="Ajouter une ligne"
          onClose={() => setIsAddOpen(false)}
          onConfirm={handleAdd}
          confirmLabel="Ajouter"
        />
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <Modal
          title="Modifier la ligne"
          onClose={() => setIsEditOpen(false)}
          onConfirm={handleSave}
          confirmLabel="Enregistrer"
        />
      )}
    </div>
  );
};

export default ExcelDisplay;