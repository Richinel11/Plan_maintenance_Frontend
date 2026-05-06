import React, { useEffect,   useState  } from 'react';
// import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import "./gantt.css";
import mockData from "../data/ganttData"; 
import { GrFormPrevious, GrFormNext } from "react-icons/gr"; 


const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

export default function GanttChart() {
  const [data, setData] = useState([]);

  // 🔌 Ready for backend later
  useEffect(() => {
    // replace this with API later
    setData(mockData);
  }, []);
    //   Remplace par ce code en bas au moment de la connexion avec le backend 
//   useEffect(() => {
//   fetch("/api/gantt")
//     .then(res => res.json())
//     .then(data => setData(data));
// }, []);

  return (
    <div className="gantt-container">

      {/* HEADER */}
      <div className="gantt-header">
        <h3>Aperçu Gantt Hebdomadaire</h3>
        <div className="week"><GrFormPrevious /> Semaine 42 (Oct 16 - 22) <GrFormNext /></div>
      </div>

      {/* DAYS */}
      <div className="gantt-days">
        <div className="resource-label">RESSOURCE</div>
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* ROWS */}
      {data.map((row, i) => (
        <div className="gantt-row" key={i}>
          <div className="resource">{row.name}</div>

          <div className="timeline">
            {row.tasks.map((task, j) => (
              <div
                key={j}
                className={`task ${task.color}`}
                style={{
                  left: `${(task.start / 7) * 100}%`,
                  width: `${((task.end - task.start) / 7) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}