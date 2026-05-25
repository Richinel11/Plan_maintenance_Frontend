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

  currentWeek,
  setCurrentWeek,

  onAnalyze
}) {
 

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
            className={view === "semaine" ? "active" : ""}
            onClick={() => setView("semaine")} > 
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
          {/* <button>{"‹"}</button>
          <span>Sem. 42 (Oct)</span>
          <button>{"›"}</button> */}
         <GrFormPrevious
            onClick={() => setCurrentWeek(w => w - 1)}
            style={{ cursor: "pointer" }}
          />

          <span>Sem. {currentWeek}</span>

           <GrFormNext
              onClick={() => setCurrentWeek(w => w + 1)}
              style={{ cursor: "pointer" }}
            />
        </div>

      </div>

    </div>
  );
}