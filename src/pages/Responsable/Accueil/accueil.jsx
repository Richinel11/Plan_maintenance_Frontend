import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlannings } from "../../../services/planningService";
import { mesNotifications, marquerToutesLues } from "../../../services/exploitationService";
import "./accueil.css";

/**
 * Alertes affichées sur l'accueil du responsable d'exploitation :
 * plannings reçus, DDR refusées par le CCR, NAPT reçues.
 * Les autres types de notification ne concernent pas cette page.
 */
const ALERTES = {
  PLANNING_TRANSMIS: { icon: "📅", cls: "blue" },
  DDR_REFUSEE: { icon: "❌", cls: "red" },
  NAPT_DISPONIBLE: { icon: "📄", cls: "green" },
};

// Destination selon l'objet métier porté par la notification.
// Une DDR refusée s'ouvre en édition : le responsable doit pouvoir la corriger
// et la resoumettre au CCR.
const routeObjet = (notif) => {
  const { objet_type: objetType, objet_id: objetId, type_alerte: typeAlerte } = notif;
  if (!objetId) return null;
  switch (objetType) {
    case "PLANNING": return `/dashboard/Planning/${objetId}`;
    case "DDR":
      return typeAlerte === "DDR_REFUSEE"
        ? `/dashboard/ddr/${objetId}`
        : `/dashboard/consultation/ddr/${objetId}`;
    case "NAPT": return `/dashboard/consultation/napt/${objetId}`;
    default: return null;
  }
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const min = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} heure${h > 1 ? "s" : ""}`;
  const j = Math.floor(h / 24);
  return `Il y a ${j} jour${j > 1 ? "s" : ""}`;
};

export default function Accueil() {
  const navigate = useNavigate();

  const [plannings, setPlannings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Erreur chargement accueil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ── Stats : l'état d'un planning vient de current_step, pas d'un champ "statut" ── */
  const totalPlannings = plannings.length;
  const enAttente = plannings.filter(
    p => p.current_step?.code === "EN_ATTENTE"
  ).length;
  const valides = plannings.filter(
    p => p.current_step?.code === "VALIDE" || p.current_step?.code === "TERMINE"
  ).length;

  /* ── Alertes : uniquement les 3 types qui concernent le responsable ── */
  const alertes = useMemo(
    () => notifications.filter(n => ALERTES[n.type_alerte]),
    [notifications]
  );

  const handleMarkAllRead = async () => {
    try {
      await marquerToutesLues();
      setNotifications(current => current.map(n => ({ ...n, lue: true })));
    } catch (error) {
      console.error("Erreur de mise à jour des notifications:", error);
    }
  };

  const handleAlertClick = (notif) => {
    const route = routeObjet(notif);
    if (route) navigate(route);
  };

  return (
    <div className="dashboard">
      <div className="container">

        {/* Stats */}
        <div className="stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">📅</div>
              <div>
                <div className="stat-label">Plannings reçus</div>
                <div className="stat-value">{loading ? "..." : totalPlannings}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">📋</div>
              <div>
                <div className="stat-label">En attente de traitement</div>
                <div className="stat-value">{loading ? "..." : enAttente}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div>
                <div className="stat-label">Validés</div>
                <div className="stat-value">{loading ? "..." : valides}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes et notifications */}
        <div className="card">
          <div className="notifications">
            <div className="notif-header">
              <div className="notif-title">📢 Alertes et Notifications</div>
              <button className="mark-read-btn" onClick={handleMarkAllRead}>
                Tout marquer comme lu
              </button>
            </div>

            <div className="notif-list">
              {loading ? (
                <div className="notif-empty">Chargement…</div>
              ) : alertes.length === 0 ? (
                <div className="notif-empty">Aucune alerte pour le moment.</div>
              ) : (
                alertes.map(n => {
                  const meta = ALERTES[n.type_alerte];
                  const clickable = routeObjet(n) !== null;
                  return (
                    <div
                      key={n.id}
                      className={`notif-item ${meta.cls}${n.lue ? "" : " unread"}${clickable ? " clickable" : ""}`}
                      onClick={() => handleAlertClick(n)}
                      title={clickable ? "Cliquez pour ouvrir le document" : undefined}
                    >
                      <span className="notif-icon">{meta.icon}</span>
                      <div className="notif-body">
                        <div className="notif-name">{n.titre}</div>
                        <div className="notif-desc">{n.message}</div>
                      </div>
                      <span className="notif-time">{timeAgo(n.created_at)}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="see-all">
              <button onClick={() => navigate("/dashboard/historique")}>
                Voir tout l'historique
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
