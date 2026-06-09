import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getDDR, getNAPT } from '../../../services/exploitationService';
import DDRView from '../../../components/shared/DDRView/DDRView';
import NAPTView from '../../../components/shared/NAPTView/NAPTView';
import './ConsultationPage.css';

/* ── helpers ─────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const statusMeta = {
  EN_ATTENTE: { label: 'En attente',  color: 'orange' },
  AUTORISE:   { label: 'Autorisé',    color: 'green'  },
  REFUSE:     { label: 'Refusé',      color: 'red'    },
  REPORTE:    { label: 'Reporté',     color: 'orange' },
  GENEREE:    { label: 'Générée',     color: 'green'  },
  DIFFUSEE:   { label: 'Diffusée',    color: 'blue'   },
};

/* ── composant ───────────────────────────────────────────── */
const ConsultationPage = ({ type = 'DDR' }) => {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const zone = document.querySelector('.cp-print-zone');
    if (!zone) return;
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const filename = `${type}-${data?.reference || id}.pdf`;
      await html2pdf()
        .set({
          margin: 10,
          filename,
          image:      { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(zone)
        .save();
    } catch {
      toast.error('Échec de la génération du PDF.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetch = type === 'DDR' ? getDDR(id) : getNAPT(id);
    fetch
      .then(res => setData(res.data))
      .catch(() => toast.error(`Impossible de charger la ${type}.`))
      .finally(() => setLoading(false));
  }, [id, type]);

  if (loading) return <div className="cp-loading">Chargement...</div>;
  if (!data)   return <div className="cp-loading cp-loading--error">Document introuvable.</div>;

  const travail  = data.travail;
  const planning = travail?.planning;
  const statut   = statusMeta[data.statut] || { label: data.statut, color: 'grey' };

  return (
    <div className="cp-layout">

      {/* ══════════════ PANNEAU GAUCHE ══════════════ */}
      <aside className="cp-aside">

        {/* Retour */}
        <button className="cp-retour" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Retour à l'historique
        </button>

        {/* Titre */}
        <div className="cp-aside-title">CONSULTATION {type}</div>

        {/* Statut */}
        <div className="cp-block">
          <div className="cp-block-label">STATUT DU DOCUMENT</div>
          <div className={`cp-statut cp-statut--${statut.color}`}>
            <span className="cp-statut-dot" />
            {statut.label}
          </div>
          <div className="cp-statut-date">
            {type === 'DDR'
              ? `Émis le ${fmtDate(data.date_emission)}`
              : `Généré le ${fmtDate(data.date_diffusion || data.travail?.heure_debut_planifie)}`
            }
          </div>
          {data.decide_par_nom && (
            <div className="cp-statut-date">Décidé par {data.decide_par_nom}</div>
          )}
        </div>

        {/* Métadonnées */}
        <div className="cp-block">
          <div className="cp-block-label">MÉTADONNÉES</div>
          <div className="cp-meta-list">
            <div className="cp-meta-item">
              <span className="cp-meta-key">Référence</span>
              <span className="cp-meta-val">{data.reference || '—'}</span>
            </div>
            <div className="cp-meta-item">
              <span className="cp-meta-key">Type</span>
              <span className="cp-meta-val">{travail?.segment || '—'}</span>
            </div>
            <div className="cp-meta-item">
              <span className="cp-meta-key">Émis par</span>
              <span className="cp-meta-val">{data.emis_par_nom || '—'}</span>
            </div>
          </div>
        </div>

        {/* Documents liés */}
        <div className="cp-block">
          <div className="cp-block-label">DOCUMENTS LIÉS</div>

          {planning ? (
            <div className="cp-doc-item">
              <div className="cp-doc-icon">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div className="cp-doc-info">
                <div className="cp-doc-name">{planning.nom || 'Planning'}</div>
                <div className="cp-doc-sub">
                  Code : {planning.code || '—'}
                </div>
                <div className="cp-doc-sub">
                  Créé le {fmtDate(planning.date_creation)}
                </div>
                {planning.entite_metier?.nom && (
                  <div className="cp-doc-sub">{planning.entite_metier.nom}</div>
                )}
              </div>
            </div>
          ) : (
            <p className="cp-doc-empty">Aucun planning associé</p>
          )}

          {/* Placeholder — futurs documents uploadés */}
          <p className="cp-doc-hint">
            Les documents justificatifs uploadés apparaîtront ici.
          </p>
        </div>

      </aside>

      {/* ══════════════ PANNEAU DROIT ══════════════ */}
      <main className="cp-main">

        {/* Toolbar */}
        <div className="cp-toolbar no-print">
          <button className="cp-btn-print" onClick={() => window.print()}>
            <span className="material-symbols-outlined">print</span>
            Imprimer
          </button>
          <button className="cp-btn-export" onClick={handleDownloadPDF} disabled={downloading}>
            <span className="material-symbols-outlined">picture_as_pdf</span>
            {downloading ? 'Génération...' : 'Télécharger au format PDF'}
          </button>
        </div>

        {/* Document — enveloppé dans .cp-print-zone pour cibler l'impression */}
        <div className="cp-print-zone">
          {type === 'DDR'
            ? <DDRView ddrId={id} readOnly={true} />
            : <NAPTView naptId={id} readOnly={true} />
          }
        </div>

      </main>

    </div>
  );
};

export default ConsultationPage;
