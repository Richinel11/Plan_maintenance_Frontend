import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAlertes } from "../../../../services/gplanService";
import "./Alert.css";

function groupeToAlert(groupe) {
  const ressource = groupe.ressources_communes?.[0] || "ressource partagée";
  const desc = groupe.chevauchement && groupe.chevauchement !== '—'
    ? `${groupe.nb_travaux} travaux · ${groupe.chevauchement}`
    : `${groupe.nb_travaux} travaux en conflit`;
  return {
    id:    groupe.id_groupe,
    title: `Conflit – ${ressource}`,
    desc,
  };
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlertes()
      .then((groupes) => {
        setAlerts(groupes.filter((g) => g.statut === "OUVERT").map(groupeToAlert));
      })
      .catch((err) => {
        console.error("[AlertsPanel] Erreur chargement alertes :", err?.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);

  return (
    <div className="alerts-container">

      {/* HEADER */}
      <div className="alerts-header">
        <h3>Alertes Actives {!loading && alerts.length > 0 && `(${alerts.length})`}</h3>
        {alerts.length > 3 && (
          <span className="see-all" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Voir moins" : "Voir tout"}
          </span>
        )}
      </div>

      {/* LIST */}
      <div className="alerts-list">
        {loading && (
          <div className="alert-empty">Chargement des alertes…</div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="alert-empty">Aucune alerte active.</div>
        )}

        {!loading && displayedAlerts.map((alert) => (
          <div
            className="alert-item"
            key={alert.id}
            onClick={() => navigate("/dashboard/alertes")}
          >
            <div className="alert-icon alert-icon--conflit">❗</div>

            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-desc">{alert.desc}</div>
            </div>

            <div className="arrow">›</div>
          </div>
        ))}
      </div>

    </div>
  );
}