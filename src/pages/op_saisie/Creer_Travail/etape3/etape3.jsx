import React from "react";
import "./etape3.css";
import { ChevronDown } from "lucide-react";

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
    <div className="form-group">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 15px',
            borderRadius: '9px',
            border: '1px solid #cfd8e3',
            appearance: 'none',
            background: 'white',
            fontSize: '16px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">{placeholder}</option>
          {options &&
            options.map((opt) => {
              if (isObjectArray) {
                return (
                  <option key={opt.id} value={opt.id}>
                    {opt.libelle || opt.nom || opt.name || 
                     `${opt.first_name || ""} ${opt.last_name || ""}`.trim()}
                  </option>
                );
              }
              return (
                <option key={opt} value={opt}>{opt}</option>
              );
            })}
        </select>
        <ChevronDown
          className="chevron"
          size={20}
          style={{ 
            position: 'absolute', 
            right: '15px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            pointerEvents: 'none',
            color: '#44556c'
          }}
        />
      </div>
    </div>
  );
}

const PlanningSection = ({ formData, onChange, fields, options }) => {
  const isFieldVisible = (field) => fields.includes(field);

  const hasImpacts = 
    isFieldVisible("Prevision_puissance_sollicite") || 
    isFieldVisible("Prevision_puissance_interrompue") || 
    isFieldVisible("Prevision_ENF") || 
    isFieldVisible("Centrale_thermique") || 
    isFieldVisible("Qte_de_fuel");

  return (
    <div className="planning-wrapper">

      {/* PROGRAMMATION */}
      <div className="section-block">

        <div className="section-title">
          <span className="icon">📅</span>
          <h2>Programmation</h2>
        </div>

        {isFieldVisible("Debut_planifiee") && (
          <div className="form-group full">
            <label>Date & Heure de début planifié</label>
            <input
              type="datetime-local"
              value={formData.Debut_planifiee || ""}
              onChange={(e) => onChange("Debut_planifiee", e.target.value)}
            />
          </div>
        )}

        <div className="grid-2">

          {isFieldVisible("Duree") && (
            <div className="form-group">
              <label>Durée (en heures)</label>
              <input 
                type="number" 
                placeholder="ex: 4" 
                value={formData.Duree || ""}
                onChange={(e) => onChange("Duree", e.target.value)}
              />
            </div>
          )}

          {isFieldVisible("Fin_planifiee") && (
            <div className="form-group">
              <label>Heure de fin planifiée</label>
              <div className="auto-box">
                {formData.Fin_planifiee || "🔄 Calculé Auto"}
              </div>
            </div>
          )}

        </div>

        {isFieldVisible("Date_programmee") && (
          <div className="form-group full">
            <label>Date programmée au calendrier</label>
            <input 
              type="date" 
              value={formData.Date_programmee || ""}
              onChange={(e) => onChange("Date_programmee", e.target.value)}
            />
          </div>
        )}

        {isFieldVisible("Jour_avant_travaux") && (
          <div className="form-group full">
            <label>Nombre de jours avant travaux</label>
            <div className="auto-box">
              {formData.Jour_avant_travaux !== undefined && formData.Jour_avant_travaux !== null 
                ? `${formData.Jour_avant_travaux} jour(s)` 
                : "🔄 Calculé Auto"}
            </div>
          </div>
        )}
      </div>

      {/* IMPACTS & PUISSANCES (Surtout pour Transport) */}
      {hasImpacts && (
        <div className="section-block">
          <div className="section-title">
            <span className="icon">⚡</span>
            <h2>Prévisions & Impacts</h2>
          </div>

          <div className="grid-2">
            {isFieldVisible("Prevision_puissance_sollicite") && (
              <div className="form-group">
                <label>Puissance sollicitée (MW)</label>
                <input 
                  type="number" 
                  value={formData.Prevision_puissance_sollicite || ""}
                  onChange={(e) => onChange("Prevision_puissance_sollicite", e.target.value)}
                />
              </div>
            )}
            {isFieldVisible("Prevision_puissance_interrompue") && (
              <div className="form-group">
                <label>Puissance interrompue (MW)</label>
                <input 
                  type="number" 
                  value={formData.Prevision_puissance_interrompue || ""}
                  onChange={(e) => onChange("Prevision_puissance_interrompue", e.target.value)}
                />
              </div>
            )}
            {isFieldVisible("Prevision_ENF") && (
              <div className="form-group">
                <label>Énergie Non Fournie (ENF)</label>
                <input 
                  type="number" 
                  value={formData.Prevision_ENF || ""}
                  onChange={(e) => onChange("Prevision_ENF", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid-2" style={{marginTop: "15px"}}>
            {isFieldVisible("Centrale_thermique") && (
              <SelectField
                label="Centrale thermique"
                value={formData.Centrale_thermique || ""}
                options={options.Centrale_thermique}
                placeholder="Sélectionner la centrale"
                onChange={(val) => onChange("Centrale_thermique", val)}
              />
            )}
            {isFieldVisible("Qte_de_fuel") && (
              <div className="form-group">
                <label>Quantité de fuel estimée</label>
                <input 
                  type="text" 
                  placeholder="ex: 500 Litres"
                  value={formData.Qte_de_fuel || ""}
                  onChange={(e) => onChange("Qte_de_fuel", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* OBSERVATIONS */}
      {isFieldVisible("Observations") && (
        <div className="section-block">
          <div className="section-title">
            <span className="icon">☰</span>
            <h2>Observations</h2>
          </div>

          <div className="form-group full">
            <textarea
              rows="4"
              placeholder="Saisir des observations complémentaires ou des contraintes spécifiques..."
              value={formData.Observations || ""}
              onChange={(e) => onChange("Observations", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningSection;
