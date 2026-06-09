import React, { useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DDRView from '../../../components/shared/DDRView/DDRView';
import './DDRDetailPage.css';

const DDRDetailPage = () => {
  const navigate        = useNavigate();
  const { ddrId }       = useParams();
  const location        = useLocation();
  const ddrRef          = useRef();

  const isReadOnly = location.state?.readOnly === true;

  const handleRetour   = () => navigate(-1);
  const handleImprimer = () => window.print();
  const handleValider  = () => navigate(`/dashboard/ddr/${ddrId}/valider`);

  return (
    <div className="ddr-page">

      <div className="ddr-page-body">
        <DDRView ref={ddrRef} ddrId={ddrId} readOnly={isReadOnly} />
      </div>

      <div className="ddr-footer no-print">

        {isReadOnly ? (
          /* ── Mode consultation (depuis Historique) ── */
          <>
            <button className="ddr-btn-annuler" onClick={handleRetour}>
              ← Retour
            </button>
            <div className="ddr-footer-right">
              <button className="ddr-btn-annuler" onClick={handleImprimer}>
                🖨 Imprimer
              </button>
              <button className="ddr-btn-annuler" onClick={handleImprimer}>
                ⬇ Exporter
              </button>
            </div>
          </>
        ) : (
          /* ── Mode édition (depuis Planning) ── */
          <>
            <button className="ddr-btn-annuler" onClick={handleRetour}>
              Annuler
            </button>
            <div className="ddr-footer-right">
              <button className="ddr-btn-annuler" onClick={handleImprimer}>
                🖨 Imprimer
              </button>
              <button className="ddr-btn-valider" onClick={handleValider}>
                Valider
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  );
};

export default DDRDetailPage;
