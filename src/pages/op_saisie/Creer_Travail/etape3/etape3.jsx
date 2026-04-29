// PlanningSection.jsx
import React from "react";
import "./etape3.css";

const PlanningSection = () => {
  return (
    <div className="planning-wrapper">

      {/* PROGRAMMATION */}
      <div className="section-block">

        <div className="section-title">
          <span className="icon">📅</span>
          <h2>Programmation</h2>
        </div>

        <div className="form-group full">
          <label>Date & Heure de début planifié</label>
          <input
            type="datetime-local"
            placeholder="mm/dd/yyyy --:-- --"
          />
        </div>

        <div className="grid-2">

          <div className="form-group">
            <label>Durée (en heures)</label>
            <input type="number" placeholder="ex: 4" />
          </div>

          <div className="form-group">
            <label>Heure de fin planifiée</label>

            <div className="auto-box">
              🔄 Calculé Auto
            </div>
          </div>

        </div>

        <div className="form-group full">
          <label>Date programmée au calendrier</label>
          <input type="date" />
        </div>

        <div className="form-group full">
          <label>Nombre de jours avant travaux</label>

          <div className="auto-box">
            🔄 Calculé Auto
          </div>
        </div>

      </div>

      {/* OBSERVATIONS */}
      <div className="section-block">

        <div className="section-title">
          <span className="icon">☰</span>
          <h2>Observations</h2>
        </div>

        <div className="form-group full">
          <textarea
            rows="6"
            placeholder="Saisir des observations complémentaires ou des contraintes spécifiques..."
          />
        </div>

      </div>

    </div>
  );
};

export default PlanningSection;