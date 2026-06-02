import React, { useEffect, useState, useRef } from "react";
import "./AdvancedGantt.css";
import mockData from "./data/ganttAdvancedData";

export default function AdvancedGantt({ currentDate, view }) {
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

  // Sync vertical scrolling
  const handleScroll = (e) => {
    if (sidebarRef.current && timelineRef.current) {
      sidebarRef.current.scrollTop = e.target.scrollTop;
      timelineRef.current.scrollTop = e.target.scrollTop;
    }
  };

  return (
    <div className="gantt-wrapper">
      <div className="legend">
        <span className="dot green"></span> PRODUCTION
        <span className="dot blue"></span> TRANSPORT
        <span className="dot gray"></span> DISTRIBUTION
        <span className="dot red"></span> CONFLIT DETECTE
      </div>

      <div className="gantt">
        {/* FIXED WIDTH SIDEBAR */}
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

        {/* SCROLLABLE TIMELINE AREA */}
        <div className="timeline-container" onScroll={handleScroll} ref={timelineRef}>
          <div className="timeline">
            {/* Days Header */}
            <div className="days" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(140px, 1fr))` }}>
              {generatedDays.map((d, i) => (
                <div key={i} className="day">{d}</div>
              ))}
            </div>

            {/* Task Rows */}
            {ganttData.map((row) => {
              // 1. Sort tasks chronologically to ensure packing works perfectly
              const sortedTasks = [...row.tasks].sort((a, b) => a.start - b.start);
              
              const lanes = []; // Keeps track of the end-day for tasks in each sub-lane
              
              // 2. Map tasks to calculate dynamic positioning and lanes
              const processedTasks = sortedTasks.map((task) => {
                // Check visibility bounds
                const isVisible = task.start <= totalColumns && task.end >= 1;
                
                // Clamp start/end boundaries inside the visible timeline matrix grid
                const clampedStart = Math.max(1, task.start);
                const clampedEnd = Math.min(totalColumns, task.end);

                let laneIndex = 0;
                if (isVisible) {
                  // Find the first lane where the previous task finished before this task starts
                  const targetLane = lanes.findIndex((laneEnd) => task.start > laneEnd);
                  
                  if (targetLane !== -1) {
                    laneIndex = targetLane;
                    lanes[targetLane] = task.end; // update end tracker for this lane
                  } else {
                    laneIndex = lanes.length;
                    lanes.push(task.end); // open a new sub-lane row
                  }
                }

                return {
                  ...task,
                  clampedStart,
                  clampedEnd,
                  laneIndex,
                  isVisible,
                };
              }).filter(t => t.isVisible); // Drop completely out-of-bounds tasks

              const totalLanes = lanes.length || 1;

              return (
                <div 
                  className="row" 
                  key={row.id} 
                  style={{ height: `${Math.max(70, totalLanes * 45)}px` }}
                >
                  {processedTasks.map((task, i) => {
                    // Left position offset calculation adjusted for 1-indexed days
                    const leftPercent = ((task.clampedStart - 1) / totalColumns) * 100;
                    // Precise width calculation bounded securely inside totalColumns
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