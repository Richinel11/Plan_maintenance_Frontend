import React, { useState } from "react";
import "./ReajustementManuel.css";
import { FaExclamationTriangle, FaTruck } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { BsCheckCircleFill, BsExclamationCircleFill } from "react-icons/bs";

const initialActivities = [
  {
    id: 1,
    category: "TRANSPORT — LOGISTIQUE",
    name: "OP-4421 - Livraison Composants",
    debut: "09:00",
    period: "AM",
    duree: 3,
    conflict: false,
  },
  {
    id: 2,
    category: "DISTRIBUTION — HAUTE TENSION",
    name: "MAINT-880 - Révision Relais A",
    debut: "01:30",
    period: "PM",
    duree: 4,
    conflict: true,
  },
  {
    id: 3,
    category: "DISTRIBUTION — HAUTE TENSION",
    name: "MAINT-881 - Révision Relais B",
    debut: "02:15",
    period: "PM",
    duree: 2,
    conflict: true,
  },
];

const timelineHours = ["08h", "10h", "12h", "14h", "16h", "18h"];

export default function ReajustementManuel() {
  const [activities, setActivities] = useState(initialActivities);

  const updateDuree = (id, delta) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, duree: Math.max(1, a.duree + delta) } : a
      )
    );
  };

  const updateDebut = (id, value) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, debut: value } : a))
    );
  };

  const updatePeriod = (id, value) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, period: value } : a))
    );
  };

  const validateTime = (e, id) => {
    const val = e.target.value;
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(val)) {
      e.target.value = activities.find((a) => a.id === id).debut;
    } else {
      updateDebut(id, val);
    }
  };

  return (
    <div className="rm-page">

      {/* ── Breadcrumb ── */}
      <div className="rm-breadcrumb">
        <span className="rm-breadcrumb-link">GESTION DES CONFLITS</span>
        <span className="rm-breadcrumb-sep"> › </span>
        <span className="rm-breadcrumb-active">RÉAJUSTEMENT MANUEL MULTI-CONFLITS</span>
      </div>

      {/* ── Alert Banner ── */}
      <div className="rm-alert-banner">
        <FaExclamationTriangle className="rm-alert-icon" />
        <div className="rm-alert-content">
          <h3>Alerte de Multi-Coactivité : Poste Delta</h3>
          <p>
            Collision détectée sur la ressource Poste Delta (Secteur Nord). Trois opérations
            distinctes sont planifiées simultanément sur la même plage horaire critique.
            Un réajustement est requis pour assurer la sécurité des techniciens.
          </p>
        </div>
      </div>

      {/* ── Timeline Visualization ── */}
      <div className="rm-timeline-section">
        <div className="rm-timeline-header">
          <span className="rm-timeline-title">VISUALISATION TEMPORELLE</span>
          <div className="rm-timeline-range">
            <span className="rm-range-badge">08:00</span>
            <span className="rm-range-badge">18:00</span>
          </div>
        </div>

        {/* Hours row */}
        <div className="rm-tl-row">
          <div className="rm-row-label"></div>
          <div className="rm-track rm-track-header">
            {timelineHours.map((h) => (
              <span key={h} className="rm-hour">{h}</span>
            ))}
          </div>
        </div>

        {/* Transport row */}
        <div className="rm-tl-row">
          <div className="rm-row-label">Transport</div>
          <div className="rm-track">
            <div className="rm-bar rm-bar-blue" style={{ left: "10%", width: "20%" }}>
              OP-4421 - Livraison
            </div>
          </div>
        </div>

        {/* Distribution A row */}
        <div className="rm-tl-row">
          <div className="rm-row-label">Distribution A</div>
          <div className="rm-track">
            <div className="rm-bar rm-bar-red" style={{ left: "40%", width: "28%" }}>
              MAINT-880 - Relais A
            </div>
          </div>
        </div>

        {/* Distribution B row */}
        <div className="rm-tl-row">
          <div className="rm-row-label">Distribution B</div>
          <div className="rm-track">
            <div className="rm-bar rm-bar-zone" style={{ left: "40%", width: "22%" }}>
              <span className="rm-zone-text">ZONE DE COACTIVITÉ INTERDITE</span>
            </div>
            <div className="rm-bar rm-bar-pink" style={{ left: "63%", width: "12%" }}>
              R...
            </div>
          </div>
        </div>

      </div>

      {/* ── Individual Configuration ── */}
      <div className="rm-config-section">
        <h3 className="rm-config-title">CONFIGURATION INDIVIDUELLE</h3>

        {activities.map((act) => (
          <div key={act.id} className={`rm-config-row ${act.conflict ? "conflict" : ""}`}>

            {/* Left — icon + info */}
            <div className="rm-config-left">
              <div className={`rm-config-icon ${act.conflict ? "icon-conflict" : "icon-normal"}`}>
                {act.conflict
                  ? <BsExclamationCircleFill size={18} />
                  : <FaTruck size={18} />
                }
              </div>
              <div className="rm-config-info">
                <span className="rm-config-category">{act.category}</span>
                <span className="rm-config-name">{act.name}</span>
              </div>
            </div>

            {/* Right — time + duration + status */}
            <div className="rm-config-right">

              {/* DÉBUT */}
              <div className="rm-config-field">
                <span className="rm-field-label">DÉBUT</span>
                <div className="rm-time-wrapper">
                  <input
                    type="time"
                    defaultValue={act.debut}
                    onBlur={(e) => validateTime(e, act.id)}
                    className={`rm-field-input ${act.conflict ? "input-conflict" : ""}`}
                  />
                  <select
                    value={act.period}
                    onChange={(e) => updatePeriod(act.id, e.target.value)}
                    className={`rm-period-select ${act.conflict ? "input-conflict" : ""}`}
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              {/* DURÉE */}
              <div className="rm-config-field">
                <span className="rm-field-label">DURÉE (H)</span>
                <div className="rm-counter">
                  <button
                    className="rm-counter-btn"
                    onClick={() => updateDuree(act.id, -1)}
                  >−</button>
                  <span className="rm-counter-value">{act.duree}</span>
                  <button
                    className="rm-counter-btn"
                    onClick={() => updateDuree(act.id, 1)}
                  >+</button>
                </div>
              </div>

              {/* Status icon */}
              {act.conflict
                ? <BsExclamationCircleFill className="rm-status-conflict" />
                : <BsCheckCircleFill className="rm-status-ok" />
              }

            </div>
          </div>
        ))}
      </div>

      {/* ── Conseil Box ── */}
      <div className="rm-conseil">
        <MdLocationOn className="rm-conseil-icon" />
        <p>
          <strong>Conseil :</strong> Décaler "Distribution B"
          après 17h30 pour libérer l'accès aux armoires haute tension.
        </p>
      </div>

      {/* ── Action Buttons ── */}
      <div className="rm-actions">
        <button className="rm-btn-validate">
          <BsCheckCircleFill size={15} /> Valider
        </button>
        <button className="rm-btn-cancel">Annuler</button>
      </div>

    </div>
  );
}