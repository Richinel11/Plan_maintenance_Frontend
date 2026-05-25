import React from "react";
import "./etape3.css";
import SearchableSelect from "../components/SearchableSelect";

const PlanningSection = ({ formData, onChange, fields, options, errors = {} }) => {
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
            <label>
              Date & Heure de début planifié<span className="required-star">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.Debut_planifiee || ""}
              onChange={(e) => onChange("Debut_planifiee", e.target.value)}
              className={errors.Debut_planifiee ? "input-error" : ""}
            />
            {errors.Debut_planifiee && (
              <span className="field-error">⚠️ {errors.Debut_planifiee}</span>
            )}
          </div>
        )}

        <div className="grid-2">

          {isFieldVisible("Duree") && (
            <div className="form-group">
              <label>
                Durée (en heures)<span className="required-star">*</span>
              </label>
              <input 
                type="number" 
                placeholder="ex: 4" 
                value={formData.Duree || ""}
                onChange={(e) => onChange("Duree", e.target.value)}
                className={errors.Duree ? "input-error" : ""}
              />
              {errors.Duree && (
                <span className="field-error">⚠️ {errors.Duree}</span>
              )}
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
            <label>
              Date programmée au calendrier<span className="required-star">*</span>
            </label>
            <input 
              type="date" 
              value={formData.Date_programmee || ""}
              onChange={(e) => onChange("Date_programmee", e.target.value)}
              className={errors.Date_programmee ? "input-error" : ""}
            />
            {errors.Date_programmee && (
              <span className="field-error">⚠️ {errors.Date_programmee}</span>
            )}
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
                <label>
                  Puissance sollicitée (MW)<span className="required-star">*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.Prevision_puissance_sollicite || ""}
                  onChange={(e) => onChange("Prevision_puissance_sollicite", e.target.value)}
                  className={errors.Prevision_puissance_sollicite ? "input-error" : ""}
                />
                {errors.Prevision_puissance_sollicite && (
                  <span className="field-error">⚠️ {errors.Prevision_puissance_sollicite}</span>
                )}
              </div>
            )}
            {isFieldVisible("Prevision_puissance_interrompue") && (
              <div className="form-group">
                <label>
                  Puissance interrompue (MW)<span className="required-star">*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.Prevision_puissance_interrompue || ""}
                  onChange={(e) => onChange("Prevision_puissance_interrompue", e.target.value)}
                  className={errors.Prevision_puissance_interrompue ? "input-error" : ""}
                />
                {errors.Prevision_puissance_interrompue && (
                  <span className="field-error">⚠️ {errors.Prevision_puissance_interrompue}</span>
                )}
              </div>
            )}
            {isFieldVisible("Prevision_ENF") && (
              <div className="form-group">
                <label>
                  Énergie Non Fournie (ENF)<span className="required-star">*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.Prevision_ENF || ""}
                  onChange={(e) => onChange("Prevision_ENF", e.target.value)}
                  className={errors.Prevision_ENF ? "input-error" : ""}
                />
                {errors.Prevision_ENF && (
                  <span className="field-error">⚠️ {errors.Prevision_ENF}</span>
                )}
              </div>
            )}
          </div>

          <div className="grid-2" style={{marginTop: "15px"}}>
            {isFieldVisible("Centrale_thermique") && (
              <div className="form-group">
                <SearchableSelect
                  label={<>Centrale thermique <span className="required-star" style={{ color: "#EF4444" }}>*</span></>}
                  value={formData.Centrale_thermique || ""}
                  options={options.Centrale_thermique || []}
                  placeholder="Sélectionner la centrale"
                  onChange={(val) => onChange("Centrale_thermique", val)}
                  hasError={!!errors.Centrale_thermique}
                />
                {errors.Centrale_thermique && (
                  <span className="field-error">⚠️ {errors.Centrale_thermique}</span>
                )}
              </div>
            )}
            {isFieldVisible("Qte_de_fuel") && (
              <div className="form-group">
                <label>
                  Quantité de fuel estimée<span className="required-star">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="ex: 500 Litres"
                  value={formData.Qte_de_fuel || ""}
                  onChange={(e) => onChange("Qte_de_fuel", e.target.value)}
                  className={errors.Qte_de_fuel ? "input-error" : ""}
                />
                {errors.Qte_de_fuel && (
                  <span className="field-error">⚠️ {errors.Qte_de_fuel}</span>
                )}
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
            <label>
              Observations<span className="required-star">*</span>
            </label>
            <textarea
              rows="4"
              placeholder="Saisir des observations complémentaires ou des contraintes spécifiques..."
              value={formData.Observations || ""}
              onChange={(e) => onChange("Observations", e.target.value)}
              className={errors.Observations ? "input-error" : ""}
            />
            {errors.Observations && (
              <span className="field-error">⚠️ {errors.Observations}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningSection;
