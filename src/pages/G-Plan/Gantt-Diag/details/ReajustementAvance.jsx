import React, { useState } from "react";
import "./ReajustementAvance.css";
import {
  FaExclamationTriangle,
  FaTruck,
  FaChartLine,
  FaRedo,
  FaBolt,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  BsCheckCircleFill,
  BsExclamationCircleFill,
} from "react-icons/bs";
import { MdLocationOn, MdClose } from "react-icons/md";

const weekDays = [
  { label: "MON", num: "01" },
  { label: "TUE", num: "02" },
  { label: "WED", num: "03" },
  { label: "THU", num: "04" },
  { label: "FRI", num: "05" },
  { label: "SAT", num: "06" },
  { label: "SUN", num: "07" },
];

const assetRows = [
  {
    id: 1,
    asset: "Poste Delta",
    type: "DISTRIBUTION",
    tasks: [
      { day: 0, label: "MAINT-...", color: "blue", hasAlert: true },
      { day: 3, label: "MAINT-912", color: "blue", hasRefresh: true },
    ],
  },
  {
    id: 2,
    asset: "Ligne HTA-44",
    type: "NETWORK",
    tasks: [
      { day: 2, label: "INSP-044", color: "green" },
      { day: 4, label: "PREV-552", color: "grey" },
    ],
  },
  {
    id: 3,
    asset: "Générateur G-01",
    type: "BACKUP POWER",
    tasks: [
      { day: 1, label: "MAINT-895", color: "blue", hasIcon: true },
    ],
  },
];

const initialPending = [
  {
    id: "maint-880",
    badge: "MAINT-880",
    location: "Poste Delta",
    originalDate: "Apr 01, 08:30",
    newDate: "04/03/2024",
    suggestion: "Suggestion: Group with MAINT-912 on Wed 03",
    hasApplyButton: false,
  },
  {
    id: "maint-912",
    badge: "MAINT-912",
    location: "Poste Delta",
    originalDate: "Apr 05, 14:00",
    newDate: "04/03/2024",
    suggestion: null,
    hasApplyButton: true,
  },
];

const initialActivities = [
  {
    id: 1,
    category: "TRANSPORT — LOGISTIQUE",
    name: "OP-4421 - Livraison Composants",
    debut: "09:00",
    duree: 3,
    conflict: false,
  },
  {
    id: 2,
    category: "DISTRIBUTION A — HAUTE TENSION",
    name: "MAINT-880 - Révision Relais A",
    debut: "13:30",
    duree: 4,
    conflict: true,
  },
  {
    id: 3,
    category: "DISTRIBUTION B — HAUTE TENSION",
    name: "MAINT-881 - Révision Relais B",
    debut: "14:15",
    duree: 2,
    conflict: true,
  },
];

export default function ReajustementAvance() {
  const [pending, setPending] = useState(initialPending);
  const [activities, setActivities] = useState(initialActivities);

  const removePending = (id) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const updateDuree = (id, delta) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, duree: Math.max(1, a.duree + delta) } : a
      )
    );
  };

  return (
    <div className="ra-page">

      {/* ── Breadcrumb ── */}
      <div className="ra-breadcrumb">
        <span className="ra-breadcrumb-link">GESTION DES CONFLITS</span>
        <span className="ra-breadcrumb-sep"> › </span>
        <span className="ra-breadcrumb-active">RÉAJUSTEMENT MANUEL MULTI-CONFLITS</span>
      </div>

      {/* ── Alert Banner ── */}
      <div className="ra-alert-banner">
        <FaExclamationTriangle className="ra-alert-icon" />
        <div className="ra-alert-content">
          <h3>Alerte de Multi-Coactivité : Poste Delta</h3>
          <p>
            Collision détectée sur la ressource Poste Delta (Secteur Nord). Trois opérations
            distinctes sont planifiées simultanément sur la même plage horaire critique.
            Un réajustement est requis pour assurer la sécurité des techniciens.
          </p>
        </div>
      </div>

      {/* ── Main Wrapper: Left + Right Panel ── */}
      <div className="ra-main-wrapper">

        {/* LEFT — Calendar + Pending */}
        <div className="ra-left-content">

          {/* Weekly Calendar */}
          <div className="ra-calendar">
            <div className="ra-cal-header">
              <div className="ra-cal-asset-col">
                <span className="ra-col-label">ASSET</span>
                <span className="ra-col-label">UNIT</span>
              </div>
              {weekDays.map((d) => (
                <div key={d.num} className="ra-cal-day-col">
                  <span className="ra-day-label">{d.label}</span>
                  <span className="ra-day-num">{d.num}</span>
                </div>
              ))}
            </div>

            {assetRows.map((row) => (
              <div key={row.id} className="ra-cal-row">
                <div className="ra-cal-asset-col">
                  <span className="ra-asset-name">{row.asset}</span>
                  <span className="ra-asset-type">{row.type}</span>
                </div>
                {weekDays.map((d, dayIndex) => {
                  const task = row.tasks.find((t) => t.day === dayIndex);
                  return (
                    <div key={d.num} className="ra-cal-cell">
                      {task && (
                        <div className={`ra-task-pill ${task.color}`}>
                          <span>{task.label}</span>
                          {task.hasAlert && (
                            <span className="ra-pill-alert-dot"></span>
                          )}
                          {task.hasRefresh && (
                            <FaRedo size={8} />
                          )}
                          {task.hasIcon && (
                            <FaBolt size={8} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Pending Adjustments */}
          <div className="ra-pending-section">
            <div className="ra-pending-header">
              <FaCalendarAlt className="ra-pending-header-icon" />
              <h3>PENDING ADJUSTMENTS</h3>
            </div>

            <div className="ra-pending-cards">
              {pending.map((p) => (
                <div key={p.id} className="ra-pending-card">
                  <div className="ra-pending-card-top">
                    <span className="ra-pending-badge">{p.badge}</span>
                    <button
                      className="ra-pending-close"
                      onClick={() => removePending(p.id)}
                    >
                      <MdClose size={16} />
                    </button>
                  </div>

                  <h4 className="ra-pending-location">{p.location}</h4>

                  <div className="ra-pending-dates">
                    <div className="ra-date-col">
                      <span className="ra-date-label">ORIGINAL DATE</span>
                      <span className="ra-date-value">{p.originalDate}</span>
                    </div>
                    <div className="ra-date-col highlight">
                      <span className="ra-date-label">NEW DATE</span>
                      <span className="ra-date-value new">{p.newDate}</span>
                    </div>
                  </div>

                  {p.suggestion && (
                    <span className="ra-suggestion-link">
                      <FaBolt size={11} />
                      {p.suggestion}
                    </span>
                  )}

                  {p.hasApplyButton && (
                    <button className="ra-btn-appliquer">
                      <FaBolt size={11} /> APPLIQUER LE REGROUPEMENT
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL — spans full height */}
        <div className="ra-right-panel">
          <div className="ra-impact-header">
            <FaChartLine className="ra-impact-icon" />
            <span className="ra-impact-title">IMPACT DE L'AJUSTEMENT</span>
          </div>

          <div className="ra-impact-row">
            <span className="ra-impact-label">Conflits Actifs</span>
            <span className="ra-critical-badge">CRITICAL</span>
          </div>

          <div className="ra-conflict-number">02</div>
          <div className="ra-conflict-bar"></div>

          <div className="ra-score-box">
            <div className="ra-score-header">
              <span className="ra-score-label">OPTIMIZATION SCORE</span>
              <FaChartLine className="ra-score-icon" />
            </div>
            <div className="ra-score-value">
              84%
              <span className="ra-score-tag">Optimized</span>
            </div>
            <p className="ra-score-desc">
              Shift technique, grouping selection on Thursday
            </p>
          </div>

          <div className="ra-metrics">
            <div className="ra-metric-row">
              <span className="ra-metric-label">Downtime Reduction</span>
              <span className="ra-metric-value negative">-4.5 hrs</span>
            </div>
            <div className="ra-metric-row">
              <span className="ra-metric-label">Resource Efficiency</span>
              <span className="ra-metric-value positive">+12%</span>
            </div>
            <div className="ra-metric-row">
              <span className="ra-metric-label">Travel Savings</span>
              <span className="ra-metric-value neutral">18 km</span>
            </div>
          </div>

          <button className="ra-btn-valider-semaine">
            VALIDER LA SEMAINE
          </button>
          <button className="ra-btn-reinitialiser">
            <FaRedo size={11} /> RÉINITIALISER
          </button>

          <div className="ra-system-status">
            <span className="ra-status-label">SYSTEM STATUS</span>
            <div className="ra-status-row">
              <span className="ra-status-dot"></span>
              <span className="ra-status-text">Algo-Planner v4.2 Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Configuration Individuelle ── */}
      <div className="ra-config-section">
        <h3 className="ra-config-title">CONFIGURATION INDIVIDUELLE</h3>

        {activities.map((act) => (
          <div
            key={act.id}
            className={`ra-config-row ${act.conflict ? "conflict" : ""}`}
          >
            <div className="ra-config-left">
              <div className={`ra-config-icon ${act.conflict ? "icon-conflict" : "icon-normal"}`}>
                {act.conflict
                  ? <BsExclamationCircleFill size={18} />
                  : <FaTruck size={18} />
                }
              </div>
              <div className="ra-config-info">
                <span className="ra-config-category">{act.category}</span>
                <span className="ra-config-name">{act.name}</span>
              </div>
            </div>

            <div className="ra-config-right">
              <div className="ra-config-field">
                <span className="ra-field-label">DÉBUT</span>
                <input
                  type="time"
                  defaultValue={act.debut}
                  className={`ra-field-input ${act.conflict ? "input-conflict" : ""}`}
                />
              </div>
              <div className="ra-config-field">
                <span className="ra-field-label">DURÉE (H)</span>
                <div className="ra-counter">
                  <button className="ra-counter-btn" onClick={() => updateDuree(act.id, -1)}>−</button>
                  <span className="ra-counter-value">{act.duree}</span>
                  <button className="ra-counter-btn" onClick={() => updateDuree(act.id, 1)}>+</button>
                </div>
              </div>
              {act.conflict
                ? <BsExclamationCircleFill className="ra-status-conflict" />
                : <BsCheckCircleFill className="ra-status-ok" />
              }
            </div>
          </div>
        ))}
      </div>

      {/* ── Conseil Box ── */}
      <div className="ra-conseil">
        <MdLocationOn className="ra-conseil-icon" />
        <p>
          <strong>Conseil :</strong> Décaler "Distribution B"
          après 17h30 pour libérer l'accès aux armoires haute tension.
        </p>
      </div>

      {/* ── Action Buttons ── */}
      <div className="ra-actions">
        <button className="ra-btn-validate">
          <BsCheckCircleFill size={14} /> Valider
        </button>
        <button className="ra-btn-cancel">Annuler</button>
      </div>

    </div>
  );
}