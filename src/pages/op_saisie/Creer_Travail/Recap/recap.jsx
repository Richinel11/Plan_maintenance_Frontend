// src/pages/op_saisie/Recap/recap.jsx

import React from "react";
import "./recap.css";

const RecapPlanning = ({ formData }) => {
  return (
    <div className="recap-container">

      {/* HEADER */}
      <div className="top-header">
        <div>
          <h1>Récapitulatif de votre proposition de planning</h1>

          <p>
            Veuillez vérifier l'exactitude des informations
            avant la soumission finale.
          </p>
        </div>

        <button className="download-btn">
          Télécharger
        </button>
      </div>

      {/* SECTION 1 */}
      <div className="card-section">

        <h2>
          ⓘ Section 1 : Identification & Organisation
        </h2>

        <div className="info-grid">

          <div className="info-item">
            <label>Référence</label>
            <span>
              {formData.Reference || "-"}
            </span>
          </div>

          <div className="info-item">
            <label>Ouvrage</label>

            <span>
              {formData.Ouvrages || "-"}
            </span>

            <small className="badge green">
              AUTO-REMPLI
            </small>
          </div>

          <div className="info-item">
            <label>Poste concerné</label>

            <span>
              {formData.Poste || "-"}
            </span>

            <small className="badge green">
              AUTO-REMPLI
            </small>
          </div>

          <div className="info-item">
            <label>Départ</label>

            <span>
              {formData.Departs || "-"}
            </span>

            <small className="badge green">
              AUTO-REMPLI
            </small>
          </div>

          <div className="info-item">
            <label>Unité demanderesse</label>

            <span>
              {formData.Unite_demanderesse || "-"}
            </span>
          </div>

          <div className="info-item">
            <label>Exploitations</label>

            <span>
              {formData.Exploitations || "-"}
            </span>
          </div>

          <div className="info-item">
            <label>Type de travaux</label>

            <span className="blue-link">
              {formData.Type_de_travaux ||
                formData.type_travaux_id ||
                "-"}
            </span>
          </div>

          <div className="info-item">
            <label>Type de réseau</label>

            <span>
              {formData.Types_de_reseau || "-"}
            </span>
          </div>

          <div className="info-item">
            <label>Centrale thermique</label>

            <span>
              {formData.Centrale_thermique || "-"}
            </span>
          </div>

          <div className="info-item">
            <label>Quantité de fuel</label>

            <span>
              {formData.Qte_de_fuel || "-"}
            </span>
          </div>

        </div>
      </div>

      {/* SECTION 2 */}
      <div className="card-section">

        <h2>
          📍 Section 2 : Localisation & Consistance
        </h2>

        <div className="two-column">

          <div className="block">
            <label>
              TRONÇONS / CONSIGNES
            </label>

            <p>
              {formData.Troncons || "-"}
            </p>
          </div>

          <div className="block">

            <label>
              LOCALITÉS IMPACTÉES
            </label>

            <div className="tags">

              {formData.Localites_impactees
                ? formData.Localites_impactees
                    .split(",")
                    .map((item, index) => (
                      <span key={index}>
                        {item.trim()}
                      </span>
                    ))
                : <span>-</span>}

            </div>
          </div>

        </div>

        <div className="block full-block">

          <label>
            CONSISTANCE DES TRAVAUX
          </label>

          <p>
            {formData.Consistances_Des_Travaux || "-"}
          </p>

        </div>

        <div className="two-column">

          <div className="block">

            <label>
              MOYENS MIS EN ŒUVRE
            </label>

            <p>
              {formData.Moyens_mis_en_oeuvre || "-"}
            </p>

          </div>

          <div className="block">

            <label>
              CHARGES DE CONSIGNATION
            </label>

            <p>
              {formData.charge_consignation_id || "-"}
            </p>

          </div>

        </div>

      </div>

      {/* SECTION 3 */}
      <div className="card-section">

        <h2>
          📅 Section 3 : Programmation & Impact
        </h2>

        <div className="schedule-boxes">

          <div className="time-box">

            <label>
              DATE & HEURE DÉBUT
            </label>

            <strong>
              {formData.Debut_planifiee || "-"}
            </strong>

          </div>

          <div className="time-box">

            <label>
              DURÉE PRÉVUE
            </label>

            <strong>
              {formData.Duree || "-"} Heures
            </strong>

          </div>

          <div className="time-box">

            <label>
              HEURE DE FIN
            </label>

            <strong>
              {formData.Fin_planifiee || "-"}
            </strong>

            <small className="badge green">
              CALCULÉ AUTO
            </small>

          </div>

        </div>

        <div className="info-grid second-grid">

          <div className="info-item">

            <label>
              Date programmée
            </label>

            <span>
              {formData.Date_programmee || "-"}
            </span>

          </div>

          <div className="info-item">

            <label>
              Puissance sollicitée
            </label>

            <span>
              {formData.Prevision_puissance_sollicite || "-"} MW
            </span>

          </div>

          <div className="info-item">

            <label>
              Puissance interrompue
            </label>

            <span>
              {formData.Prevision_puissance_interrompue || "-"} MW
            </span>

          </div>

          <div className="info-item">

            <label>
              END / ENF
            </label>

            <span>
              {formData.Prevision_ENF || "-"}
            </span>

          </div>

        </div>

        <div className="observation-box">

          <label>
            OBSERVATIONS
          </label>

          <p>
            {formData.Obervations || "-"}
          </p>

        </div>

      </div>

    </div>
  );
};

export default RecapPlanning;