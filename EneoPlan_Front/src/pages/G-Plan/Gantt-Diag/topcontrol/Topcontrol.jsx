import React, { useState } from "react";
import "./Topcontrol.css";
import { GrFormPrevious, GrFormNext } from "react-icons/gr"; 


export default function TopControls() {
  const [view, setView] = useState("semaine");

  return (
    <div className="controls-container">

      {/* LEFT SIDE */}
      <div className="controls-left">

        <button className="btn-primary">
          lancer l'analyse
        </button>

        <select className="select">
          <option>Toutes les Entités</option>
        </select>

        <select className="select warning">
          <option>Tous les statuts</option>
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
         <GrFormPrevious />
          <span>Sem. 42 (Oct)</span>
           <GrFormNext />
        </div>

      </div>

    </div>
  );
}