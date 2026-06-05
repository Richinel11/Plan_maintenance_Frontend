import React, { useEffect, useRef, useState } from "react";
import ReactGantt from "@dhtmlx/trial-react-gantt";           // ← Fixed
import "@dhtmlx/trial-react-gantt/dist/react-gantt.css";     // ← Fixed
import mockData from "./data/ganttAdvancedData";
import "./AdvancedGantt.css";

export default function AdvancedGantt({ view }) {
  const ganttRef = useRef(null);
  const [tasks, setTasks] = useState({ data: [], links: [] });
  const [ganttKey, setGanttKey] = useState(0);
  // Transform mockData to DHTMLX format
  useEffect(() => {
    const ganttRows = mockData.map((row) => ({
      id: row.id,
      text: row.name,
      type: "project",
      open: true,
      ref: row.ref,
      alert: !!row.alert,
    }));

    const ganttTasks = mockData.flatMap((row) =>
      row.tasks.map((task) => ({
        id: task.id || `task_${Math.random().toString(36).substr(2, 9)}`,
        text: task.name,
        // text: task.name || "",
        start_date: formatDate(task.start),
        end_date: formatDate(task.end),
        parent: row.id,
        color: getTaskColor(task.color || row.type),
      }))
    );

    setTasks({
      data: [...ganttRows, ...ganttTasks],
      links: [],
    });
  }, [mockData]);

  // Update view (week / month)
useEffect(() => {
  const gantt = ganttRef.current?.getInstance?.();
  if (!gantt) return;

  if (view === "semaine") {
    gantt.config.scales = [
      // { unit: "week", step: 1, format: "Semaine #%W" },
      { unit: "day", step: 1, format: "%D %d" },
    ];

    gantt.config.date_scale = "%D %d";
    gantt.config.scale_height = 50;
    gantt.config.min_column_width = 80;
  }

  if (view === "mois") {
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F %Y" },
      { unit: "day", step: 1, format: "%d" },
    ];

    gantt.config.min_column_width = 40;
    gantt.config.scale_height = 60;
  }

  gantt.showDate(new Date());
  gantt.render();
}, [view]);

  const getTaskColor = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes("production")) return "#4caf50";
    if (t.includes("transport")) return "#2196f3";
    if (t.includes("distribution")) return "#9e9e9e";
    if (t.includes("conflit")) return "#f44336";
    return "#607d8b";
  };

  const formatDate = (d) => {
    if (!d) return "";
    if (d instanceof Date) return d.toISOString().split("T")[0];
    return String(d);
  };

  return (
    <div className="gantt-wrapper">
      <div className="legend">
        <span className="dot green"></span> PRODUCTION
        <span className="dot blue"></span> TRANSPORT
        <span className="dot gray"></span> DISTRIBUTION
        <span className="dot red"></span> CONFLIT DETECTE
      </div>

      <div className="advanced-gantt-container" style={{ height: "82vh", border: "1px solid #ddd", borderRadius: "8px" }}>
        <ReactGantt
          ref={ganttRef}
          tasks={tasks.data}
          links={tasks.links}
          config={{
            scale_height: 55,
            row_height: 62,
            resize_rows: true,
            drag_move: true,
            drag_resize: true,
            drag_progress: true,
            show_progress: true,
            readonly: false,
       
          columns:[
            { name: "text", label: "Travaux & Entités", tree: true, width: 250, resize: true },
            { name: "ref", label: "REF", align: "center", width: 150 },
            
          ]   }}
        />
      </div>
    </div>
  );
}