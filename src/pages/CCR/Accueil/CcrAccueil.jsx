import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDDRList, getNAPTList } from '../../../services/exploitationService';
import './CcrAccueil.css';

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 60) return `Il y a ${diff} min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `Il y a ${h} heure${h > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(h / 24)} jour${Math.floor(h / 24) > 1 ? 's' : ''}`;
};

const buildAlerts = (ddrs) =>
  ddrs.slice(0, 6).map(ddr => {
    if (ddr.statut === 'REFUSE') {
      return {
        id: ddr.id,
        title: 'DDR Refusée',
        desc: `La demande [${ddr.reference}] a été refusée.${ddr.motif_refus ? ' Motif : ' + ddr.motif_refus : ''}`,
        time: ddr.date_decision,
      };
    }
    return {
      id: ddr.id,
      title: 'DDR reçue',
      desc: `La DDR [${ddr.reference}] est en attente de traitement.`,
      time: ddr.date_emission,
    };
  });

const CcrAccueil = () => {
  const navigate = useNavigate();
  const [ddrs, setDdrs]       = useState([]);
  const [napts, setNapts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDDRList(), getNAPTList()])
      .then(([ddrRes, naptRes]) => {
        setDdrs(Array.isArray(ddrRes.data) ? ddrRes.data : []);
        setNapts(Array.isArray(naptRes.data) ? naptRes.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDDR     = ddrs.length;
  const enCours      = ddrs.filter(d => d.statut === 'EN_ATTENTE').length;
  const tauxValid    = ddrs.filter(d => d.statut === 'AUTORISE').length;
  const naptPrets    = napts.filter(n => n.statut === 'GENEREE').length;
  const alerts       = buildAlerts(ddrs);

  return (
    <div className="ccr-accueil">

      {/* KPI */}
      <div className="ccr-kpi-grid">
        <div className="ccr-kpi-card">
          <div className="ccr-kpi-label">TOTAL DDR</div>
          <div className="ccr-kpi-value">{loading ? '…' : totalDDR.toLocaleString()}</div>
        </div>
        <div className="ccr-kpi-card">
          <div className="ccr-kpi-label">EN COURS</div>
          <div className="ccr-kpi-value">{loading ? '…' : enCours}</div>
        </div>
        <div className="ccr-kpi-card ccr-kpi-card--blue">
          <div className="ccr-kpi-label">TAUX VALIDATION</div>
          <div className="ccr-kpi-value">{loading ? '…' : tauxValid}</div>
        </div>
        <div className="ccr-kpi-card ccr-kpi-card--green">
          <div className="ccr-kpi-label">NAPT PRÊTS</div>
          <div className="ccr-kpi-value">{loading ? '…' : String(naptPrets).padStart(2, '0')}</div>
        </div>
      </div>

      {/* Titre section */}
      <div className="ccr-section-header">
        <h1 className="ccr-section-title">Gestion des DDR</h1>
        <p className="ccr-section-sub">Suivi des demandes de raccordement et des NAPTs disponibles.</p>
      </div>

      {/* Alertes */}
      <div className="ccr-notif-card">
        <div className="ccr-notif-header">
          <span className="ccr-notif-title">
            <span className="material-symbols-outlined ccr-notif-icon">campaign</span>
            Alertes et Notifications
          </span>
          <button className="ccr-mark-read-btn">Tout marquer comme lu</button>
        </div>

        <div className="ccr-notif-list">
          {loading ? (
            <div className="ccr-notif-empty">Chargement…</div>
          ) : alerts.length === 0 ? (
            <div className="ccr-notif-empty">Aucune alerte pour le moment.</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="ccr-notif-item">
                <div className="ccr-notif-item-icon">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div className="ccr-notif-item-body">
                  <div className="ccr-notif-item-title">{alert.title}</div>
                  <div className="ccr-notif-item-desc">{alert.desc}</div>
                </div>
                <div className="ccr-notif-item-time">{timeAgo(alert.time)}</div>
              </div>
            ))
          )}
        </div>

        <div className="ccr-notif-footer">
          <button
            className="ccr-voir-historique-btn"
            onClick={() => navigate('/dashboard/ccr-historique')}
          >
            Voir tout l'historique
          </button>
        </div>
      </div>

    </div>
  );
};

export default CcrAccueil;
