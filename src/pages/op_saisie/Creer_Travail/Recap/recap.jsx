// RecapPlanning.jsx
import React from "react";
import "./recap.css";

const RecapPlanning = () => {
  return (
    <div className="recap-container">

      {/* HEADER */}
      <div className="top-header">
        <div>
          <h1>Récapitulatif de votre proposition de planning</h1>
          <p>
            Veuillez vérifier l'exactitude des informations avant la soumission
            finale au service d'approbation.
          </p>
        </div>

        <button className="download-btn">Télécharger</button>
      </div>

      {/* SECTION 1 */}
      <div className="card-section">
        <h2>ⓘ Section 1 : Identification & Organisation</h2>

        <div className="info-grid">

          <div className="info-item">
            <label>Référence</label>
            <span>MAINT-2023-089</span>
          </div>

          <div className="info-item">
            <label>Titre</label>
            <span>Remplacement Isolateurs</span>
            <small className="badge green">AUTO-REMPLI</small>
          </div>

          <div className="info-item">
            <label>Poste concerné</label>
            <span>Poste Delta</span>
            <small className="badge green">AUTO-REMPLI</small>
          </div>

          <div className="info-item">
            <label>Départ</label>
            <span>Ligne 225kV Nord</span>
            <small className="badge green">AUTO-REMPLI</small>
          </div>

          <div className="info-item">
            <label>Unité demanderesse</label>
            <span>Direction Techniques</span>
          </div>

          <div className="info-item">
            <label>Exploitations</label>
            <span>Exploitation Est</span>
          </div>

          <div className="info-item">
            <label>Type de travaux</label>
            <span className="blue-link">MAINTENANCE CURATIVE</span>
          </div>

          <div className="info-item">
            <label>Type de réseau</label>
            <span>Réseau Transport</span>
          </div>

          <div className="info-item">
            <label>Centrale thermique</label>
            <span>Centrale Gaz Ouest</span>
          </div>

          <div className="info-item">
            <label>Quantité de fuel</label>
            <span>1,250 Litres / jour</span>
          </div>

        </div>
      </div>

      {/* SECTION 2 */}
      <div className="card-section">
        <h2>📍 Section 2 : Localisation & Consistance</h2>

        <div className="two-column">

          <div className="block">
            <label>TRONÇONS / CONSIGNES</label>
            <p>
              Section A12 à B45, Circuit principal uniquement.
              Mise hors tension requise pour toute la durée des opérations.
            </p>
          </div>

          <div className="block">
            <label>LOCALITÉS IMPACTÉES</label>

            <div className="tags">
              <span>Quartier Nord</span>
              <span>Zone Industrielle Delta</span>
              <span>Banlieue Est</span>
            </div>
          </div>

        </div>

        <div className="block full-block">
          <label>CONSISTANCE DES TRAVAUX</label>
          <p>
            Remplacement complet des isolateurs en verre par des modèles
            composites sur 4 pylônes. Nettoyage des têtes de câbles et
            vérification des ancrages au sol. Tests de continuité après
            intervention.
          </p>
        </div>

        <div className="two-column">

          <div className="block">
            <label>MOYENS MIS EN ŒUVRE</label>
            <p>
              Camion nacelle 24m <br />
              Équipe technique (4 agents) <br />
              Lot outillage HTB
            </p>
          </div>

          <div className="block">
            <label>CHARGES DE CONSIGNATION</label>
            <p>
              Responsable : M. Jean Dupont (Unité Exploitation)
            </p>
          </div>

        </div>

      </div>

      {/* SECTION 3 */}
      <div className="card-section">
        <h2>📅 Section 3 : Programmation & Impact</h2>

        <div className="schedule-boxes">

          <div className="time-box">
            <label>DATE & HEURE DÉBUT</label>
            <strong>25 Oct. 2023 - 08:00</strong>
          </div>

          <div className="time-box">
            <label>DURÉE PRÉVUE</label>
            <strong>06 Heures</strong>
          </div>

          <div className="time-box">
            <label>HEURE DE FIN</label>
            <strong>14:00</strong>
            <small className="badge green">CALCULÉ AUTO</small>
          </div>

        </div>

        <div className="info-grid second-grid">

          <div className="info-item">
            <label>Date programmée</label>
            <span>Mardi 25 Octobre 2023</span>
          </div>

          <div className="info-item">
            <label>Nombre de jours avant travaux</label>
            <span>12 Jours</span>
            <small className="badge green">CALCULÉ AUTO</small>
          </div>

          <div className="info-item">
            <label>Clients coupés</label>
            <span>1,450 Clients (MT/BT)</span>
          </div>

          <div className="info-item">
            <label>Puissance interrompue</label>
            <span>3.2 MW</span>
          </div>

          <div className="info-item">
            <label>END (Énergie Non Distribuée)</label>
            <span>19.2 MWh</span>
            <small className="badge green">CALCULÉ AUTO</small>
          </div>

        </div>

        <div className="observation-box">
          <label>OBSERVATIONS</label>
          <p>
            Nécessite une coordination étroite avec le dispatching régional.
            En cas d'intempéries, les travaux seront reportés au lendemain à la
            même heure.
          </p>
        </div>

      </div>

    </div>
  );
};

export default RecapPlanning;