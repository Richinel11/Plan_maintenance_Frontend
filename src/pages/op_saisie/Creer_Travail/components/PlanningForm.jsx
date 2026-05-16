import {
  FileText,
  MapPin,
  Zap,
  ChevronDown,
  ClipboardCheck,
  Building2,
} from "lucide-react";

// import useServiceRole from "../../../ComponentsRole/ServiceRole";

export default function PlanningForm({
  formData,
  onChange,
  references,
  onReferenceChange,
  typesActivite,
//   chargesConsignation,
    service,
    fields,
    options,
}) {


  console.log("SERVICE =>", service);
  console.log("FIELDS =>", fields);

  const isFieldVisible = (field) =>
    fields.includes(field);
const PlanningForm = ({ fields,  step, formData, onChange }) => {
  const filteredFields = fields.filter((f) => f.step === step);

  return (
    <div>
      {filteredFields.map((field) => (
        <div key={field.name}>
          <label>{field.label}</label>

          <input
            value={formData[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

  return (
    <div className="step-one-container">

      {/* REFERENCE SECTION */}

      <div className="ref-section">

        <div
          className="field-row"
          style={{
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <label
            className="label-main"
            style={{ margin: 0 }}
          >
            Référence
          </label>

          <div
            className="badge-auto"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#dcfce7",
              color: "#166534",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "bold",
              marginLeft: "10px",
            }}
          >
            <ClipboardCheck
              size={12}
              style={{ marginRight: "4px" }}
            />

            <span>AUTO-REMPLI</span>
          </div>
        </div>

        <div className="ref-input-wrapper">

          <input
            type="text"
            value={formData.Reference}
            readOnly
            placeholder="La référence se génère automatiquement..."
            style={{ paddingLeft: "15px" }}
          />

        </div>

      </div>

      {/* MAIN CARD */}

      <div className="form-card">

        {/* NETWORK REFERENCE */}

        <div
          style={{
            marginBottom: "20px",
          }}
        >

          <SelectField
            label="Référence réseau"
            value={
              formData.reference_id || ""
            }
            options={references}
            placeholder="Sélectionner une référence"
            onChange={
              onReferenceChange
            }
          />

        </div>

        {/* GRID SELECTS */}

        <div className="fields-grid">

          {isFieldVisible(
            "Segments"
          ) && (
            <DisplayField
              label="Segment"
              value={
                formData.Segments
              }
              icon={
                <FileText size={20} />
              }
              isAuto
            />
          )}

          {isFieldVisible(
            "Ouvrages"
          ) && (
            <DisplayField
              label="Ouvrage"
              value={
                formData.Ouvrages
              }
              icon={
                <MapPin size={20} />
              }
              isAuto
            />
          )}

          {isFieldVisible(
            "Poste"
          ) && (
            <DisplayField
              label="Poste"
              value={
                formData.Poste
              }
              icon={
                <Building2
                  size={20}
                />
              }
              isAuto
            />
          )}

          {isFieldVisible(
            "Departs"
          ) && (
            <DisplayField
              label="Départ"
              value={
                formData.Departs
              }
              icon={
                <Zap size={20} />
              }
              isAuto
            />
          )}

          {isFieldVisible(
            "Unite_demanderesse"
          ) && (
            <SelectField
              label="Unité demanderesse"
              value={
                formData.Unite_demanderesse
              }
              options={
                options.Unite_demanderesse
              }
              placeholder="Sélectionner une unité"
              onChange={(val) =>
                onChange(
                  "Unite_demanderesse",
                  val
                )
              }
            />
          )}

          {isFieldVisible(
            "Exploitations"
          ) && (
            <SelectField
              label="Exploitations"
              value={
                formData.Exploitations
              }
              options={
                options.Exploitations
              }
              placeholder="Choisir l'exploitation"
              onChange={(val) =>
                onChange(
                  "Exploitations",
                  val
                )
              }
            />
          )}

          {isFieldVisible(
            "Type_de_travaux"
          ) && (
            <SelectField
              label="Types de travaux"
              value={
                formData.type_travaux_id || ""
              }
              options={
                typesActivite
              }
              placeholder="Nature des travaux"
              onChange={(val) =>
                onChange(
                  "type_travaux_id",
                  val
                )
              }
            />
          )}

          {isFieldVisible(
            "Types_de_reseau"
          ) && (
            <SelectField
              label="Types de réseau"
              value={
                formData.Types_de_reseau
              }
              options={
                options.Types_de_reseau
              }
              placeholder="Sélectionner le réseau"
              onChange={(val) =>
                onChange(
                  "Types_de_reseau",
                  val
                )
              }
            />
          )}

        </div>

        {/* TEXTAREA */}

        {isFieldVisible(
          "Consistances_Des_Travaux"
        ) &&
          service !==
            "distribution" && (
          <div
            style={{
              marginTop: "20px",
            }}
          >

            <label className="field-label">
              Consistances des travaux
            </label>

            <textarea
              placeholder="Décrivez en détail la nature technique de l'intervention..."
              value={
                formData.Consistances_Des_Travaux ||
                ""
              }
              onChange={(e) =>
                onChange(
                  "Consistances_Des_Travaux",
                  e.target.value
                )
              }
              className="form-textarea"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "6px",
                minHeight: "100px",
                resize: "vertical",
                fontFamily:
                  "inherit",
              }}
            />

          </div>
        )}

      </div>

    </div>
  );
}

/* ---------------- DISPLAY FIELD ---------------- */

function DisplayField({
  label,
  value,
  icon,
  isAuto,
}) {

  return (
    <div
      className="field-group"
      style={{
        marginBottom: "16px",
      }}
    >
      <div className="field-row">

        <span className="field-label">
          {label}
        </span>

        {isAuto && (
          <div className="badge-auto">

            <ClipboardCheck
              size={12}
            />

            <span>
              AUTO-REMPLI
            </span>

          </div>
        )}

      </div>

      <div className="display-box">

        <div className="icon-wrap">
          {icon}
        </div>

        <span className="value">
          {value || "Non spécifié"}
        </span>

      </div>

    </div>
  );
}

/* ---------------- SELECT FIELD ---------------- */

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}) {

  const isObjectArray =
    options &&
    options.length > 0 &&
    typeof options[0] ===
      "object";

  return (
    <div className="select-group">

      <label className="field-label">
        {label}
      </label>

      <div className="select-wrapper">

        <select
          value={value || ""}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
        >

          <option value="">
            {placeholder}
          </option>

          {options &&
            options.map((opt) => {

              if (
                isObjectArray
              ) {

                return (
                  <option
                    key={opt.id}
                    value={opt.id}
                  >
                    {opt.libelle ||
                      opt.nom ||
                      opt.name ||
                      `${opt.first_name || ""} ${
                        opt.last_name || ""
                      }`.trim()}
                  </option>
                );
              }

              return (
                <option
                  key={opt}
                  value={opt}
                >
                  {opt}
                </option>
              );
            })}

        </select>

        <ChevronDown
          className="chevron"
          size={18}
        />

      </div>

    </div>
  );
}