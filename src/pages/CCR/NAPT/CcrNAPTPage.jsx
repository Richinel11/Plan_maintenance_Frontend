import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getNAPT, diffuserNAPT } from '../../../services/exploitationService';
import NAPTView from '../../../components/shared/NAPTView/NAPTView';
import '../../Responsable/Consultation/ConsultationPage.css';
import './CcrNAPTPage.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const CcrNAPTPage = () => {
  const { naptId }  = useParams();
  const navigate    = useNavigate();
  const naptRef     = useRef();

  const [napt,       setNapt]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!naptId) return;
    getNAPT(naptId)
      .then(res => setNapt(res.data))
      .catch(() => toast.error('Impossible de charger la NAPT.'))
      .finally(() => setLoading(false));
  }, [naptId]);

  const handleDiffuser = async () => {
    setSubmitting(true);
    try {
      await diffuserNAPT(naptId);
      toast.success('NAPT diffusée avec succès.');
      navigate('/dashboard/traitement-ddr');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la diffusion.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="cp-loading">Chargement de la NAPT...</div>;
  if (!napt)   return <div className="cp-loading cp-loading--error">NAPT introuvable.</div>;

  const t        = napt.travail;
  const planning = t?.planning;
  const ddrRef   = napt.reference ? napt.reference.replace('NAPT-', 'DDR-') : '—';

  return (
    <div className="cp-layout">

      {/* ══════════ PANNEAU GAUCHE ══════════ */}
      <aside className="cp-aside">

        <button className="cp-retour" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Retour
        </button>

        <div className="cp-aside-title">ÉDITION NAPT</div>

        {/* Statut */}
        <div className="cp-block">
          <div className="cp-block-label">STATUT</div>
          <div className="cp-statut cp-statut--blue">
            <span className="cp-statut-dot" />
            Générée — en cours de rédaction
          </div>
          <div className="cp-statut-date">
            Générée par {napt.genere_par_nom || '—'}
          </div>
        </div>

        {/* Métadonnées */}
        <div className="cp-block">
          <div className="cp-block-label">MÉTADONNÉES</div>
          <div className="cp-meta-list">
            <div className="cp-meta-item">
              <span className="cp-meta-key">Référence NAPT</span>
              <span className="cp-meta-val">{napt.reference || '—'}</span>
            </div>
            <div className="cp-meta-item">
              <span className="cp-meta-key">DDR liée</span>
              <span className="cp-meta-val">{ddrRef}</span>
            </div>
            <div className="cp-meta-item">
              <span className="cp-meta-key">Segment</span>
              <span className="cp-meta-val">{t?.segment || '—'}</span>
            </div>
            <div className="cp-meta-item">
              <span className="cp-meta-key">Unité demanderesse</span>
              <span className="cp-meta-val">{t?.unite_demanderesse?.nom || '—'}</span>
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

        {/* Note d'information */}
        <div className="napt-edit-info">
          <span className="material-symbols-outlined">info</span>
          <p>Complétez les informations de la NAPT avant de la diffuser. Les champs pré-remplis proviennent de la DDR validée.</p>
        </div>

      </aside>

      {/* ══════════ PANNEAU DROIT ══════════ */}
      <main className="cp-main">

        {/* Toolbar */}
        <div className="cp-toolbar no-print">
          <button className="cp-btn-print" onClick={() => window.print()}>
            <span className="material-symbols-outlined">print</span>
            Imprimer
          </button>
          <button
            className="napt-btn-diffuser"
            onClick={handleDiffuser}
            disabled={submitting}
          >
            <span className="material-symbols-outlined">send</span>
            {submitting ? 'Diffusion...' : 'Diffuser la NAPT'}
          </button>
        </div>

        {/* Document NAPT — éditable */}
        <div className="cp-print-zone">
          <NAPTView ref={naptRef} naptId={naptId} readOnly={false} />
        </div>

      </main>

    </div>
  );
};

export default CcrNAPTPage;
