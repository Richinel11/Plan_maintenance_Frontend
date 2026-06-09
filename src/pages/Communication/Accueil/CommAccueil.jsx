import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNAPTList } from '../../../services/exploitationService';
import './CommAccueil.css';

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 60) return `Il y a ${diff} min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `Il y a ${h} heure${h > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(h / 24)} jour${Math.floor(h / 24) > 1 ? 's' : ''}`;
};

const CommAccueil = () => {
  const navigate = useNavigate();
  const [napts,   setNapts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNAPTList()
      .then(res => setNapts(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const diffusees = napts.filter(n => n.statut === 'DIFFUSEE');
  const total     = napts.length;
  const recentes  = diffusees.slice(0, 6);

  return (
    <div className="comm-accueil">

      {/* KPI */}
      <div className="comm-kpi-grid">
        <div className="comm-kpi-card">
          <div className="comm-kpi-label">TOTAL NAPT</div>
          <div className="comm-kpi-value">{loading ? '…' : total}</div>
        </div>
        <div className="comm-kpi-card comm-kpi-card--green">
          <div className="comm-kpi-label">DIFFUSÉES</div>
          <div className="comm-kpi-value">{loading ? '…' : diffusees.length}</div>
        </div>
        <div className="comm-kpi-card comm-kpi-card--orange">
          <div className="comm-kpi-label">EN ATTENTE</div>
          <div className="comm-kpi-value">{loading ? '…' : napts.filter(n => n.statut === 'GENEREE').length}</div>
        </div>
        <div className="comm-kpi-card comm-kpi-card--blue">
          <div className="comm-kpi-label">TAUX DIFFUSION</div>
          <div className="comm-kpi-value">
            {loading ? '…' : total > 0 ? `${((diffusees.length / total) * 100).toFixed(0)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Titre section */}
      <div className="comm-section-header">
        <h1 className="comm-section-title">Alertes NAPT reçues</h1>
        <p className="comm-section-sub">Liste des Notes d'Arrêt de Travaux diffusées et reçues.</p>
      </div>

      {/* Alertes */}
      <div className="comm-notif-card">
        <div className="comm-notif-header">
          <span className="comm-notif-title">
            <span className="material-symbols-outlined comm-notif-icon">notifications_active</span>
            Notifications NAPT
          </span>
        </div>

        <div className="comm-notif-list">
          {loading ? (
            <div className="comm-notif-empty">Chargement…</div>
          ) : recentes.length === 0 ? (
            <div className="comm-notif-empty">Aucune NAPT diffusée pour le moment.</div>
          ) : (
            recentes.map(n => (
              <div key={n.id} className="comm-notif-item">
                <div className="comm-notif-item-icon">
                  <span className="material-symbols-outlined">task_alt</span>
                </div>
                <div className="comm-notif-item-body">
                  <div className="comm-notif-item-title">NAPT diffusée</div>
                  <div className="comm-notif-item-desc">
                    La NAPT [{n.reference}] a été diffusée et est disponible pour communication.
                  </div>
                </div>
                <div className="comm-notif-item-time">{timeAgo(n.date_diffusion)}</div>
              </div>
            ))
          )}
        </div>

        <div className="comm-notif-footer">
          <button className="comm-voir-btn" onClick={() => navigate('/dashboard/comm-napt')}>
            Voir toutes les NAPT
          </button>
        </div>
      </div>

    </div>
  );
};

export default CommAccueil;
