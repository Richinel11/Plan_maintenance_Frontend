import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
} from "lucide-react";

import "./importation.css";
import useServiceRole from "../../ComponentsRole/ServiceRole";

const FileInput = ({ onFileSelect, onContinue }) => {

  const {
    service,
    fields,
  } = useServiceRole();

  const [fileName, setFileName] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileType, setFileType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  /* =========================
      ERREURS / MODAL
  ========================= */

  const [errors, setErrors] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  /* =========================================================
      CONFIGURATION PAR SERVICE
  ========================================================= */

  const serviceColumns = useMemo(() => {

    const common = {

      Reference: {
        label: "Référence",
        type: "Texte",
        pattern: /^[A-Za-z0-9À-ÿ\s\-_/().]+$/u,
        example: "REF-01",
        maxLength: 50,
      },

      Segments: {
        label: "Segments",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Segment A",
        maxLength: 100,
      },

      Ouvrages: {
        label: "Ouvrages",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "déployer",
        maxLength: 100,
      },

      Poste: {
        label: "Poste",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Poste Central",
        maxLength: 100,
      },

      Departs: {
        label: "Départs",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Départ Nord",
        maxLength: 100,
      },

      Unite_demanderesse: {
        label: "Unité demanderesse",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Unité Douala",
        maxLength: 100,
      },

      Type_de_travaux: {
        label: "Type de travaux",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Maintenance",
        maxLength: 100,
      },

      Types_de_travaux: {
        label: "Types de travaux",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Inspection",
        maxLength: 100,
      },

      Types_de_reseau: {
        label: "Types de réseau",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "HTA",
        maxLength: 100,
      },

      Troncons: {
        label: "Tronçons",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Tronçon 01",
        maxLength: 100,
      },

      Consistances_Des_Travaux: {
        label: "Consistance des travaux",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Travaux prévus",
        maxLength: 255,
      },

      Charges_de_consignation: {
        label: "Charges de consignation",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Charge A",
        maxLength: 100,
      },

      Charges_de_consignations: {
        label: "Charges de consignations",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Charge B",
        maxLength: 100,
      },

      Disponibilite_mecanique: {
        label: "Disponibilité mécanique",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Disponible",
        maxLength: 100,
      },

      Debut_planifiee: {
        label: "Début planifiée",
        type: "Date",
        format: /^\d{4}-\d{2}-\d{2}$/,
        example: "2026-05-01",
      },

      Duree: {
        label: "Durée",
        type: "Nombre",
        format: /^\d{2}$/,
        example: "01",
        min: 1,
        max: 99,
      },

      Fin_planifiee: {
        label: "Fin planifiée",
        type: "Date",
        format: /^\d{4}-\d{2}-\d{2}$/,
        example: "2026-05-30",
      },

      Date_programmee: {
        label: "Date programmée",
        type: "Date",
        format: /^\d{4}-\d{2}-\d{2}$/,
        example: "2026-06-01",
      },

      Jour_avant_travaux: {
        label: "Jour avant travaux",
        type: "Nombre",
        format: /^\d{2}$/,
        example: "05",
        min: 1,
        max: 31,
      },

      Prevision_puissance_sollicite: {
        label: "Prévision puissance sollicitée",
        type: "Nombre",
        format: /^\d+$/,
        example: "150",
        min: 1,
        max: 999999,
      },

      Prevision_puissance_interrompue: {
        label: "Prévision puissance interrompue",
        type: "Nombre",
        format: /^\d+$/,
        example: "200",
        min: 1,
        max: 999999,
      },

      Prevision_ENF: {
        label: "Prévision ENF",
        type: "Nombre",
        format: /^\d+$/,
        example: "300",
        min: 1,
        max: 999999,
      },

      Centrale_thermique: {
        label: "Centrale thermique",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Centrale A",
        maxLength: 100,
      },

      Qte_de_fuel: {
        label: "Quantité fuel",
        type: "Nombre",
        format: /^\d+$/,
        example: "500",
        min: 1,
        max: 999999,
      },

      Obervations: {
        label: "Observations",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().,]+$/u,
        example: "RAS",
        maxLength: 255,
      },

      Localites_impactees: {
        label: "Localités impactées",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Douala",
        maxLength: 100,
      },

      Moyens_mis_en_oeuvre: {
        label: "Moyens mis en oeuvre",
        type: "Texte",
        pattern: /^[\wÀ-ÿ\s\-_/().]+$/u,
        example: "Camion",
        maxLength: 100,
      },
    };

    return fields
      .filter((field) => common[field])
      .map((field) => ({
        field,
        ...common[field],
    }));

  }, [fields]);

  /* =========================================================
      TEMPLATE EXCEL
  ========================================================= */

const downloadTemplate = () => {

  const sampleRow = {};

  serviceColumns.forEach((col) => {

    sampleRow[col.label] = col.example;
  });

  const ws = XLSX.utils.json_to_sheet(
    [sampleRow],
    {
      skipHeader: false,
    }
  );

  serviceColumns.forEach((col, index) => {

    if (col.type === "Date") {

      const cellAddress =
        XLSX.utils.encode_cell({
          r: 1,
          c: index,
        });

      if (ws[cellAddress]) {

        ws[cellAddress].t = "s";

        ws[cellAddress].z = "@";

        ws[cellAddress].v =
          String(ws[cellAddress].v);
      }
    }
  });

  ws["!cols"] = serviceColumns.map(() => ({
    wch: 30,
  }));

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    service.toUpperCase()
  );

  XLSX.writeFile(
    wb,
    `modele_import_${service}.xlsx`
  );
};

  /* =========================================================
      VALIDATION
  ========================================================= */

  const validateExcel = (jsonData) => {

    const validationErrors = [];

    if (!jsonData.length) {

      validationErrors.push({
        line: "-",
        column: "-",
        message: "Le fichier est vide",
        solution: "Ajouter des données dans le fichier Excel",
      });

      return validationErrors;
    }

    const headers = Object.keys(jsonData[0]).map(
      (h) => h.trim()
    );

    /* =========================
        VERIFICATION COLONNES
    ========================= */

    for (let col of serviceColumns) {

      if (!headers.includes(col.label)) {

        validationErrors.push({
          line: "-",
          column: col.label,
          message: "Colonne manquante",
          solution: `Ajouter la colonne "${col.label}"`,
        });
      }
    }

    /* =========================
        DOUBLONS
    ========================= */

    const duplicateCheck = new Set();

    /* =========================
        VALIDATION LIGNES
    ========================= */

    for (let i = 0; i < jsonData.length; i++) {

      const row = jsonData[i];
      const line = i + 2;

      const rowSignature = JSON.stringify(row);

      if (duplicateCheck.has(rowSignature)) {

        validationErrors.push({
          line,
          column: "Toutes",
          message: "Ligne dupliquée",
          solution: "Supprimer le doublon",
        });
      }

      duplicateCheck.add(rowSignature);

      for (let col of serviceColumns) {

        const value = row[col.label];

        /* =========================
            VALEUR VIDE
        ========================= */

        if (
          value === undefined ||
          value === null ||
          value.toString().trim() === ""
        ) {

          validationErrors.push({
            line,
            column: col.label,
            message: "Valeur vide",
            solution: `Exemple attendu : ${col.example}`,
          });

          continue;
        }

        const cleanValue = value.toString().trim();

        /* =========================
            TYPE TEXTE
        ========================= */

        if (col.type === "Texte") {

          if (!col.pattern.test(cleanValue)) {

            validationErrors.push({
              line,
              column: col.label,
              message: "Format texte invalide",
              solution: `Exemple : ${col.example}`,
            });
          }

          if (
            col.maxLength &&
            cleanValue.length > col.maxLength
          ) {

            validationErrors.push({
              line,
              column: col.label,
              message: `Texte trop long (${cleanValue.length})`,
              solution: `Maximum autorisé : ${col.maxLength} caractères`,
            });
          }
        }

        /* =========================
            TYPE NOMBRE
        ========================= */

        if (col.type === "Nombre") {

          /* REFUSE NEGATIF */

          if (Number(cleanValue) < 0) {

            validationErrors.push({
              line,
              column: col.label,
              message: "Valeur négative interdite",
              solution: `Utiliser une valeur positive. Exemple : ${col.example}`,
            });

            continue;
          }

          /* REFUSE ZERO */

          if (Number(cleanValue) === 0) {

            validationErrors.push({
              line,
              column: col.label,
              message: "La valeur ne peut pas être zéro",
              solution: `Valeur minimale : ${col.min}`,
            });

            continue;
          }

          /* FORMAT */

          if (!col.format.test(cleanValue)) {

            validationErrors.push({
              line,
              column: col.label,
              message: "Format numérique invalide",
              solution: `Format attendu : ${col.example}`,
            });
          }

          const num = Number(cleanValue);

          if (isNaN(num)) {

            validationErrors.push({
              line,
              column: col.label,
              message: "Nombre invalide",
              solution: `Exemple : ${col.example}`,
            });

            continue;
          }

          /* INTERVAL */

          if (
            col.min !== undefined &&
            num < col.min
          ) {

            validationErrors.push({
              line,
              column: col.label,
              message: `Valeur inférieure à ${col.min}`,
              solution: `Entrer une valeur >= ${col.min}`,
            });
          }

          if (
            col.max !== undefined &&
            num > col.max
          ) {

            validationErrors.push({
              line,
              column: col.label,
              message: `Valeur supérieure à ${col.max}`,
              solution: `Entrer une valeur <= ${col.max}`,
            });
          }
        }

        /* =========================
            TYPE DATE
        ========================= */

if (col.type === "Date") {

  let dateValue = value;

  /* EXCEL SERIAL DATE */

  if (typeof value === "number") {

    const excelDate =
      XLSX.SSF.parse_date_code(value);

    if (excelDate) {

      const yyyy = excelDate.y;

      const mm = String(
        excelDate.m
      ).padStart(2, "0");

      const dd = String(
        excelDate.d
      ).padStart(2, "0");

      dateValue =
        `${yyyy}-${mm}-${dd}`;
    }
  }

  dateValue =
    dateValue.toString().trim();

  /* FORMAT STRICT */

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      dateValue
    )
  ) {

    validationErrors.push({
      line,
      column: col.label,
      message:
        "Format de date invalide",
      solution:
        "Format attendu : YYYY-MM-DD",
    });

    continue;
  }

  /* DATE VALIDE */

  const parsedDate =
    new Date(dateValue);

  if (
    parsedDate.toString() ===
    "Invalid Date"
  ) {

    validationErrors.push({
      line,
      column: col.label,
      message: "Date invalide",
      solution:
        "Exemple : 2026-05-01",
    });

    continue;
  }

  /* DATE PASSEE */

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (parsedDate < today) {

    validationErrors.push({
      line,
      column: col.label,
      message:
        "Date passée interdite",
      solution:
        "Utiliser une date future",
    });
  }
}
      }

      /* =========================
          BUSINESS RULES
      ========================= */

      if (
        row["Début planifiée"] &&
        row["Fin planifiée"]
      ) {

        const start = new Date(row["Début planifiée"]);
        const end = new Date(row["Fin planifiée"]);

        if (end < start) {

          validationErrors.push({
            line,
            column: "Fin planifiée",
            message: "La date de fin est avant la date de début",
            solution: "La fin doit être après le début",
          });
        }
      }
    }

    return validationErrors;
  };

  /* =========================================================
      IMPORT FICHIER
  ========================================================= */

  const processFile = async (file) => {

    setFileName(file.name);
    setFileSelected(true);

    if (
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")
    ) {

      setFileType("Excel");

    } else if (
      file.name.endsWith(".csv")
    ) {

      setFileType("CSV");

    } else {

      setErrors([
        {
          line: "-",
          column: "-",
          message: "Format de fichier invalide",
          solution: "Utiliser .xlsx, .xls ou .csv",
        },
      ]);

      setShowErrors(true);

      return;
    }

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const json =
      XLSX.utils.sheet_to_json(sheet);

    const validationErrors =
      validateExcel(json);

    if (validationErrors.length > 0) {

      setErrors(validationErrors);
      setShowErrors(true);

      setFileSelected(false);
      setFileName("");

      return;
    }

    onFileSelect?.(file);
  };

  const handleFileChange = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    processFile(file);
  };

  /* =========================================================
      DRAG & DROP
  ========================================================= */

  const handleDrop = async (e) => {

    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (!file) return;

    processFile(file);
  };

  return (
    <div className="import-container">

      {/* =========================
          MODAL ERREURS
      ========================= */}

      {showErrors && (

        <div className="error-modal-overlay">

          <div className="error-modal">

            <div className="error-header">

              <div className="error-title">

                <AlertTriangle color="red" />

                <h2>Erreurs détectées</h2>

              </div>

              <button
                className="close-modal-btn"
                onClick={() =>
                  setShowErrors(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="error-body">

              {errors.map((err, index) => (

                <div
                  className="error-item"
                  key={index}
                >

                  <div>
                    <strong>Ligne :</strong>{" "}
                    {err.line}
                  </div>

                  <div>
                    <strong>Colonne :</strong>{" "}
                    {err.column}
                  </div>

                  <div>
                    <strong>Erreur :</strong>{" "}
                    {err.message}
                  </div>

                  <div>
                    <strong>Solution :</strong>{" "}
                    {err.solution}
                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>
      )}

      <div className="import-header">

        <h1 className="import-title">
          Importer un planning
        </h1>

        <p className="import-subtitle">
          Service détecté :{" "}
          <strong>{service.toUpperCase()}</strong>
        </p>

      </div>

      <div className="import-card">

        {!fileSelected ? (

          <div
            className={`drop-zone ${
              isDragging ? "dragging" : ""
            }`}

            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}

            onDragLeave={() =>
              setIsDragging(false)
            }

            onDrop={handleDrop}
          >

            <div className="cloud-icon">
              <Upload size={36} />
            </div>

            <div className="drop-text">
              Zone de dépôt de fichier
            </div>

            <div className="drop-subtext">
              Glissez-déposez votre fichier
              <strong> .xlsx </strong>
              ou
              <strong> .csv </strong>
            </div>

            <input
              type="file"
              id="fileInput"
              hidden
              onChange={handleFileChange}
            />

            <label
              htmlFor="fileInput"
              className="browse-btn"
            >
              <Upload size={18} />
              Parcourir les fichiers
            </label>

          </div>

        ) : (

          <div className="file-preview fade-in">

            <div className="file-card">

              <div className="file-icon-large">
                📄
              </div>

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

        {/* ACTIONS */}

        <div className="point">

          <button
            className="template-btn"
            onClick={downloadTemplate}
          >
            <Download size={16} />
            Télécharger un template {service}
          </button>

          <button
            className="columns-btn"
            onClick={() =>
              setShowColumns(!showColumns)
            }
          >

            Colonnes

            {showColumns
              ? <ChevronUp size={16} />
              : <ChevronDown size={16} />
            }

          </button>

        </div>

        {/* COLONNES */}

        {showColumns && (

          <div className="columns-list">

            {serviceColumns.map((col, index) => (

              <div
                className="column-row"
                key={index}
              >

                <span>{col.label}</span>

                <small>{col.type}</small>

              </div>
            ))}

          </div>
        )}

        {/* FOOTER */}

        <div className="footer">

          <button className="btn btn-cancel">
            Annuler
          </button>

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