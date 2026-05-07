// PlanningSection.jsx
import React from "react";
import "./etape3.css";

const PlanningSection = ({ formData, onChange, fields, options }) => {
  const isFieldVisible = (field) => fields.includes(field);

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
      </div>

      {/* IMPACTS & PUISSANCES (Surtout pour Transport) */}
      {(isFieldVisible("Prevision_puissance_sollicite") || isFieldVisible("Prevision_ENF")) && (
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
              <div className="form-group">
                <label>Centrale thermique</label>
                <select 
                  value={formData.Centrale_thermique || ""}
                  onChange={(e) => onChange("Centrale_thermique", e.target.value)}
                >
                  <option value="">Sélectionner la centrale</option>
                  {options.Centrale_thermique.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
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
      <div className="section-block">
        <div className="section-title">
          <span className="icon">☰</span>
          <h2>Observations</h2>
        </div>

        {isFieldVisible("Obervations") && (
          <div className="form-group full">
            <textarea
              rows="4"
              placeholder="Saisir des observations complémentaires ou des contraintes spécifiques..."
              value={formData.Obervations || ""}
              onChange={(e) => onChange("Obervations", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningSection;