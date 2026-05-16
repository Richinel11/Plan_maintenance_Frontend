import React from 'react';
import './Modals.css';

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="wfh-overlay" onClick={onCancel}>
    <div className="wfh-modal-card wfh-modal-sm" onClick={e => e.stopPropagation()}>
      <div className="wfh-modal-header">
        <h3>⚠️ Confirmation</h3>
        <button className="wfh-modal-close" onClick={onCancel}>✕</button>
      </div>
      <div className="wfh-modal-body">
        <p style={{ color:'#444', lineHeight:1.6 }}>{message}</p>
      </div>
      <div className="wfh-modal-footer">
        <button className="wfh-btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="wfh-btn-danger" onClick={onConfirm}>Supprimer</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
