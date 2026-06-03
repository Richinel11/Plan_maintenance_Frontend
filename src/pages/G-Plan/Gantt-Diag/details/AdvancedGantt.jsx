import React, { useState } from "react";
import "./AdvancedGantt.css";
import { FaExclamationTriangle, FaLightbulb, FaBolt, FaBell } from "react-icons/fa";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { RiCloseCircleLine } from "react-icons/ri";
import { AiOutlineTool } from "react-icons/ai";

const availabilitySlots = [
  {
    id: "transport",
    date: "2023-10-13",
    localite: "Paris 15e",
    ouvrage: "PLANIFIÉ",
    disponibilite: "Libre",
    label: "Transport — Maintenance Transformateur T1",
  },
  {
    id: "distribution",
    date: "2023-10-13",
    localite: "Paris 15e",
    ouvrage: "PLANIFIÉ",
    disponibilite: "Libre",
    label: "Distribution — Élagage Ligne HTA-44",
  },
  {
    id: "transmission",
    date: "2023-10-14",
    localite: "Paris 15e",
    ouvrage: "PLANIFIÉ",
    disponibilite: "Libre",
    label: "Transmission — Contrôle Ligne THT-12",
  },
];

const activityCards = {
  transport: {
    id: "transport",
    headerClass: "transport",
    typeLabel: "TRANSPORT",
    icon: <FaBolt />,
    title: "Maintenance Transformateur T1",
    reference: "TR-2024-0892",
    periode: "07:00 – 12:00 (5h)",
    chevauchement: "08:00 - 12:00",
    impact: "Poste source Delta (Partiel)",
    imgClass: "transport-img",
  },
  distribution: {
    id: "distribution",
    headerClass: "distribution",
    typeLabel: "DISTRIBUTION",
    icon: <FaBell />,
    title: "Élagage Ligne HTA-44",
    reference: "DI-2024-1145",
    periode: "08:00 – 13:00 (5h)",
    chevauchement: "08:00 - 12:00",
    impact: "1 240 Usagers (Zone B)",
    imgClass: "distribution-img",
  },
  transmission: {
    id: "transmission",
    headerClass: "transmission",
    typeLabel: "TRANSMISSION",
    icon: <FaBolt />,
    title: "Contrôle Ligne THT-12",
    reference: "TX-2024-0341",
    periode: "09:00 – 14:00 (5h)",
    chevauchement: "09:00 - 12:00",
    impact: "Zone Nord (Partiel)",
    imgClass: "transmission-img",
  },
};

export default function AdvancedGantt() {
  const [checkedSlots, setCheckedSlots] = useState([]);
  const [selectedEntite, setSelectedEntite] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const toggleSlot = (id) => {
    setCheckedSlots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const visibleCards = checkedSlots.map((id) => activityCards[id]);

  return (
    <div className="ag-page">

      {/* 1 ── Alert Banner ── */}
      <div className="ag-alert-banner">
        <FaExclamationTriangle className="ag-alert-icon" />
        <div className="ag-alert-content">
          <h3>Diagnostic : Alerte de Co-activité</h3>
          <p>
            Un <span className="ag-highlight">chevauchement de 4 heures</span> a été
            détecté au le poste source Delta. Les protocoles de sécurité interdisent
            l'intervention simultanée de Transport et Distribution sur ce segment.
          </p>
        </div>
      </div>

      {/* 2 ── Availability Checker ── */}
      <div className="ag-availability">
        <div className="ag-avail-header">
          <MdLocationOn className="ag-avail-icon" />
          <h3>Vérification de Disponibilité Alternative</h3>
        </div>

        <div className="ag-avail-filters">
          <select
            className="ag-select"
            value={selectedEntite}
            onChange={(e) => setSelectedEntite(e.target.value)}
          >
            <option value="">Toutes les entités</option>
            <option value="production">Production</option>
            <option value="transport">Transport</option>
            <option value="distribution">Distribution</option>
          </select>

          <input
            type="date"
            className="ag-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <select
            className="ag-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="p1">P1 — Urgent (après coupure)</option>
            <option value="p2">P2 — Non urgent (1 à 7 jours)</option>
            <option value="p3">P3 — Non urgent (7j à 1 mois)</option>
            <option value="p4">P4 — Non urgent (1 mois à 1 trimestre)</option>
          </select>

          <button className="ag-search-btn">
            <MdSearch size={15} /> Rechercher des Créneaux
          </button>
        </div>

        <table className="ag-table">
          <thead>
            <tr>
              <th></th>
              <th>DATE/HEURE</th>
              <th>LOCALITÉ</th>
              <th>OUVRAGE</th>
              <th>DISPONIBILITÉ</th>
            </tr>
          </thead>
          <tbody>
            {availabilitySlots.map((slot) => (
              <tr
                key={slot.id}
                className={checkedSlots.includes(slot.id) ? "ag-row-checked" : ""}
                onClick={() => toggleSlot(slot.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={checkedSlots.includes(slot.id)}
                    onChange={() => toggleSlot(slot.id)}
                    className="ag-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>{slot.date}</td>
                <td>{slot.localite}</td>
                <td><span className="ag-planifie">{slot.ouvrage}</span></td>
                <td><span className="ag-libre">{slot.disponibilite}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {checkedSlots.length === 0 && (
          <p className="ag-helper-text">
            Cochez une ou plusieurs lignes pour voir les activités correspondantes.
          </p>
        )}
      </div>

      {/* 3 ── Dynamic Activity Cards ── */}
      {visibleCards.length > 0 && (
        <div className={`ag-tasks-row cards-${visibleCards.length}`}>
          {visibleCards.map((card) => (
            <div className="ag-task-card" key={card.id}>
              <div className={`ag-task-header ${card.headerClass}`}>
                <span className="ag-task-type">{card.typeLabel}</span>
                {card.icon}
              </div>
              <h3 className="ag-task-title">{card.title}</h3>
              <div className="ag-task-info">
                <div className="ag-info-row">
                  <span className="ag-info-label">Référence</span>
                  <span className="ag-info-value">{card.reference}</span>
                </div>
                <div className="ag-info-row">
                  <span className="ag-info-label">Période</span>
                  <span className="ag-info-value">{card.periode}</span>
                </div>
                <div className="ag-info-row">
                  <span className="ag-info-label">Chevauchement</span>
                  <span className="ag-info-value conflict">{card.chevauchement}</span>
                </div>
                <div className="ag-info-row">
                  <span className="ag-info-label">Impact Clients</span>
                  <span className="ag-info-value">{card.impact}</span>
                </div>
              </div>
              <div className={`ag-task-image ${card.imgClass}`}></div>
            </div>
          ))}
        </div>
      )}

      {/* 4 ── Suggestion ── */}
      <div className="ag-suggestion">
        <div className="ag-suggestion-header">
          <div className="ag-suggestion-left">
            <span className="ag-suggestion-badge">SUGGESTION</span>
            <span className="ag-suggestion-subtitle">Solution d'optimisation</span>
          </div>
          <FaLightbulb className="ag-suggestion-bulb" />
        </div>
        <h3 className="ag-suggestion-title">Décalage des Travaux Distribution (B)</h3>
        <p className="ag-suggestion-desc">
          En décalant le travail B de 08h00 à 13:00, nous supprimons le conflit sur le
          poste Delta tout en conservant la même fenêtre de coupure pour les usagers finaux.
        </p>
        <div className="ag-suggestion-time">
          <span className="ag-time-label">NOUVEL HORAIRE</span>
          <span className="ag-time-value">08:00</span>
          <span className="ag-arrow">→</span>
          <span className="ag-time-value">13:00</span>
        </div>
      </div>

      {/* 5 ── Action Buttons ── */}
      <div className="ag-actions">
        <div className="ag-actions-left">
          <button className="ag-btn-validate">
            <BsCheckCircleFill size={14} /> Valider la suggestion
          </button>
          <button className="ag-btn-adjust">
            <AiOutlineTool size={14} /> Réajuster manuellement
          </button>
        </div>
        <div className="ag-actions-right">
          <button className="ag-btn-reject">
            <RiCloseCircleLine size={16} /> Rejeter l'alerte
          </button>
        </div>
      </div>

    </div>
  );
}
