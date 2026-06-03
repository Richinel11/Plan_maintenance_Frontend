import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./GanttTimeline.css";
import mockData from "./data/ganttAdvancedData";

export default function GanttTimeline({ currentDate, view }) {
  const navigate = useNavigate();
  const [ganttData, setGanttData] = useState([]);
  const sidebarRef = useRef(null);
  const timelineRef = useRef(null);

  const MONTHS = ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  useEffect(() => {
    setGanttData(mockData);
  }, []);

  let generatedDays = [];
  let totalColumns = 5;

  if (view === "semaine") {
    const start = startOfWeek(currentDate);
    for (let i = 1; i <= 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      generatedDays.push(`${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`);
    }
  } else {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    totalColumns = totalDays;
    for (let i = 1; i <= totalDays; i++) {
      generatedDays.push(`${i} ${MONTHS[month]}`);
    }
  }

  const handleScroll = (e) => {
    if (sidebarRef.current && timelineRef.current) {
      sidebarRef.current.scrollTop = e.target.scrollTop;
      timelineRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const conflictRows = ganttData.filter(row => row.alert);

  const handleConflictClick = () => {
    navigate('/dashboard/advanced-gantt', {
      state: { conflits: conflictRows.map(r => ({ ref: r.ref, name: r.name, type: r.type })) }
    });
  };

  return (
    <div className="gantt-wrapper">
      <div className="legend">
        <span className="dot green"></span> PRODUCTION
        <span className="dot blue"></span> TRANSPORT
        <span className="dot gray"></span> DISTRIBUTION
        <span className="dot red"></span> CONFLIT DETECTE
      </div>

      {conflictRows.length > 0 && (
        <div className="conflict-panel">
          <div className="conflict-panel-header">
            <span className="conflict-panel-icon">⚠️</span>
            <span className="conflict-panel-title">
              {conflictRows.length} conflit(s) détecté(s) — Cliquez sur une référence pour traiter le conflit
            </span>
          </div>
          <div className="conflict-list">
            {conflictRows.map(row => (
              <div key={row.id} className="conflict-item" onClick={handleConflictClick}>
                <span className="conflict-badge">{row.type}</span>
                <span className="conflict-ref">{row.ref}</span>
                <span className="conflict-name">{row.name}</span>
                <span className="conflict-arrow">→ Voir le diagnostic</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="gantt">
        <div className="sidebar" ref={sidebarRef}>
          <div className="sidebar-header">TRAVAUX & ENTITÉS</div>
          {ganttData.map((item) => (
            <div className={`sidebar-item ${item.alert ? "alert" : ""}`} key={item.id}>
              <div className="title">
                {item.name}
                <span className={`badge ${item.type.toLowerCase()}`}>{item.type}</span>
              </div>
              <div className="ref">REF : {item.ref}</div>
            </div>
          ))}
        </div>

        <div className="timeline-container" onScroll={handleScroll} ref={timelineRef}>
          <div className="timeline">
            <div className="days" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(140px, 1fr))` }}>
              {generatedDays.map((d, i) => (
                <div key={i} className="day">{d}</div>
              ))}
            </div>

            {ganttData.map((row) => {
              const sortedTasks = [...row.tasks].sort((a, b) => a.start - b.start);
              const lanes = [];
              const processedTasks = sortedTasks.map((task) => {
                const isVisible = task.start <= totalColumns && task.end >= 1;
                const clampedStart = Math.max(1, task.start);
                const clampedEnd = Math.min(totalColumns, task.end);
                let laneIndex = 0;
                if (isVisible) {
                  const targetLane = lanes.findIndex((laneEnd) => task.start > laneEnd);
                  if (targetLane !== -1) {
                    laneIndex = targetLane;
                    lanes[targetLane] = task.end;
                  } else {
                    laneIndex = lanes.length;
                    lanes.push(task.end);
                  }
                }
                return { ...task, clampedStart, clampedEnd, laneIndex, isVisible };
              }).filter(t => t.isVisible);

              const totalLanes = lanes.length || 1;

              return (
                <div
                  className="row"
                  key={row.id}
                  style={{ height: `${Math.max(70, totalLanes * 45)}px` }}
                >
                  {processedTasks.map((task, i) => {
                    const leftPercent = ((task.clampedStart - 1) / totalColumns) * 100;
                    const widthPercent = ((task.clampedEnd - task.clampedStart + 1) / totalColumns) * 100;
                    return (
                      <div
                        key={i}
                        className={`task ${task.color}`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          top: `${15 + task.laneIndex * 35}px`,
                          height: "26px",
                        }}
                      >
                        Reference titre
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
