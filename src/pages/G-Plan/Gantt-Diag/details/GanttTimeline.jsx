import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./GanttTimeline.css";

const MONTHS = ["Jan","Fév","Mars","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const DAYS   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

// Largeurs de colonnes selon la vue — assez larges pour que les barres soient visibles
const COL_WIDTH = { jour: 120, semaine: 220, mois: 300 };
const REF_WIDTH = 230;
const ROW_H     = 56;
const BAR_H     = 28;

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const mondayOf = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
};

const buildColumns = (view, currentDate) => {
  const cw = COL_WIDTH[view];

  if (view === "jour") {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const cols = Array.from({ length: 24 }, (_, h) => {
      const s = new Date(dayStart); s.setHours(h);
      const e = new Date(dayStart); e.setHours(h + 1);
      return { label: `${String(h).padStart(2, "0")}h`, start: s, end: e };
    });
    return { cols, cw };
  }

  if (view === "semaine") {
    const weekStart = mondayOf(currentDate);
    const cols = Array.from({ length: 7 }, (_, i) => {
      const s = new Date(weekStart); s.setDate(weekStart.getDate() + i);
      const e = new Date(s);        e.setDate(s.getDate() + 1);
      return {
        label: `${DAYS[s.getDay()]} ${s.getDate()} ${MONTHS[s.getMonth()]}`,
        start: s, end: e,
      };
    });
    return { cols, cw };
  }

  // mois → colonnes = semaines
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  const cols = [];
  let cursor = mondayOf(new Date(year, month, 1));
  while (cursor <= lastDay) {
    const s = new Date(cursor);
    const e = new Date(cursor); e.setDate(cursor.getDate() + 7);
    cols.push({ label: `Sem. ${s.getDate()}/${s.getMonth() + 1}`, start: s, end: e });
    cursor.setDate(cursor.getDate() + 7);
  }
  return { cols, cw };
};

const BADGE_CLASS = { PRD: "prd", TRP: "trp", DST: "dst", GEN: "gen" };
const BAR_COLORS  = {
  green: "linear-gradient(90deg, #84cc16, #65a30d)",
  blue:  "linear-gradient(90deg, #3b82f6, #1d4ed8)",
  gray:  "linear-gradient(90deg, #94a3b8, #64748b)",
  red:   "linear-gradient(90deg, #f87171, #dc2626)",
};

export default function GanttTimeline({ data = [], currentDate, view }) {
  const navigate = useNavigate();

  const { cols, cw } = useMemo(() => buildColumns(view, currentDate), [view, currentDate]);

  const periodStart   = cols[0].start;
  const periodEnd     = cols[cols.length - 1].end;
  const totalMs       = periodEnd - periodStart;
  const timelineWidth = cols.length * cw;

  const today       = new Date();
  const todayInView = today >= periodStart && today <= periodEnd;
  const todayPct    = clamp((today - periodStart) / totalMs * 100, 0, 100);

  const conflictRows = data.filter(r => r.alert);

  return (
    <div className="gt-wrapper">

      {/* Légende */}
      <div className="gt-legend">
        <span className="gt-dot" style={{ background: "#84cc16" }} /> PRODUCTION
        <span className="gt-dot" style={{ background: "#3b82f6" }} /> TRANSPORT
        <span className="gt-dot" style={{ background: "#94a3b8" }} /> DISTRIBUTION
        <span className="gt-dot" style={{ background: "#ef4444" }} /> CONFLIT
      </div>

      {/* Panneau conflits */}
      {conflictRows.length > 0 && (
        <div className="gt-conflict-panel">
          <div className="gt-conflict-header">
            <span className="gt-conflict-icon">⚠️</span>
            <span className="gt-conflict-title">
              {conflictRows.length} conflit(s) détecté(s) — cliquez pour traiter
            </span>
          </div>
          <div className="gt-conflict-list">
            {conflictRows.map(r => (
              <div
                key={r.id}
                className="gt-conflict-item"
                onClick={() =>
                  navigate("/dashboard/advanced-gantt", {
                    state: { conflits: [{ ref: r.ref, name: r.ref, type: r.type }] },
                  })
                }
              >
                <span className={`gt-badge ${BADGE_CLASS[r.type] || "gen"}`}>{r.type}</span>
                <span className="gt-conflict-ref">{r.ref}</span>
                <span className="gt-conflict-arrow">→ Voir le diagnostic</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seules les lignes dont les dates chevauchent la période visible */}
      {(() => {
        const visibleData = data.filter(
          row => row.debut < periodEnd && row.fin > periodStart
        );

        if (visibleData.length === 0) return (
          <div className="gt-empty">Aucun travail à afficher pour cette période.</div>
        );

        return (
        <div className="gt-scroll">
          <div className="gt-inner" style={{ minWidth: REF_WIDTH + timelineWidth }}>

            {/* ── En-tête ──────────────────────────────────── */}
            <div className="gt-header" style={{ height: 44 }}>

              {/* Cellule titre sticky gauche */}
              <div
                className="gt-ref-head"
                style={{ width: REF_WIDTH, minWidth: REF_WIDTH }}
              >
                RÉFÉRENCE
              </div>

              {/* Colonnes de période */}
              <div
                className="gt-cols-head"
                style={{ width: timelineWidth, minWidth: timelineWidth }}
              >
                {cols.map((col, i) => (
                  <div key={i} className="gt-col-head" style={{ width: cw, minWidth: cw }}>
                    {col.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Lignes ───────────────────────────────────── */}
            {visibleData.map((row, idx) => {
              const leftPct  = clamp((row.debut - periodStart) / totalMs * 100, 0, 100);
              const rightPct = clamp((row.fin   - periodStart) / totalMs * 100, 0, 100);
              const widthPct = rightPct - leftPct;

              // Largeur réelle de la barre en pixels → décide si on affiche le label
              const barPx       = (widthPct / 100) * timelineWidth;
              const showLabel   = barPx > 60;
              const clipsLeft   = row.debut < periodStart;
              const clipsRight  = row.fin   > periodEnd;
              const isOutOfView = widthPct <= 0;

              return (
                <div
                  key={row.id}
                  className={`gt-row${row.alert ? " alert" : ""}${idx % 2 === 1 ? " stripe" : ""}`}
                  style={{ height: ROW_H }}
                >
                  {/* Référence — sticky gauche */}
                  <div
                    className="gt-ref-cell"
                    style={{ width: REF_WIDTH, minWidth: REF_WIDTH }}
                  >
                    <span className={`gt-badge ${BADGE_CLASS[row.type] || "gen"}`}>
                      {row.type}
                    </span>
                    <span className="gt-ref-label" title={row.ref}>{row.ref}</span>
                  </div>

                  {/* Zone timeline */}
                  <div
                    className="gt-timeline-area"
                    style={{ width: timelineWidth, minWidth: timelineWidth }}
                  >
                    {/* Séparateurs colonnes */}
                    {cols.map((_, i) => (
                      <div
                        key={i}
                        className="gt-col-sep"
                        style={{ left: i * cw, width: cw }}
                      />
                    ))}


                    {/* Barre */}
                    {!isOutOfView && (
                      <div
                        className={`gt-bar${clipsLeft ? " clips-left" : ""}${clipsRight ? " clips-right" : ""}`}
                        style={{
                          left:       `${leftPct}%`,
                          width:      `${Math.max(widthPct, 0.5)}%`,
                          height:     BAR_H,
                          background: BAR_COLORS[row.color] || BAR_COLORS.gray,
                        }}
                        title={
                          `${row.ref}\n` +
                          `Début : ${row.debut.toLocaleString("fr-FR")}\n` +
                          `Fin   : ${row.fin.toLocaleString("fr-FR")}\n` +
                          `Statut : ${row.statut || "—"}`
                        }
                      >
                        {clipsLeft && <span className="gt-clip-icon">◀</span>}
                        {showLabel && (
                          <span className="gt-bar-label">{row.ref}</span>
                        )}
                        {clipsRight && <span className="gt-clip-icon">▶</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
        );
      })()}
    </div>
  );
}
