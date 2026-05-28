// src/pages/op_saisie/Recap/recap.jsx

import React from "react";
import "./recap.css";

const RecapPlanning = ({ formData, fields = [] }) => {
  // Si fields est vide (par exemple s'il n'est pas passé), on affiche tout par défaut
  const isFieldVisible = (field) => fields.length === 0 || fields.includes(field);

  const showSection2 =
    isFieldVisible("Troncons") ||
    isFieldVisible("Localites_impactees") ||
    isFieldVisible("Consistances_Des_Travaux") ||
    isFieldVisible("Moyens_mis_en_oeuvre") ||
    isFieldVisible("Charges_de_consignation") ||
    isFieldVisible("Disponibilite_mecanique");

  const showSection3 =
    isFieldVisible("Debut_planifiee") ||
    isFieldVisible("Duree") ||
    isFieldVisible("Fin_planifiee") ||
    isFieldVisible("Date_programmee") ||
    isFieldVisible("Prevision_puissance_sollicite") ||
    isFieldVisible("Prevision_puissance_interrompue") ||
    isFieldVisible("Prevision_ENF") ||
    isFieldVisible("Observations");

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

          {isFieldVisible("Reference") && (
            <div className="info-item">
              <label>Référence</label>
              <span>
                {formData.Reference || "-"}
              </span>
            </div>
          )}

          {isFieldVisible("Segments") && (
            <div className="info-item">
              <label>Segment</label>
              <span>
                {formData.Segments || "-"}
              </span>
              <small className="badge green">
                AUTO-REMPLI
              </small>
            </div>
          )}

          {isFieldVisible("Ouvrages") && (
            <div className="info-item">
              <label>Ouvrage</label>

              <span>
                {formData.Ouvrages || "-"}
              </span>

              <small className="badge green">
                AUTO-REMPLI
              </small>
            </div>
          )}

          {isFieldVisible("Poste") && (
            <div className="info-item">
              <label>Poste concerné</label>

              <span>
                {formData.Poste || "-"}
              </span>

              <small className="badge green">
                AUTO-REMPLI
              </small>
            </div>
          )}

          {isFieldVisible("Departs") && (
            <div className="info-item">
              <label>Départ</label>

              <span>
                {formData.Departs || "-"}
              </span>

              <small className="badge green">
                AUTO-REMPLI
              </small>
            </div>
          )}

          {isFieldVisible("Unite_demanderesse") && (
            <div className="info-item">
              <label>Unité demanderesse</label>

              <span>
                {formData.Unite_demanderesse || "-"}
              </span>
            </div>
          )}

          {isFieldVisible("Exploitations") && (
            <div className="info-item">
              <label>Exploitations</label>

              <span>
                {formData.Exploitations || "-"}
              </span>
            </div>
          )}

          {isFieldVisible("Type_de_travaux") && (
            <div className="info-item">
              <label>Type de travaux</label>
              <span className="blue-link">
                {formData.Type_de_travaux || "-"}
              </span>
            </div>
          )}

          {isFieldVisible("Types_de_reseau") && (
            <div className="info-item">
              <label>Type de réseau</label>

              <span>
                {formData.Types_de_reseau || "-"}
              </span>
            </div>
          )}

          {isFieldVisible("Centrale_thermique") && (
            <div className="info-item">
              <label>Centrale thermique</label>
              <span>
                {formData.Centrale_thermique_label || "-"}
              </span>
            </div>
          )}

          {isFieldVisible("Qte_de_fuel") && (
            <div className="info-item">
              <label>Quantité de fuel</label>

              <span>
                {formData.Qte_de_fuel || "-"}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* SECTION 2 */}
      {showSection2 && (
        <div className="card-section">

          <h2>
            📍 Section 2 : Localisation & Consistance
          </h2>

          {(isFieldVisible("Troncons") || isFieldVisible("Localites_impactees")) && (
            <div className="two-column">

              {isFieldVisible("Troncons") && (
                <div className="block">
                  <label>
                    TRONÇONS / CONSIGNES
                  </label>

                  <p>
                    {formData.Troncons || "-"}
                  </p>
                </div>
              )}

              {isFieldVisible("Localites_impactees") && (
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
              )}

            </div>
          )}

          {isFieldVisible("Consistances_Des_Travaux") && (
            <div className="block full-block">

              <label>
                CONSISTANCE DES TRAVAUX
              </label>

              <p>
                {formData.Consistances_Des_Travaux || "-"}
              </p>

            </div>
          )}

          {isFieldVisible("Disponibilite_mecanique") && (
            <div className="block full-block">

              <label>
                DISPONIBILITÉ MÉCANIQUE
              </label>

              <p>
                {formData.Disponibilite_mecanique || "-"}
              </p>

            </div>
          )}

          {(isFieldVisible("Moyens_mis_en_oeuvre") || isFieldVisible("Charges_de_consignation")) && (
            <div className="two-column">

              {isFieldVisible("Moyens_mis_en_oeuvre") && (
                <div className="block">

                  <label>
                    MOYENS MIS EN ŒUVRE
                  </label>

                  <p>
                    {formData.Moyens_mis_en_oeuvre || "-"}
                  </p>

                </div>
              )}

              {isFieldVisible("Charges_de_consignation") && (
                <div className="block">
                  <label>
                    CHARGES DE CONSIGNATION
                  </label>
                  <p>
                    {formData.Charges_de_consignation_label || "-"}
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* SECTION 3 */}
      {showSection3 && (
        <div className="card-section">

          <h2>
            📅 Section 3 : Programmation & Impact
          </h2>

          {(isFieldVisible("Debut_planifiee") || isFieldVisible("Duree") || isFieldVisible("Fin_planifiee")) && (
            <div className="schedule-boxes">

              {isFieldVisible("Debut_planifiee") && (
                <div className="time-box">

                  <label>
                    DATE & HEURE DÉBUT
                  </label>

                  <strong>
                    {formData.Debut_planifiee || "-"}
                  </strong>

                </div>
              )}

              {isFieldVisible("Duree") && (
                <div className="time-box">

                  <label>
                    DURÉE PRÉVUE
                  </label>

                  <strong>
                    {formData.Duree || "-"} Heures
                  </strong>

                </div>
              )}

              {isFieldVisible("Fin_planifiee") && (
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
              )}

            </div>
          )}

          {(isFieldVisible("Date_programmee") ||
            isFieldVisible("Prevision_puissance_sollicite") ||
            isFieldVisible("Prevision_puissance_interrompue") ||
            isFieldVisible("Prevision_ENF")) && (
            <div className="info-grid second-grid">

              {isFieldVisible("Date_programmee") && (
                <div className="info-item">

                  <label>
                    Date programmée
                  </label>

                  <span>
                    {formData.Date_programmee || "-"}
                  </span>

                </div>
              )}

              {isFieldVisible("Prevision_puissance_sollicite") && (
                <div className="info-item">

                  <label>
                    Puissance sollicitée
                  </label>

                  <span>
                    {formData.Prevision_puissance_sollicite || "-"} MW
                  </span>

                </div>
              )}

              {isFieldVisible("Prevision_puissance_interrompue") && (
                <div className="info-item">

                  <label>
                    Puissance interrompue
                  </label>

                  <span>
                    {formData.Prevision_puissance_interrompue || "-"} MW
                  </span>

                </div>
              )}

              {isFieldVisible("Prevision_ENF") && (
                <div className="info-item">

                  <label>
                    END / ENF
                  </label>

                  <span>
                    {formData.Prevision_ENF || "-"}
                  </span>

                </div>
              )}

            </div>
          )}

          {isFieldVisible("Observations") && (
            <div className="observation-box">

              <label>
                OBSERVATIONS
              </label>

              <p>
                {formData.Observations || formData.Obervations || "-"}
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default RecapPlanning;