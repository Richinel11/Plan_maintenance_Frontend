import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Upload, X, ChevronDown, ChevronUp, Download } from "lucide-react";
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

   /* =========================================================
      CONFIGURATION PAR SERVICE
  ========================================================= */

  const serviceColumns = useMemo(() => {

    const common = {
      Reference: { label: "Référence", type: "Texte" },
      Segments: { label: "Segments", type: "Texte" },
      Ouvrages: { label: "Ouvrages", type: "Texte" },
      Poste: { label: "Poste", type: "Texte" },
      Departs: { label: "Départs", type: "Texe" },

      Unite_demanderesse: {
        label: "Unité demanderesse",
        type: "Texte",
      },

      Type_de_travaux: {
        label: "Type de travaux",
        type: "Texte",
      },

      Types_de_travaux: {
        label: "Types de travaux",
        type: "Texte",
      },

      Types_de_reseau: {
        label: "Types de réseau",
        type: "Texte",
      },

      Troncons: {
        label: "Tronçons",
        type: "Texte",
      },

      Consistances_Des_Travaux: {
        label: "Consistance des travaux",
        type: "Texte",
      },

      Charges_de_consignation: {
        label: "Charges de consignation",
        type: "Texte",
      },

      Charges_de_consignations: {
        label: "Charges de consignations",
        type: "Texte",
      },

      Disponibilite_mecanique: {
        label: "Disponibilité mécanique",
        type: "Texte",
      },

      Debut_planifiee: {
        label: "Début planifiée",
        type: "Date",
      },

      Duree: {
        label: "Durée",
        type: "Nombre",
      },

      Fin_planifiee: {
        label: "Fin planifiée",
        type: "Date",
      },

      Date_programmee: {
        label: "Date programmée",
        type: "Date",
      },

      Jour_avant_travaux: {
        label: "Jour avant travaux",
        type: "Nombre",
      },

      Prevision_puissance_sollicite: {
        label: "Prévision puissance sollicitée",
        type: "Nombre",
      },

      Prevision_puissance_interrompue: {
        label: "Prévision puissance interrompue",
        type: "Nombre",
      },

      Prevision_ENF: {
        label: "Prévision ENF",
        type: "Nombre",
      },

      Centrale_thermique: {
        label: "Centrale thermique",
        type: "Texte",
      },

      Qte_de_fuel: {
        label: "Quantité fuel",
        type: "Nombre",
      },

      Obervations: {
        label: "Observations",
        type: "Texte",
      },

      Localites_impactees: {
        label: "Localités impactées",
        type: "Texte",
      },

      Moyens_mis_en_oeuvre: {
        label: "Moyens mis en oeuvre",
        type: "Texte",
      },
    };

    return fields.map((field) => ({
      field,
      label: common[field]?.label || field,
      type: common[field]?.type || "Texte",
    }));

  }, [fields]);

  /* =========================================================
      TEMPLATE EXCEL
  ========================================================= */

  const downloadTemplate = () => {

    const sampleRow = {};

    serviceColumns.forEach((col) => {

      switch (col.type) {

        case "Date":
          sampleRow[col.label] = "2026-05-01";
          break;

        case "Nombre":
          sampleRow[col.label] = 1;
          break;

        default:
          sampleRow[col.label] = "Exemple";
      }
    });

    const ws = XLSX.utils.json_to_sheet([sampleRow]);

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

    if (!jsonData.length) {
      alert("❌ Le fichier est vide.");
      return false;
    }

    // const headers = Object.keys(jsonData[0]);
    const headers = Object.keys(jsonData[0]).map(
      (h) => h.trim()
    );

    /* VERIFICATION COLONNES */
    for (let col of serviceColumns) {

      if (!headers.includes(col.label)) {

        alert(`❌ Colonne manquante : ${col.label}`);

        return false;
      }
    }

    /* VALIDATION DES LIGNES */
    for (let i = 0; i < jsonData.length; i++) {

      const row = jsonData[i];
      const line = i + 2;

      for (let col of serviceColumns) {

        const value = row[col.label];

        /* VALEURS VIDES */
        if (
          value === undefined ||
          value === null ||
          value.toString().trim() === ""
        ) {

          alert(
            `❌ Ligne ${line} : "${col.label}" est vide.`
          );

          return false;
        }

        /* VALIDATION PAR TYPE */

        switch (col.type) {

          case "Texte":

            if (
              !/^[\wÀ-ÿ\s\-_/().]+$/u.test(
                value.toString().trim()
              )
            ) {

              alert(
                `❌ Ligne ${line} : "${col.label}" contient une valeur invalide.`
              );

              return false;
            }

            break;

          case "Nombre":

            if (
              !/^[1-9]\d*$/.test(
                value.toString().trim()
              )
            ) {

              alert(
                `❌ Ligne ${line} : "${col.label}" doit être un nombre valide.`
              );

              return false;
            }

            break;

          case "Date":

            if (
              isNaN(
                Date.parse(
                  value.toString().trim()
                )
              )
            ) {

              alert(
                `❌ Ligne ${line} : "${col.label}" doit être une date valide.`
              );

              return false;
            }

            break;

          default:
            break;
        }
      }
    }

    return true;
  };

  /* =========================================================
      IMPORT FICHIER
  ========================================================= */

  const processFile = async (file) => {

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

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const json =
      XLSX.utils.sheet_to_json(sheet);

    const valid = validateExcel(json);

    if (!valid) {

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
            className={`drop-zone ${isDragging ? "dragging" : ""}`}

            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}

            onDragLeave={() => setIsDragging(false)}

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