import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getDDR, deciderDDR } from '../../../services/exploitationService';
import DDRView from '../../../components/shared/DDRView/DDRView';
import DDRContextAside from '../../../components/shared/DDRContextAside/DDRContextAside';
import '../../Responsable/Consultation/ConsultationPage.css';
import './CcrDDRActionPage.css';

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

  // Seule une DDR soumise par le responsable ouvre droit à une décision.
  const isEnAttente = ddr.statut === 'COMPLETEE';

  return (
    <div className="cp-layout">

      <DDRContextAside
        ddr={ddr}
        titre="TRAITEMENT DDR"
        retourLabel="Retour à la liste"
        onRetour={() => navigate(-1)}
      />

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
