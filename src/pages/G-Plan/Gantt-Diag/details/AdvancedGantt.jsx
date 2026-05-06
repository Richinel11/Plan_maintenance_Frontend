import React, { useEffect, useState } from "react";
import "./AdvancedGantt.css";
import mockData from "./data/ganttAdvancedData";

const days = [
  "Lundi 16 Oct.",
  "Mardi 17 Oct.",
  "Mercredi 18 Oct.",
  "Jeudi 19 Oct."
];

export default function AdvancedGantt() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(mockData);

    // 🔌 backend later:
    // fetch("/api/gantt")
        // .then(res => res.json())
        // .then(setData);
  }, []);

  return (
    <div className="gantt-wrapper">

      {/* TOP LEGEND */}
      <div className="legend">
        <span className="dot green"></span> PRODUCTION
        <span className="dot blue"></span> TRANSPORT
        <span className="dot gray"></span> DISTRIBUTION
        <span className="dot red"></span> CONFLIT DETECTE
      </div>

      <div className="gantt">

        {/* LEFT SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-header">TRAVAUX & ENTITÉS</div>

          {data.map((item) => (
            <div className={`sidebar-item ${item.alert ? "alert" : ""}`} key={item.id}>
              <div className="title">
                {item.name}
                <span className={`badge ${item.type.toLowerCase()}`}>
                  {item.type}
                </span>
              </div>
              <div className="ref">REF : {item.ref}</div>
            </div>
          ))}
        </div>

        {/* TIMELINE */}
        <div className="timeline">

          {/* DAYS */}
          <div className="days">
            {days.map((d, i) => (
              <div key={i} className="day">{d}</div>
            ))}
          </div>

          {/* ROWS */}
          {data.map((row) => (
            <div className="row" key={row.id}>
              {row.tasks.map((task, i) => (
                <div
                  key={i}
                  className={`task ${task.color}`}
                  style={{
                    left: `${(task.start / 4) * 100}%`,
                    width: `${((task.end - task.start) / 4) * 100}%`,
                  }}
                >
                  Reference titre
                </div>
              ))}
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}