import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, X, ChevronDown, ChevronUp, Download } from "lucide-react";
import "./Importation.css";

const FileInput = ({ onFileSelect, onContinue }) => {
  const [fileName, setFileName] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileType, setFileType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  const requiredColumns = [
    { name: "Titre", type: "Texte" },
    { name: "Référence", type: "Texte" },
    { name: "Type Activité", type: "Texte" },
    { name: "Jour Début Planifié", type: "Date" },
    { name: "Durée Planifiée", type: "Nombre" },
    { name: "Jour Fin Planifié", type: "Date" },
    { name: "Observation", type: "Texte" },
    { name: "Statut Travaux", type: "Texte" },
    { name: "Travail Alignement", type: "Booléen" },
    { name: "Date Report", type: "Date" },
    { name: "Problème Rencontré", type: "Texte" },
  ];

  /* =======================================
      TELECHARGER MODELE EXCEL
  ======================================= */
  const downloadTemplate = () => {
    const sampleData = [
      {
        Titre: "Maintenance Ligne A14",
        Référence: "MAINT-2023-089",
        "Type Activité": "Maintenance",
        "Jour Début Planifié": "2026-04-30",
        "Durée Planifiée": 3,
        "Jour Fin Planifié": "2026-05-02",
        Observation: "RAS",
        "Statut Travaux": "BROUILLON",
        "Travail Alignement": "false",
        "Date Report": "2026-05-03",
        "Problème Rencontré": "Pain",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Planning");

    XLSX.writeFile(wb, "modele_import_planning.xlsx");
  };

  /* VALIDATION FICHIER IMPORT */
  const validateExcel = (jsonData) => {
    if (!jsonData.length) {
      alert("❌ Le fichier est vide.");
      return false;
    }

    const headers = Object.keys(jsonData[0]);

    // Vérifier colonnes
    for (let col of requiredColumns) {
      if (!headers.includes(col.name)) {
        alert(`❌ Colonne manquante : ${col.name}`);
        return false;
      }
    }

    // Vérifier types
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const line = i + 2; // ligne excel réelle

   /* VALEURS VIDES */
    for (let col of requiredColumns) {
      const value = row[col.name];

      if (
        value === undefined ||
        value === null ||
        value.toString().trim() === ""
      ) {
        alert(`❌ Ligne ${line} : la colonne "${col.name}" est vide.`);
        return false;
      }
    }

    //  text obligatoire
    const textColumns = [
      "Titre",
      "Référence",
      "Type Activité",
      "Observation",
      "Statut Travaux",
      "Problème Rencontré"
    ];

    for (let col of textColumns) {
      const val = row[col].toString().trim();

      if (!/^[\wÀ-ÿ\s\-_/().]+$/u.test(val)) {
        alert(`❌ Ligne ${line} : "${col}" contient une valeur invalide.`);
        return false;
      }
    }



  // Durée = nombre
    const duree = row["Durée Planifiée"].toString().trim();

    if (!/^[1-9]\d*$/.test(duree)) {
      alert(
        `❌ Ligne ${line} : "Durée Planifiée" doit être un nombre entier positif.`
      );
      return false;
    }

    /* DATES VALIDES */
    const dateColumns = [
      "Jour Début Planifié",
      "Jour Fin Planifié",
      "Date Report"
    ];

      // Obligatoires
      for (let col of dateColumns) {
        const val = row[col]?.toString().trim();

        if (isNaN(Date.parse(val))) {
          alert(`❌ Ligne ${line} : "${col}" doit être une date valide.`);
          return false;
        }
      }

 // Booléen
    const boolVal = row["Travail Alignement"]
      .toString()
      .trim()
      .toLowerCase();

    if (boolVal !== "true" && boolVal !== "false") {
      alert(
        `❌ Ligne ${line} : "Travail Alignement" doit être true ou false.`
      );
      return false;
    }
  }

  return true;
};

  /* IMPORT FICHIER */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setFileSelected(true);

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      setFileType("Excel");
    } else if (file.name.endsWith(".csv")) {
      setFileType("CSV");
    } else {
      setFileType("Fichier");
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const valid = validateExcel(json);

    if (!valid) {
      setFileSelected(false);
      setFileName("");
      return;
    }

    onFileSelect?.(file);
  };

  return (
    <div className="import-container">
      <div className="import-header">
        <h1 className="import-title">Importer un planning</h1>
        <p className="import-subtitle">
          Configurez et téléchargez vos fichiers de planification industrielle.
        </p>
      </div>

      <div className="import-card">

        {!fileSelected ? (
          <div
            className={`drop-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
          >
            <div className="cloud-icon">
              <Upload size={36} />
            </div>

            <div className="drop-text">Zone de dépôt de fichier</div>

            <div className="drop-subtext">
              Glissez-déposez votre fichier <strong>.xlsx</strong> ou{" "}
              <strong>.csv</strong>
            </div>

            <input
              type="file"
              id="fileInput"
              hidden
              onChange={handleFileChange}
            />

            <label htmlFor="fileInput" className="browse-btn">
              <Upload size={18} />
              Parcourir les fichiers
            </label>

            <div className="supported-formats">
              Formats supportés : .xlsx, .csv
            </div>
          </div>
        ) : (
          <div className="file-preview fade-in">
            <div className="file-card">
              <div className="file-icon-large">📄</div>

              <div className="file-details">
                <h3>{fileName}</h3>
                <p>Type : {fileType}</p>
              </div>

              <button
                className="remove-btn"
                onClick={() => {
                  setFileSelected(false);
                  setFileName("");
                  setFileType("");
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* DIV POINT */}
        <div className="point">

          {/* Download */}
          <button className="template-btn" onClick={downloadTemplate}>
            <Download size={16} />
            Télécharger un planning
          </button>

          {/* Toggle columns */}
          <button
            className="columns-btn"
            onClick={() => setShowColumns(!showColumns)}
          >
            Colonnes
            {showColumns ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showColumns && (
          <div className="columns-list">
            {requiredColumns.map((col, index) => (
              <div className="column-row" key={index}>
                <span>{col.name}</span>
                <small>{col.type}</small>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <button className="btn btn-cancel">Annuler</button>

          <button
            className="btn btn-continue"
            disabled={!fileSelected}
            onClick={() => onContinue?.()}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileInput;