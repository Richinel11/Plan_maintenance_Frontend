import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlannings } from "../../../services/planningService";
import { getCurrentUser } from "../../../services/Authservice";
import PlanningTable from "../../../components/shared/PlanningTable/PlanningTable";
import "./Notifications.css";

const notifications = [];

export default function Notifications() {
  const navigate = useNavigate();
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();
  const userEntiteId = user?.entite_metier?.id;

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        setLoading(true);
        const data = await getPlannings(1);
        const results = data.results || data;
        const all = Array.isArray(results) ? results : [];

        // Filtrer par entité métier de l'utilisateur connecté
        const filtered = userEntiteId
          ? all.filter(p => p.entite_metier?.id === userEntiteId)
          : all;

        setPlannings(filtered);
      } catch (error) {
        console.error("Erreur plannings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlannings();
  }, [userEntiteId]);

  const handlePlanningClick = (planning) => {
    navigate(`/dashboard/Planning/${planning.id}`);
  };

  return (
    <div className="notifications-wrapper">

      {/* Notifications récentes */}
      <div className="notif-card">
        <div className="notif-header">
          <div className="notif-title">📢 Alertes et Notifications</div>
          <button className="mark-read-btn">Tout marquer comme lu</button>
        </div>
        <div className="notif-list">
          {notifications.map((n, i) => (
            <div key={i} className={`notif-item ${n.cls}`}>
              <span className="notif-icon">{n.icon}</span>
              <div className="notif-body">
                <div className="notif-name">{n.title}</div>
                <div className="notif-desc">{n.desc}</div>
              </div>
              <span className="notif-time">{n.time}</span>
            </div>
          ))}
        </div>
        <div className="see-all">
          <button>Voir tout l'historique</button>
        </div>
      </div>

      {/* Plannings de l'entité */}
      <PlanningTable
        plannings={plannings}
        loading={loading}
        onRowClick={handlePlanningClick}
      />

    </div>
  );
}
