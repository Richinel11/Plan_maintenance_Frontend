import { useEffect, useState } from "react";
import { getPlannings } from "../../../services/planningService";
import "./accueil.css";

const notifications = [
  { cls: "blue",   icon: "✉️", title: "Nouveau Planning Reçu",  desc: "L'entité Logistique a soumis un nouveau planning [REF-2023-089] pour validation.", time: "il y a 5 min"   },
  { cls: "red",    icon: "🚫", title: "DDR Refusée",             desc: "La demande de ressources [DDR-442] a été refusée par la direction technique.",       time: "il y a 2 heures"},
  { cls: "yellow", icon: "⚠️", title: "Échéance Proche",         desc: "Le planning [REF-2023-045] arrive à expiration dans 48 heures.",                     time: "il y a 8 heures"},
];



export default function PlanningDashboardCSS() {
  const fetchPlannings = async () => {
    try {
      setLoading(true);
  
      const data = await getPlannings(1);
  
      const results = data.results || data;
  
      setPlannings(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlannings();
  }, []);
  const totalPlannings = plannings.length;
  
  const enValidation = plannings.filter(
    p => p.statut?.toLowerCase() === "en validation"
  ).length;
  
  const valides = plannings.filter(
    p => p.statut?.toLowerCase() === "validé"
  ).length;
   console.log(plannings);
 
  return (
    <>
      {/* <style>{styles}</style> */}
      <div className="dashboard">
        <div className="container">
 
          {/* Stats */}
          <div className="stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon orange">📋</div>
              <div>
                <div className="stat-label">DDR en cours</div>
                <div className="stat-value">{loading ? "..." : enValidation}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">📅</div>
              <div>
                <div className="stat-label">En attente</div>
                <div className="stat-value">{loading ? "..." : totalPlannings}<span>Plannings</span></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div>
                <div className="stat-label">Validés (mois)</div>
                <div className="stat-value">{loading ? "..." : valides}</div>
              </div>
            </div>
          </div>
          </div>
 
          {/* Notifications */}
          <div className="card">
            <div className="notifications">
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
          </div>
 
        </div>
      </div>
    </>
  );
}