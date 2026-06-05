import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DDRView from '../../../components/shared/DDRView/DDRView';
import './DDRDetailPage.css';

const DDRDetailPage = () => {
  const navigate   = useNavigate();
  const { ddrId }  = useParams();
  const ddrRef     = useRef();
  const [readOnly, setReadOnly] = useState(false);

  const handleAnnuler = () => navigate(-1);

  const handleImprimer = () => window.print();

  const handleValider = () => {
    const formData = ddrRef.current?.getFormData();
    console.log('[DDR] Données à enregistrer :', formData);
    setReadOnly(true);
  };

  return (
    <div className="ddr-page">

      <div className="ddr-page-body">
        <DDRView ref={ddrRef} ddrId={ddrId} readOnly={readOnly} />
      </div>

      <div className="ddr-footer no-print">
        <button className="ddr-btn-annuler" onClick={handleAnnuler}>
          Annuler
        </button>
        <div className="ddr-footer-right">
          {readOnly && (
            <button className="ddr-btn-annuler" onClick={handleImprimer}>
              🖨 Imprimer
            </button>
          )}
          {!readOnly && (
            <button className="ddr-btn-valider" onClick={handleValider}>
              Valider
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default DDRDetailPage;
