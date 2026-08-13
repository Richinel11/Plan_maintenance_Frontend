import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlannings } from "../../../services/planningService";
import { getCurrentUser } from "../../../services/Authservice";
import { mesNotifications, marquerToutesLues } from "../../../services/exploitationService";
import PlanningTable from "../../../components/shared/PlanningTable/PlanningTable";
import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const user = getCurrentUser();
  const userEntiteId = user?.entite_metier?.id;

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        setLoading(true);
        const [data, notificationsData] = await Promise.all([
          getPlannings(1),
          mesNotifications(),
        ]);
        const results = data.results || data;
        setPlannings(Array.isArray(results) ? results : []);
        setNotifications(notificationsData.data?.notifications || []);
      } catch (error) {
        console.error("Erreur plannings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlannings();
  }, [userEntiteId]);

  const handleMarkAllRead = async () => {
    try {
      await marquerToutesLues();
      setNotifications(current => current.map(n => ({ ...n, lue: true })));
    } catch (error) {
      console.error("Erreur de mise à jour des notifications:", error);
    }
  };

  const handlePlanningClick = (planning) => {
    navigate(`/dashboard/Planning/${planning.id}`);
  };

  return (
    <div className="notifications-wrapper">

      {/* Notifications récentes */}
      <div className="notif-card">
        <div className="notif-header">
          <div className="notif-title">📢 Alertes et Notifications</div>
          <button className="mark-read-btn" onClick={handleMarkAllRead}>Tout marquer comme lu</button>
        </div>
        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-item">Aucune notification récente.</div>
          ) : notifications.map((n) => (
            <div key={n.id} className={`notif-item ${n.lue ? '' : 'unread'}`}>
              <span className="notif-icon">📋</span>
              <div className="notif-body">
                <div className="notif-name">{n.titre}</div>
                <div className="notif-desc">{n.message}</div>
              </div>
              <span className="notif-time">{new Date(n.created_at).toLocaleString('fr-FR')}</span>
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
