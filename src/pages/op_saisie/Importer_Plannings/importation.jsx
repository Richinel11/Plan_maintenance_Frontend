import { useState, useMemo, useEffect } from "react";
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

// service et setService sont passés depuis Planning.jsx pour partager l'état.
// Si non fournis (usage isolé), on utilise le hook local comme fallback.
const FileInput = ({ onFileSelect, onContinue, service: serviceProp, setService: setServiceProp, references = [] }) => {

  const hook = useServiceRole();

  // Synchronise le hook interne avec la prop reçue de Planning.jsx.
  // Sans ça, hook.fields resterait sur "transport" même si serviceProp change.
  useEffect(() => {
    if (serviceProp !== undefined && serviceProp !== hook.service) {
      hook.setService(serviceProp);
    }
  }, [serviceProp]); // eslint-disable-line react-hooks/exhaustive-deps

  const service    = serviceProp    ?? hook.service;
  const setService = setServiceProp ?? hook.setService;
  const { fields } = hook;

  const [fileName, setFileName] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileType, setFileType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  /* =========================
      ERREURS / MODAL
  ========================= */

  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  /* =========================================================
      CONFIGURATION PAR SERVICE
  ========================================================= */

  const serviceColumns = useMemo(() => {

    const common = {

      Reference: {
        label: "Référence",
        type: "Texte",
        pattern: /^[A-Za-z0-9À-ÿ°\s\-_/().,:]+$/u,
        example: "DISTRIBUTION-MAINTENANCE POSTES_BRGM_POSTE SOURCE_HTA_TRANSFO 90/15kV N°1_RAME 15kV N°1",
        maxLength: 300,
      },

      Segments: {
        label: "Segments",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "DISTRIBUTION-MAINTENANCE POSTES",
        maxLength: 100,
      },

      Ouvrages: {
        label: "Ouvrages",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "BRGM_POSTE SOURCE_HTA",
        maxLength: 100,
      },

      Poste: {
        label: "Poste",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "TRANSFO 90/15kV N°1",
        maxLength: 100,
      },

      Departs: {
        label: "Départs",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "RAME 15kV N°1",
        maxLength: 100,
      },

      Unite_demanderesse: {
        label: "Unité demanderesse",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "Unité Douala",
        maxLength: 100,
      },

      Type_de_travaux: {
        label: "Type de travaux",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "Maintenance",
        maxLength: 100,
      },

      Types_de_travaux: {
        label: "Types de travaux",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "Inspection",
        maxLength: 100,
      },

      Types_de_reseau: {
        label: "Types de réseau",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "HTA",
        maxLength: 100,
      },

      Troncons: {
        label: "Tronçons",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "Tronçon 01",
        maxLength: 100,
      },

      Consistances_Des_Travaux: {
        label: "Consistance des travaux",
        type: "Texte",
        pattern: /^[^\n\r]+$/u,
        example: "Entretien AT N°1 90/15kV - nettoyage et serrage connexions",
        maxLength: 255,
      },

      Charges_de_consignation: {
        label: "Charges de consignation",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "Charge A",
        maxLength: 100,
      },

      Charges_de_consignations: {
        label: "Charges de consignations",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "Charge B",
        maxLength: 100,
      },

      Disponibilite_mecanique: {
        label: "Disponibilité mécanique",
        type: "Nombre",
        format: /^\d+(\.\d+)?$/,
        example: "150",
        min: 0,
        max: 999999,
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
        format: /^\d{1,2}$/,
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
        format: /^\d{1,2}$/,
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
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
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
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
        example: "Douala",
        maxLength: 100,
      },

      Moyens_mis_en_oeuvre: {
        label: "Moyens mis en oeuvre",
        type: "Texte",
        pattern: /^[\wÀ-ÿ°\s\-_/().,;:]+$/u,
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

  // Accepte : objet Date JS (XLSX cellDates), ISO, DD/MM/YYYY [HH:mm]
  // On normalise la valeur avant de valider.
  let parsedDate = null;

  if (value instanceof Date) {
    // Cas 1 : objet Date JS (produit par cellDates: true)
    parsedDate = isNaN(value.getTime()) ? null : value;

  } else if (typeof value === "number") {
    // Cas 2 : nombre série Excel (ne devrait plus arriver avec cellDates: true)
    try {
      const excelDate = XLSX.SSF.parse_date_code(value);
      if (excelDate) {
        parsedDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      }
    } catch (_) {}

  } else {
    // Cas 3 : chaîne — format ISO ou français
    const str = String(value).trim();
    // ISO : YYYY-MM-DD ou YYYY-MM-DDTHH:mm
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      parsedDate = new Date(str);
    }
    // Français : DD/MM/YYYY ou DD/MM/YYYY HH:mm
    const frMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (frMatch) {
      parsedDate = new Date(`${frMatch[3]}-${frMatch[2].padStart(2,'0')}-${frMatch[1].padStart(2,'0')}`);
    }
  }

  /* DATE INVALIDE */
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    validationErrors.push({
      line,
      column: col.label,
      message: "Date invalide ou non reconnue",
      solution: "Formats acceptés : YYYY-MM-DD, DD/MM/YYYY, ou cellule date Excel",
    });
    continue;
  }

  /* DATE PASSÉE */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    validationErrors.push({
      line,
      column: col.label,
      message: "Date passée interdite",
      solution: "Utiliser une date future",
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

  // Normalise une chaîne pour la comparaison : trim + espaces multiples + minuscules.
  const normRef = (s) =>
    String(s).trim().replace(/[ \s]+/g, " ").toLowerCase();

  // Vérifie chaque ligne : la valeur "Référence" existe-t-elle en base ?
  // Retourne des avertissements (non bloquants) pour les références introuvables.
  const checkReferences = (jsonData) => {
    if (references.length === 0) return [];
    const refWarnings = [];

    jsonData.forEach((row, i) => {
      const refValue = row["Référence"];
      if (!refValue) return;

      const normalizedLabel = normRef(refValue);
      const found = references.find(
        r =>
          normRef(r.valeur) === normalizedLabel ||
          normRef(r.valeur).startsWith(normalizedLabel) ||
          normalizedLabel.startsWith(normRef(r.valeur))
      );

      if (!found) {
        refWarnings.push({
          line: i + 2,
          column: "Référence",
          message: `"${refValue}" introuvable dans le référentiel`,
          solution:
            "Cette référence n'existe pas en base — elle sera ignorée. Vérifiez l'orthographe ou ajoutez-la au référentiel.",
        });
      }
    });

    return refWarnings;
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

    // cellDates: true → les dates Excel sont converties en objets Date JS
    // (cohérent avec readFile.jsx)
    const workbook = XLSX.read(data, { cellDates: true });

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const json =
      XLSX.utils.sheet_to_json(sheet);

    const validationErrors = validateExcel(json);

    // Les erreurs bloquent l'import.
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setWarnings([]);
      setShowErrors(true);
      setFileSelected(false);
      setFileName("");
      return;
    }

    // Les avertissements (références introuvables) sont affichés mais n'bloquent pas.
    const refWarnings = checkReferences(json);
    if (refWarnings.length > 0) {
      setWarnings(refWarnings);
      setErrors([]);
      setShowErrors(true);
      // On laisse fileSelected = true → l'utilisateur peut continuer malgré les avertissements.
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
                <AlertTriangle color={errors.length > 0 ? "red" : "orange"} />
                <h2>{errors.length > 0 ? "Erreurs détectées" : "Avertissements"}</h2>
              </div>

              <button
                className="close-modal-btn"
                onClick={() => setShowErrors(false)}
              >
                <X size={20} />
              </button>

            </div>

            <div className="error-body">

              {/* Erreurs bloquantes */}
              {errors.map((err, index) => (
                <div className="error-item" key={`err-${index}`}>
                  <div><strong>Ligne :</strong> {err.line}</div>
                  <div><strong>Colonne :</strong> {err.column}</div>
                  <div><strong>Erreur :</strong> {err.message}</div>
                  <div><strong>Solution :</strong> {err.solution}</div>
                </div>
              ))}

              {/* Avertissements non bloquants (références introuvables) */}
              {warnings.length > 0 && (
                <>
                  {errors.length > 0 && (
                    <hr style={{ margin: "12px 0", border: "1px solid #fcd34d" }} />
                  )}
                  <p style={{ color: "#b45309", fontWeight: 600, marginBottom: 8 }}>
                    ⚠️ {warnings.length} référence(s) introuvable(s) — l'import peut continuer mais ces lignes seront sans référence liée.
                  </p>
                  {warnings.map((w, index) => (
                    <div
                      className="error-item"
                      key={`warn-${index}`}
                      style={{ borderLeft: "4px solid #f59e0b", background: "#fffbeb" }}
                    >
                      <div><strong>Ligne :</strong> {w.line}</div>
                      <div><strong>Colonne :</strong> {w.column}</div>
                      <div><strong>Valeur :</strong> {w.message}</div>
                      <div><strong>Info :</strong> {w.solution}</div>
                    </div>
                  ))}
                </>
              )}

            </div>

          </div>

        </div>
      )}

      <div className="import-header">

        <h1 className="import-title">
          Importer un planning
        </h1>

        {/* Sélecteur de service — détermine les colonnes, le template et la validation */}
        <div className="import-service-selector" style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontWeight: 600, color: "#374151", fontSize: "14px" }}>
            Entité métier :
          </label>
          <select
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              // Réinitialiser le fichier si on change de service
              setFileSelected(false);
              setFileName("");
              setFileType("");
              setErrors([]);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1.5px solid #1B75BB",
              color: "#1B75BB",
              fontWeight: 700,
              fontSize: "14px",
              background: "#f0f7ff",
              cursor: "pointer",
            }}
          >
            <option value="transport">Transport</option>
            <option value="distribution">Distribution</option>
            <option value="production">Production</option>
          </select>
        </div>

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