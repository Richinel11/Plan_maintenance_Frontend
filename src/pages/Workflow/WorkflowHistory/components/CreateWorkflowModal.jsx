import React, { useState } from 'react';
import './Modals.css';

const CreateWorkflowModal = ({ onSave, onClose, loading }) => {
  const [form, setForm] = useState({ name: '', code: '', description: '', is_active: true });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.code.trim()) {
      alert('Le Nom et le Code sont obligatoires.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="wfh-overlay" onClick={onClose}>
      <div className="wfh-modal-card" onClick={e => e.stopPropagation()}>
        <div className="wfh-modal-header">
          <h3>⚙ Nouveau Workflow</h3>
          <button className="wfh-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wfh-modal-body">
          <div className="wfh-form-row">
            <div className="wfh-form-field">
              <label>NOM DU WORKFLOW <span className="wfh-req">*</span></label>
              <input
                className="wfh-form-input"
                placeholder="Ex: Maintenance Préventive"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoFocus
              />
            </div>
            <div className="wfh-form-field wfh-field-sm">
              <label>CODE <span className="wfh-req">*</span></label>
              <input
                className="wfh-form-input"
                placeholder="EX: WF_MAINT_PREV"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, '_'))}
              />
            </div>
          </div>
          <div className="wfh-form-row">
            <div className="wfh-form-field wfh-field-full">
              <label>DESCRIPTION DÉTAILLÉE</label>
              <textarea
                className="wfh-form-input"
                rows="3"
                placeholder="Décrivez les objectifs de ce workflow..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>
          <label className="wfh-checkbox-label">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
            />
            <span>Activer ce workflow dès la création</span>
          </label>
        </div>
        <div className="wfh-modal-footer">
          <button className="wfh-btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="wfh-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Enregistrement...' : '✔ Créer le workflow'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflowModal;
