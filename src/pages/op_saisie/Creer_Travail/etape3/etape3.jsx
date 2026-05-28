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

      {/* LOCALISATION & TECHNIQUE (Distribution) - PLACÉ EN PREMIER */}
      {(isFieldVisible("Troncons") || isFieldVisible("Localites_impactees") || isFieldVisible("Moyens_mis_en_oeuvre")) && (
        <div className="section-block">
          <div className="section-title">
            <span className="icon">📍</span>
            <h2>Localisation &amp; Consistance</h2>
          </div>

          {isFieldVisible("Troncons") && (
            <div className="form-group full">
              <label>
                Tronçons / Consignes<span className="required-star">*</span>
              </label>
              <input
                type="text"
                placeholder="ex: Tronçon A, Section B..."
                value={formData.Troncons || ""}
                onChange={(e) => onChange("Troncons", e.target.value)}
                className={errors.Troncons ? "input-error" : ""}
              />
              {errors.Troncons && (
                <span className="field-error">⚠️ {errors.Troncons}</span>
              )}
            </div>
          )}

          {isFieldVisible("Localites_impactees") && (
            <div className="form-group full" style={{ marginTop: "15px" }}>
              <label>
                Localités impactées<span className="required-star">*</span>
              </label>
              <input
                type="text"
                placeholder="ex: Quartier X, Zone Y..."
                value={formData.Localites_impactees || ""}
                onChange={(e) => onChange("Localites_impactees", e.target.value)}
                className={errors.Localites_impactees ? "input-error" : ""}
              />
              {errors.Localites_impactees && (
                <span className="field-error">⚠️ {errors.Localites_impactees}</span>
              )}
            </div>
          )}

          {isFieldVisible("Moyens_mis_en_oeuvre") && (
            <div className="form-group full" style={{ marginTop: "15px" }}>
              <label>
                Moyens mis en œuvre<span className="required-star">*</span>
              </label>
              <textarea
                rows="2"
                placeholder="Listez les camions, équipes, matériels et autres moyens nécessaires..."
                value={formData.Moyens_mis_en_oeuvre || ""}
                onChange={(e) => onChange("Moyens_mis_en_oeuvre", e.target.value)}
                className={errors.Moyens_mis_en_oeuvre ? "input-error" : ""}
                style={{ resize: "vertical" }}
              />
              {errors.Moyens_mis_en_oeuvre && (
                <span className="field-error">⚠️ {errors.Moyens_mis_en_oeuvre}</span>
              )}
            </div>
          )}
        </div>
      )}

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
                  onChange={(val) => {
                    onChange("Centrale_thermique", val);
                    // Stocker aussi le label pour l'affichage dans le récap
                    const found = (options.Centrale_thermique || []).find(
                      (c) => String(c.id) === String(val)
                    );
                    onChange(
                      "Centrale_thermique_label",
                      found ? (found.valeur || found.nom || found.libelle || "") : ""
                    );
                  }}
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
