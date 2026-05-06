import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, X, ChevronDown, ChevronUp, Download } from "lucide-react";
import "./Importation.css";
import ServiceSwitcher from "../../ComponentsRole/ServiceRole";

const FileInput = ({ onFileSelect, onContinue }) => {
  const [fileName, setFileName]     = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  const { service, fields } = ServiceSwitcher();

  /* ── Download template based on service ── */
  const downloadTemplate = () => {
    if (!fields.length) return alert("Aucune colonne disponible.");
    const row = Object.fromEntries(fields.map((f) => [f, "Exemple"]));
    const ws  = XLSX.utils.json_to_sheet([row]);
    const wb  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, service || "Planning");
    XLSX.writeFile(wb, `modele_${service || "planning"}.xlsx`);
  };

  /* ── Validate uploaded file against service fields ── */
  const validate = (json) => {
    if (!json.length) { alert("❌ Fichier vide."); return false; }
    const headers = Object.keys(json[0]);
    for (let f of fields) {
      if (!headers.includes(f)) {
        alert(`❌ Colonne manquante : ${f}`);
        return false;
      }
    }
    return true;
  };

  /* ── Handle file upload ── */
  const handleFile = async (file) => {
    if (!file) return;
    try {
      const data     = await file.arrayBuffer();
      const wb       = XLSX.read(data);
      const json     = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      if (!validate(json)) return;
      setFileName(file.name);
      setFileSelected(true);
      onFileSelect?.(file);
    } catch {
      alert("❌ Erreur lors de la lecture du fichier.");
    }
  };

  return (
    <div className="import-container">
      <div className="import-header">
        <h1 className="import-title">Importer un planning — {service}</h1>
        <p className="import-subtitle">Colonnes requises selon votre service.</p>
      </div>

      <div className="import-card">
        {/* ── Drop zone ── */}
        {!fileSelected ? (
          <div
            className={`drop-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <Upload size={36} />
            <p>Glissez votre fichier <strong>.xlsx</strong> ou <strong>.csv</strong></p>
            <input type="file" id="fileInput" hidden accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFile(e.target.files[0])} />
            <label htmlFor="fileInput" className="browse-btn">
              <Upload size={18} /> Parcourir
            </label>
          </div>
        ) : (
          /* ── File preview ── */
          <div className="file-card">
            <span>📄 {fileName}</span>
            <button onClick={() => { setFileSelected(false); setFileName(""); }}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="point">
          <button className="template-btn" onClick={downloadTemplate}>
            <Download size={16} /> Télécharger modèle
          </button>
          <button className="columns-btn" onClick={() => setShowColumns(!showColumns)}>
            Colonnes ({fields.length})
            {showColumns ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* ── Columns list ── */}
        {showColumns && (
          <div className="columns-list">
            {fields.map((f, i) => (
              <div className="column-row" key={i}>
                <span>{f}</span><small>Texte</small>
              </div>
            ))}
          </div>
        )}

        <div className="footer">
          <button className="btn btn-cancel">Annuler</button>
          <button className="btn btn-continue" disabled={!fileSelected} onClick={() => onContinue?.()}>
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileInput;