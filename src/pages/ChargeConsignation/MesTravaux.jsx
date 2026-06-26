import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser } from '../../services/Authservice';
import { getAllTravaux, terminerTravail } from '../../services/planningService';

const STATUT_LABELS = {
  BROUILLON: { label: 'Brouillon', color: '#6B7280' },
  SOUMIS:    { label: 'Soumis',    color: '#F59E0B' },
  VALIDE:    { label: 'Validé',    color: '#3B82F6' },
  EN_COURS:  { label: 'En cours',  color: '#8B5CF6' },
  TERMINE:   { label: 'Terminé',   color: '#10B981' },
  REPORTE:   { label: 'Reporté',   color: '#EF4444' },
};

const th = {
  padding: '12px 16px', textAlign: 'left', fontSize: 12,
  fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px',
};
const td = { padding: '14px 16px', color: '#334155' };

export default function MesTravaux() {
  const navigate = useNavigate();
  const [travaux, setTravaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    getAllTravaux().then(all => {
      const filtered = all.filter(t => t.charge_consignation?.id === currentUser?.id);
      setTravaux(filtered);
    }).finally(() => setLoading(false));
  }, []);

  const handleTerminer = (t) => {
    toast.warning(`Confirmer la fin du travail "${t.reference?.valeur || ''}" ?`, {
      duration: 6000,
      action: {
        label: 'Confirmer',
        onClick: async () => {
          try {
            await terminerTravail(t.id);
            setTravaux(prev => prev.map(x =>
              x.id === t.id ? { ...x, statut_travaux: 'TERMINE' } : x
            ));
            toast.success('Travail marqué comme terminé.');
          } catch (err) {
            toast.error('Erreur : ' + (err?.response?.data?.detail || err.message));
          }
        }
      },
      cancel: { label: 'Annuler', onClick: () => {} }
    });
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Chargement...</div>
  );

  return (
    <div style={{ padding: '32px 40px' }}>
      <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
        Mes travaux de consignation
      </h2>
      <p style={{ marginBottom: 24, color: '#64748B', fontSize: 14 }}>
        Liste des travaux pour lesquels vous êtes désigné chargé de consignation.
      </p>

      {travaux.length === 0 ? (
        <p style={{ color: '#94A3B8', fontStyle: 'italic' }}>Aucun travail assigné.</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={th}>Référence</th>
                <th style={th}>Entité métier</th>
                <th style={th}>Début planifié</th>
                <th style={th}>Statut</th>
                <th style={{ ...th, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {travaux.map(t => {
                const estTermine = t.statut_travaux === 'TERMINE';
                const statut = STATUT_LABELS[t.statut_travaux] || { label: t.statut_travaux, color: '#6B7280' };
                const naptGeneree = t.demande_retrait?.statut === 'AUTORISE';
                const ddrGeneree  = !!t.demande_retrait && !naptGeneree;

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: estTermine ? '#F1F5F9' : 'white',
                      opacity: estTermine ? 0.45 : 1,
                      pointerEvents: estTermine ? 'none' : 'auto',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!estTermine) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { if (!estTermine) e.currentTarget.style.background = 'white'; }}
                  >
                    <td style={td}>
                      <span
                        onClick={() => navigate(`/dashboard/charge-consig/travail/${t.id}`)}
                        style={{ color: '#1B75BB', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        {t.reference?.valeur || '—'}
                      </span>
                    </td>
                    <td style={td}>{t.entite_metier?.nom || t.segment || '—'}</td>
                    <td style={td}>
                      {t.heure_debut_planifie
                        ? new Date(t.heure_debut_planifie).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td style={td}>
                      <span style={{
                        background: statut.color + '20',
                        color: statut.color,
                        borderRadius: 20,
                        padding: '3px 12px',
                        fontWeight: 600,
                        fontSize: 12,
                      }}>
                        {statut.label}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      {naptGeneree ? (
                        <button
                          onClick={() => handleTerminer(t)}
                          title="Marquer ce travail comme terminé"
                          style={{
                            background: 'none', border: 'none',
                            cursor: 'pointer', color: '#10B981',
                          }}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                        </button>
                      ) : ddrGeneree ? (
                        <span
                          title="DDR générée — en attente de décision CCR"
                          style={{ color: '#94a3b8' }}
                        >
                          <span className="material-symbols-outlined">lock</span>
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
