import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDDRList, getNAPTList,
  mesNotifications, marquerLue, marquerToutesLues,
} from '../../../services/exploitationService';
import './CcrAccueil.css';

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 60) return `Il y a ${diff} min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `Il y a ${h} heure${h > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(h / 24)} jour${Math.floor(h / 24) > 1 ? 's' : ''}`;
};

/**
 * Alertes qui concernent le CCR. Les autres types (NAPT, planning) visent le
 * responsable ou la communication : un utilisateur cumulant plusieurs rôles ne
 * doit pas les voir remonter ici.
 *
 * `resoutAuClic` — voir le même mécanisme dans l'accueil responsable :
 *   false : l'alerte est une tâche, elle reste tant que le travail n'est pas
 *           fait. C'est `decider_ddr` qui la clot, une fois la décision prise.
 *   true  : l'alerte est une information, la lire suffit à la clore.
 */
const ALERTES = {
  DDR_SOUMISE: { icon: 'description', resoutAuClic: false },
};

// Une DDR soumise s'ouvre sur la page de traitement : c'est là que le CCR
// valide ou refuse, donc là que l'alerte trouve sa réponse.
const routeObjet = (notif) => {
  if (!notif.objet_id) return null;
  if (notif.objet_type === 'DDR') return `/dashboard/ccr/ddr/${notif.objet_id}`;
  return null;
};

const CcrAccueil = () => {
  const navigate = useNavigate();
  const [ddrs, setDdrs]                   = useState([]);
  const [napts, setNapts]                 = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    // Les DDR/NAPT alimentent les compteurs ; les alertes viennent désormais des
    // vraies notifications, pas d'une reconstruction à partir des statuts.
    Promise.all([getDDRList(), getNAPTList(), mesNotifications()])
      .then(([ddrRes, naptRes, notifRes]) => {
        const all = Array.isArray(ddrRes.data) ? ddrRes.data : [];
        setDdrs(all.filter(d => d.statut !== 'EN_ATTENTE'));
        setNapts(Array.isArray(naptRes.data) ? naptRes.data : []);
        setNotifications(notifRes.data?.notifications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const alerts = useMemo(
    () => notifications.filter(n => ALERTES[n.type_alerte] && !n.lue),
    [notifications]
  );

  const handleMarkAllRead = async () => {
    try {
      await marquerToutesLues();
      setNotifications(current => current.map(n => ({ ...n, lue: true })));
    } catch (error) {
      console.error('Erreur de mise à jour des notifications:', error);
    }
  };

  const handleAlertClick = async (notif) => {
    const route = routeObjet(notif);
    if (!route) return;

    if (ALERTES[notif.type_alerte]?.resoutAuClic) {
      setNotifications(current =>
        current.map(n => (n.id === notif.id ? { ...n, lue: true } : n))
      );
      try {
        await marquerLue(notif.id);
      } catch (error) {
        console.error('Erreur marquage notification:', error);
      }
    }

    navigate(route);
  };

  const totalDDR     = ddrs.length;
  const enCours      = ddrs.filter(d => d.statut === 'COMPLETEE').length;
  const tauxValid    = ddrs.filter(d => d.statut === 'AUTORISE').length;
  const naptPrets    = napts.filter(n => n.statut === 'GENEREE').length;

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
          <button className="ccr-mark-read-btn" onClick={handleMarkAllRead}>
            Tout marquer comme lu
          </button>
        </div>

        <div className="ccr-notif-list">
          {loading ? (
            <div className="ccr-notif-empty">Chargement…</div>
          ) : alerts.length === 0 ? (
            <div className="ccr-notif-empty">Aucune alerte pour le moment.</div>
          ) : (
            alerts.map(notif => {
              const meta      = ALERTES[notif.type_alerte];
              const clickable = routeObjet(notif) !== null;
              return (
                <div
                  key={notif.id}
                  className={`ccr-notif-item${clickable ? ' ccr-notif-item--clickable' : ''}`}
                  onClick={() => handleAlertClick(notif)}
                  title={clickable ? 'Cliquez pour traiter la DDR' : undefined}
                >
                  <div className="ccr-notif-item-icon">
                    <span className="material-symbols-outlined">{meta.icon}</span>
                  </div>
                  <div className="ccr-notif-item-body">
                    <div className="ccr-notif-item-title">{notif.titre}</div>
                    <div className="ccr-notif-item-desc">{notif.message}</div>
                  </div>
                  <div className="ccr-notif-item-time">{timeAgo(notif.created_at)}</div>
                </div>
              );
            })
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
