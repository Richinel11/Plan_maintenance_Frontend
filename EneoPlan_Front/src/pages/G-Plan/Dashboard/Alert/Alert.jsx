import React, { useEffect, useState } from "react";
import "./Alert.css";

// 🔧 Mock data (replace with API later)
const mockAlerts = [
  {
    id: 1,
    title: "Chevauchement de ressources - été 42",
    description: "Équipe A et Équipe B assignées au même bloc horaire.",
  },
  {
    id: 2,
    title: "Chevauchement - ouvrage...",
    description: "Maintenance non planifiée requise immédiatement.",
  },
  {
    id: 3,
    title: "Chevauchement de ressources - été 42",
    description: "Équipe A et Équipe B assignées au même bloc horaire.",
  },
];

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  // 🔌 Ready for backend
  useEffect(() => {
    setAlerts(mockAlerts);

    // 👉 Later replace with:
    // fetch("/api/alerts")
    //   .then(res => res.json())
    //   .then(data => setAlerts(data));
  }, []);

  return (
    <div className="alerts-container">

      {/* HEADER */}
      <div className="alerts-header">
        <h3>Alertes Actives</h3>
        <span className="see-all">Voir tout</span>
      </div>

      {/* LIST */}
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div className="alert-item" key={alert.id}>
            
            <div className="alert-icon">❗</div>

            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-desc">{alert.description}</div>
            </div>

            <div className="arrow">›</div>

          </div>
        ))}
      </div>

    </div>
  );
}