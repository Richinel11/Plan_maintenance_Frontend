import React, { useState } from 'react';
import './Modals.css';

const CreateStepModal = ({ workflows, onSave, onClose, loading, fixedWorkflowId = null }) => {
  const [form, setForm] = useState({ 
    workflow: fixedWorkflowId || '', 
    name: '', 
    code: '', 
    number: '1', 
    description: '', 
    is_terminal: false 
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.workflow || !form.name.trim() || !form.code.trim()) {
      alert('Workflow, Nom et Code sont obligatoires.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="wfh-overlay" onClick={onClose}>
      <div className="wfh-modal-card" onClick={e => e.stopPropagation()}>
        <div className="wfh-modal-header">
          <h3>🔵 Nouvel État (Step)</h3>
          <button className="wfh-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wfh-modal-body">
          {!fixedWorkflowId && (
            <div className="wfh-form-row">
              <div className="wfh-form-field wfh-field-full">
                <label>WORKFLOW <span className="wfh-req">*</span></label>
                <select className="wfh-form-input" value={form.workflow} onChange={e => set('workflow', e.target.value)}>
                  <option value="">-- Sélectionner un workflow --</option>
                  {workflows.map(w => <option key={w.id} value={w.id}>{w.name || w.nom}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="wfh-form-row">
            <div className="wfh-form-field">
              <label>NOM <span className="wfh-req">*</span></label>
              <input className="wfh-form-input" placeholder="Ex: En attente de validation" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
            </div>
            <div className="wfh-form-field wfh-field-sm">
              <label>CODE <span className="wfh-req">*</span></label>
              <input className="wfh-form-input" placeholder="EX: EN_ATTENTE" value={form.code} onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, '_'))} />
            </div>
            <div className="wfh-form-field wfh-field-xs">
              <label>N°</label>
              <input type="number" className="wfh-form-input" min="1" value={form.number} onChange={e => set('number', e.target.value)} />
            </div>
          </div>
          <div className="wfh-form-row">
            <div className="wfh-form-field wfh-field-full">
              <label>DESCRIPTION</label>
              <textarea className="wfh-form-input" rows="2" placeholder="Décrivez cet état..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
          <label className="wfh-checkbox-label">
            <input type="checkbox" checked={form.is_terminal} onChange={e => set('is_terminal', e.target.checked)} />
            <span>État terminal (état final du processus)</span>
          </label>
        </div>
        <div className="wfh-modal-footer">
          <button className="wfh-btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="wfh-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Enregistrement...' : '✔ Créer l\'état'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStepModal;
