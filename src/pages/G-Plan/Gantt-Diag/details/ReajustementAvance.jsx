import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ReajustementAvance.css";
import {
  FaExclamationTriangle,
  FaTruck,
  FaChartLine,
  FaRedo,
} from "react-icons/fa";
import {
  BsCheckCircleFill,
  BsExclamationCircleFill,
} from "react-icons/bs";
import { MdLocationOn } from "react-icons/md";
import { patchTravail } from "../../../../services/gplanService";

// ── Helpers ────────────────────────────────────────────────────────────────

const JOUR_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function getLundiDeLaSemaine(iso) {
  const d = new Date(iso);
  const dayOfWeek = d.getDay(); // 0=dim, 1=lun, …
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function calcDureeH(debut, fin) {
  if (!debut || !fin) return 4;
  const ms = new Date(fin) - new Date(debut);
  return Math.max(1, Math.round(ms / 3_600_000));
}

const SEGMENT_COLOR = {
  TRANSPORT: "blue",
  DISTRIBUTION: "green",
  PRODUCTION: "grey",
};

// ── Composant ──────────────────────────────────────────────────────────────

export default function ReajustementAvance() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupe = location.state?.groupe ?? null;

  // État éditable : un objet par travail { debut (datetime-local), duree (h) }
  const [edits, setEdits] = useState(() => {
    if (!groupe) return {};
    return Object.fromEntries(
      groupe.travaux.map((t) => [
        t.id,
        {
          debut: toDatetimeLocal(t.debut),
          duree: calcDureeH(t.debut, t.fin),
        },
      ])
    );
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // ── Calendrier : 7 colonnes de la semaine du premier travail ─────────────
  const weekDays = useMemo(() => {
    if (!groupe?.travaux?.length) return [];
    const lundi = getLundiDeLaSemaine(groupe.travaux[0].debut);
    return JOUR_LABELS.map((label, i) => {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      return { label, num: String(d.getDate()).padStart(2, "0"), date: d };
    });
  }, [groupe]);

  const getDayIndex = (isoDebut) => {
    if (!isoDebut || !weekDays.length) return -1;
    const d = new Date(isoDebut);
    return weekDays.findIndex(
      (wd) =>
        wd.date.getDate() === d.getDate() &&
        wd.date.getMonth() === d.getMonth() &&
        wd.date.getFullYear() === d.getFullYear()
    );
  };

  // ── Écran vide (accès direct sans état) ──────────────────────────────────
  if (!groupe) {
    return (
      <div className="ra-page">
        <div className="ra-empty-state">
          <FaExclamationTriangle size={32} />
          <p>Aucun groupe de conflit sélectionné.</p>
          <button
            className="ra-btn-validate"
            onClick={() => navigate("/dashboard/alertes")}
          >
            ← Retour aux alertes
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const updateDebut = (id, value) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], debut: value } }));

  const updateDuree = (id, delta) =>
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], duree: Math.max(1, prev[id].duree + delta) },
    }));

  const handleReinitialiser = () => {
    setEdits(
      Object.fromEntries(
        groupe.travaux.map((t) => [
          t.id,
          { debut: toDatetimeLocal(t.debut), duree: calcDureeH(t.debut, t.fin) },
        ])
      )
    );
    setMessage(null);
  };

  const handleValider = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await Promise.all(
        groupe.travaux.map((t) =>
          patchTravail(t.id, {
            heure_debut_planifie: edits[t.id].debut,
            duree: edits[t.id].duree,
            unite_duree: "HEURES",
          })
        )
      );
      setMessage({ type: "ok", text: "Modifications enregistrées avec succès." });
      setTimeout(() => navigate("/dashboard/alertes"), 1800);
    } catch {
      setMessage({
        type: "err",
        text: "Erreur lors de la sauvegarde. Vérifiez votre connexion.",
      });
    } finally {
      setSaving(false);
    }
  };

  const nbConflits = groupe.nb_travaux;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="ra-page">

      {/* ── Breadcrumb ── */}
      <div className="ra-breadcrumb">
        <span
          className="ra-breadcrumb-link"
          onClick={() => navigate("/dashboard/alertes")}
        >
          GESTION DES CONFLITS
        </span>
        <span className="ra-breadcrumb-sep"> › </span>
        <span className="ra-breadcrumb-active">
          RÉAJUSTEMENT MANUEL MULTI-CONFLITS
        </span>
      </div>

      {/* ── Feedback ── */}
      {message && (
        <div
          className={`ra-feedback ${
            message.type === "ok" ? "ra-feedback-ok" : "ra-feedback-err"
          }`}
        >
          {message.text}
          <button
            className="ra-feedback-close"
            onClick={() => setMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Bannière alerte ── */}
      <div className="ra-alert-banner">
        <FaExclamationTriangle className="ra-alert-icon" />
        <div className="ra-alert-content">
          <h3>Alerte de Co-activité : {groupe.ressources_communes.join(", ")}</h3>
          <p>
            {nbConflits} travaux en chevauchement sur la même ressource.
            {groupe.chevauchement && groupe.chevauchement !== "—" && (
              <>
                {" "}Plage de conflit :{" "}
                <strong>{groupe.chevauchement}</strong>.
              </>
            )}{" "}
            Un réajustement manuel est requis pour garantir la sécurité des
            techniciens.
          </p>
        </div>
      </div>

      {/* ── Grille principale : gauche (calendrier) + droite (panneau) ── */}
      <div className="ra-main-wrapper">

        {/* GAUCHE — Calendrier hebdomadaire */}
        <div className="ra-left-content">
          <div className="ra-calendar">
            <div className="ra-cal-header">
              <div className="ra-cal-asset-col">
                <span className="ra-col-label">RÉFÉRENCE</span>
                <span className="ra-col-label">SEGMENT</span>
              </div>
              {weekDays.map((d) => (
                <div key={d.num} className="ra-cal-day-col">
                  <span className="ra-day-label">{d.label}</span>
                  <span className="ra-day-num">{d.num}</span>
                </div>
              ))}
            </div>

            {groupe.travaux.map((t, idx) => {
              const dayIndex = getDayIndex(t.debut);
              const color = SEGMENT_COLOR[t.segment] ?? "grey";
              return (
                <div key={t.id} className="ra-cal-row">
                  <div className="ra-cal-asset-col">
                    <span className="ra-asset-name">{t.reference}</span>
                    <span className="ra-asset-type">{t.segment}</span>
                  </div>
                  {weekDays.map((_, di) => (
                    <div key={di} className="ra-cal-cell">
                      {di === dayIndex && (
                        <div className={`ra-task-pill ${color}`}>
                          <span>{t.reference}</span>
                          {idx > 0 && (
                            <span className="ra-pill-alert-dot" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* DROITE — Panneau d'impact */}
        <div className="ra-right-panel">
          <div className="ra-impact-header">
            <FaChartLine className="ra-impact-icon" />
            <span className="ra-impact-title">IMPACT DU CONFLIT</span>
          </div>

          <div className="ra-impact-row">
            <span className="ra-impact-label">Travaux impliqués</span>
            <span className="ra-critical-badge">CRITIQUE</span>
          </div>

          <div className="ra-conflict-number">
            {String(nbConflits).padStart(2, "0")}
          </div>
          <div className="ra-conflict-bar" />

          <div className="ra-score-box">
            <div className="ra-score-header">
              <span className="ra-score-label">RESSOURCES COMMUNES</span>
            </div>
            {groupe.ressources_communes.map((r, i) => (
              <p key={i} className="ra-score-desc">
                • {r}
              </p>
            ))}
            {groupe.chevauchement && groupe.chevauchement !== "—" && (
              <p className="ra-score-desc" style={{ marginTop: 8 }}>
                <strong>Conflit :</strong> {groupe.chevauchement}
              </p>
            )}
          </div>

          <button
            className="ra-btn-valider-semaine"
            onClick={handleValider}
            disabled={saving}
          >
            {saving ? "ENREGISTREMENT…" : "VALIDER LES MODIFICATIONS"}
          </button>
          <button className="ra-btn-reinitialiser" onClick={handleReinitialiser}>
            <FaRedo size={11} /> RÉINITIALISER
          </button>

          <div className="ra-system-status">
            <span className="ra-status-label">STATUT DU GROUPE</span>
            <div className="ra-status-row">
              <span
                className="ra-status-dot"
                style={{
                  background:
                    groupe.statut === "RESOLU" ? "#22c55e" : "#ef4444",
                }}
              />
              <span className="ra-status-text">
                {groupe.statut === "RESOLU" ? "Conflit résolu" : "Conflit actif"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Configuration individuelle ── */}
      <div className="ra-config-section">
        <h3 className="ra-config-title">
          CONFIGURATION INDIVIDUELLE DES TRAVAUX
        </h3>

        {groupe.travaux.map((t, idx) => {
          const edit = edits[t.id] || {};
          const isFirst = idx === 0;
          return (
            <div
              key={t.id}
              className={`ra-config-row ${!isFirst ? "conflict" : ""}`}
            >
              <div className="ra-config-left">
                <div
                  className={`ra-config-icon ${
                    isFirst ? "icon-normal" : "icon-conflict"
                  }`}
                >
                  {isFirst ? (
                    <FaTruck size={18} />
                  ) : (
                    <BsExclamationCircleFill size={18} />
                  )}
                </div>
                <div className="ra-config-info">
                  <span className="ra-config-category">
                    {t.segment} — {t.planning_nom}
                    {isFirst && (
                      <span className="ra-ref-badge">RÉFÉRENCE</span>
                    )}
                  </span>
                  <span className="ra-config-name">{t.reference}</span>
                </div>
              </div>

              <div className="ra-config-right">
                <div className="ra-config-field">
                  <span className="ra-field-label">DÉBUT</span>
                  <input
                    type="datetime-local"
                    value={edit.debut || ""}
                    onChange={(e) => updateDebut(t.id, e.target.value)}
                    className={`ra-field-input ${
                      !isFirst ? "input-conflict" : ""
                    }`}
                  />
                </div>
                <div className="ra-config-field">
                  <span className="ra-field-label">DURÉE (H)</span>
                  <div className="ra-counter">
                    <button
                      className="ra-counter-btn"
                      onClick={() => updateDuree(t.id, -1)}
                    >
                      −
                    </button>
                    <span className="ra-counter-value">
                      {edit.duree ?? "—"}
                    </span>
                    <button
                      className="ra-counter-btn"
                      onClick={() => updateDuree(t.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                {isFirst ? (
                  <BsCheckCircleFill className="ra-status-ok" />
                ) : (
                  <BsExclamationCircleFill className="ra-status-conflict" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Conseil ── */}
      <div className="ra-conseil">
        <MdLocationOn className="ra-conseil-icon" />
        <p>
          <strong>Conseil :</strong> Modifiez le début et/ou la durée des
          travaux en conflit pour supprimer le chevauchement. La nouvelle heure
          de fin est calculée automatiquement par le système. Le travail marqué{" "}
          <strong>RÉFÉRENCE</strong> est le plus prioritaire — déplacez de
          préférence les autres.
        </p>
      </div>

      {/* ── Boutons d'action ── */}
      <div className="ra-actions">
        <button
          className="ra-btn-validate"
          onClick={handleValider}
          disabled={saving}
        >
          <BsCheckCircleFill size={14} />{" "}
          {saving ? "Enregistrement…" : "Valider"}
        </button>
        <button
          className="ra-btn-cancel"
          onClick={() => navigate("/dashboard/alertes")}
        >
          Annuler
        </button>
      </div>

    </div>
  );
}
