import TopControl from "./topcontrol/Topcontrol";
import Detail from "./details/AdvancedGantt";
import React, { useEffect, useState } from "react";

import mockData from "./details/data/ganttAdvancedData";


// const InterfaceGantt = () => {
//   return (
//     <>
//       <TopControl />
//       <Detail />
//     </>
//   );
// };

// export default InterfaceGantt;

export default function PlanningDashboard() {

    // =========================
  // FILTER STATES
  // =========================
  const [view, setView] = useState("semaine");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentWeek, setCurrentWeek] = useState(42);


  // =========================
  // DATA FROM BACKEND
  // =========================
  const [entities, setEntities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [ganttData, setGanttData] = useState([]);

  // =========================
  // FETCH DROPDOWN VALUES
  // =========================
  useEffect(() => {

    // MOCK FOR NOW
    setEntities([
      "Production",
      "Transport",
      "Distribution"
    ]);

    setStatuses([
      "En cours",
      "Terminé",
      "En attente"
    ]);

  }, []);

  // =========================
  // ANALYZE BUTTON ACTION
  // =========================
  const handleAnalyze = () => {

    console.log({
      selectedEntity,
      selectedStatus,
      view,
      currentWeek
    });

    // BACKEND LATER:
    // fetch(`/api/gantt?...`)
    // .then(res => res.json())
    // .then(setGanttData);

  };

  return (
    <div>

      <TopControl
        view={view}
        setView={setView}

        selectedEntity={selectedEntity}
        setSelectedEntity={setSelectedEntity}

        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}

        entities={entities}
        statuses={statuses}

        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}

        onAnalyze={handleAnalyze}
      />

      <Detail
        data={ganttData}
        view={view}
        currentWeek={currentWeek}
      />

    </div>
  );
}