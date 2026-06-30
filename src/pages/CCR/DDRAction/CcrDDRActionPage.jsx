import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getDDR, deciderDDR } from '../../../services/exploitationService';
import DDRView from '../../../components/shared/DDRView/DDRView';
import '../../Responsable/Consultation/ConsultationPage.css';
import './CcrDDRActionPage.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const statusMeta = {
  EN_ATTENTE: { label: 'En attente',  color: 'orange' },
  COMPLETEE:  { label: 'En attente',  color: 'green'  },
  AUTORISE:   { label: 'Autorisé',    color: 'green'  },
  REFUSE:     { label: 'Refusé',      color: 'red'    },
  REPORTE:    { label: 'Reporté',     color: 'orange' },
};

const CcrDDRActionPage = () => {
  const { ddrId }  = useParams();
  const navigate   = useNavigate();

  const [ddr,        setDdr]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef               = useRef(false);

  useEffect(() => {
    if (!ddrId) return;
    getDDR(ddrId)
      .then(res => setDdr(res.data))
      .catch(() => toast.error('Impossible de charger la DDR.'))
      .finally(() => setLoading(false));
  }, [ddrId]);

  /* ── Valider ── */
  const handleValider = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const res = await deciderDDR(ddrId, { decision: 'AUTORISE' });
      toast.success('DDR validée — NAPT générée. Complétez et diffusez la NAPT.');
      const naptId = res.data?.napt?.id;
      if (naptId) {
        navigate(`/dashboard/ccr/napt/${naptId}`);
      } else {
        navigate('/dashboard/traitement-ddr');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la validation.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) return <div className="cp-loading">Chargement...</div>;
  if (!ddr)    return <div className="cp-loading cp-loading--error">DDR introuvable.</div>;

  const travail  = ddr.travail;
  const planning = travail?.planning;
  const statut   = statusMeta[ddr.statut] || { label: ddr.statut, color: 'grey' };
  const isEnAttente = ddr.statut === 'COMPLETEE';

  return (
    <div className="cp-layout">

      {/* ══════════ PANNEAU GAUCHE ══════════ */}
      <aside className="cp-aside">

        <button className="cp-retour" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Retour à la liste
        </button>

        <div className="cp-aside-title">TRAITEMENT DDR</div>

        {/* Statut */}
        <div className="cp-block">
          <div className="cp-block-label">STATUT DU DOCUMENT</div>
          <div className={`cp-statut cp-statut--${statut.color}`}>
            <span className="cp-statut-dot" />
            {statut.label}
          </div>
          <div className="cp-statut-date">Émis le {fmtDate(ddr.date_emission)}</div>
          {ddr.decide_par_nom && (
            <div className="cp-statut-date">Décidé par {ddr.decide_par_nom}</div>
          )}
        </div>

        {/* Métadonnées */}
        <div className="cp-block">
          <div className="cp-block-label">MÉTADONNÉES</div>
          <div className="cp-meta-list">
            <div className="cp-meta-item">
              <span className="cp-meta-key">Référence</span>
              <span className="cp-meta-val">{ddr.reference || '—'}</span>
            </div>
            <div className="cp-meta-item">
              <span className="cp-meta-key">Segment</span>
              <span className="cp-meta-val">{travail?.segment || '—'}</span>
            </div>
            <div className="cp-meta-item">
              <span className="cp-meta-key">Émis par</span>
              <span className="cp-meta-val">{ddr.emis_par_nom || '—'}</span>
            </div>
          </div>
        </div>

        {/* Planning lié */}
        <div className="cp-block">
          <div className="cp-block-label">PLANNING LIÉ</div>
          {planning ? (
            <div className="cp-doc-item">
              <div className="cp-doc-icon">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div className="cp-doc-info">
                <div className="cp-doc-name">{planning.nom || 'Planning'}</div>
                <div className="cp-doc-sub">Code : {planning.code || '—'}</div>
                <div className="cp-doc-sub">Créé le {fmtDate(planning.date_creation)}</div>
              </div>
            </div>
          ) : (
            <p className="cp-doc-empty">Aucun planning associé</p>
          )}
        </div>

      </aside>

      {/* ══════════ PANNEAU DROIT ══════════ */}
      <main className="cp-main">

        {/* Toolbar */}
        <div className="cp-toolbar no-print">
          <div className="ccr-toolbar-left">
            <button className="cp-btn-print" onClick={() => window.print()}>
              <span className="material-symbols-outlined">print</span>
              Imprimer
            </button>
          </div>

          {/* Boutons d'action CCR — uniquement si EN_ATTENTE */}
          {isEnAttente && (
            <div className="ccr-action-btns">
              <button
                className="ccr-btn-rejeter"
                onClick={() => navigate(`/dashboard/ccr/ddr/${ddrId}/refuser`)}
                disabled={submitting}
              >
                <span className="material-symbols-outlined">cancel</span>
                Rejeter
              </button>
              <button
                className="ccr-btn-valider"
                onClick={handleValider}
                disabled={submitting}
              >
                <span className="material-symbols-outlined">check_circle</span>
                {submitting ? 'Validation...' : 'Valider'}
              </button>
            </div>
          )}
        </div>

        {/* Document DDR */}
        <div className="cp-print-zone">
          <DDRView ddrId={ddrId} readOnly={true} />
        </div>

      </main>

    </div>
  );
};

export default CcrDDRActionPage;
