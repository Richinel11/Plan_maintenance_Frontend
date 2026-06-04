import React from "react";
import "./Topcontrol.css";
import { GrFormPrevious, GrFormNext } from "react-icons/gr"; 


export default function TopControls({
  view,
  setView,

  selectedEntity,
  setSelectedEntity,

  selectedStatus,
  setSelectedStatus,

  entities,
  statuses,

  currentDate,
  setCurrentDate,

  onAnalyze
}) {
 
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const startOfWeek = (date) => {

  const d = new Date(date);

  const day = d.getDay();

  const diff =
    d.getDate() -
    day +
    (day === 0 ? -6 : 1);

  return new Date(d.setDate(diff));
};

const getPeriodLabel = () => {

  if (view === "mois") {
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }

  if (view === "jour") {
    return `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }

  const start = startOfWeek(currentDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()} ${MONTHS[start.getMonth()]} - ${end.getDate()} ${MONTHS[end.getMonth()]}`;
};

const previousPeriod = () => {
  const d = new Date(currentDate);
  if      (view === "jour")    d.setDate(d.getDate() - 1);
  else if (view === "semaine") d.setDate(d.getDate() - 7);
  else                         d.setMonth(d.getMonth() - 1);
  setCurrentDate(d);
};

const nextPeriod = () => {
  const d = new Date(currentDate);
  if      (view === "jour")    d.setDate(d.getDate() + 1);
  else if (view === "semaine") d.setDate(d.getDate() + 7);
  else                         d.setMonth(d.getMonth() + 1);
  setCurrentDate(d);
};

  return (
    <div className="controls-container">

      {/* LEFT SIDE */}
      <div className="controls-left">

     <button
        className="btn-primary"
        onClick={onAnalyze}
      >
        lancer l'analyse
      </button>

      <select
        className="select"
        value={selectedEntity}
        onChange={(e) => setSelectedEntity(e.target.value)}
      >
        <option value="">Toutes les Entités</option>

        {entities.map((entity) => (
          <option key={entity} value={entity}>
            {entity}
          </option>
        ))}
      </select>

      <select
        className="select warning"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="">Tous les statuts</option>

        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      </div>

      {/* RIGHT SIDE */}
      <div className="controls-right">

        <div className="toggle">
          <button
            className={view === "jour" ? "active" : ""}
            onClick={() => setView("jour")}
          >
            Jour
          </button>
          <button
            className={view === "semaine" ? "active" : ""}
            onClick={() => setView("semaine")}
          >
            Semaine
          </button>
          <button
            className={view === "mois" ? "active" : ""}
            onClick={() => setView("mois")}
          >
            Mois
          </button>
        </div>

        <div className="week-nav">

          <GrFormPrevious
            onClick={previousPeriod}
            className="nav-icon"
          />

          <span className="week-label">
            {getPeriodLabel()}
          </span>

          <GrFormNext
            onClick={nextPeriod}
            className="nav-icon"
          />

        </div>

      </div>

    </div>
  );
}