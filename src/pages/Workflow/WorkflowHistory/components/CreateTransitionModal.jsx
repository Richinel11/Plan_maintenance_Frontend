import React, { useState, useEffect } from 'react';
import { getStepsByWorkflow } from '../../../../services/workflowService';
import './Modals.css';

const CreateTransitionModal = ({ workflows, roles, onSave, onClose, loading, fixedWorkflowId = null }) => {
  const [form, setForm] = useState({ 
    workflow: fixedWorkflowId || '', 
    name: '', 
    from_step: '', 
    to_step: '', 
    can_go_back: false, 
    go_back_step: '',
    role: '' 
  });
  const [steps, setSteps] = useState([]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!form.workflow) { setSteps([]); return; }
    getStepsByWorkflow(form.workflow)
      .then(data => setSteps(Array.isArray(data) ? data : []))
      .catch(() => setSteps([]));
  }, [form.workflow]);

  const handleSubmit = () => {
    if (!form.workflow || !form.name.trim() || !form.from_step || !form.to_step || !form.role) {
      alert('Workflow, Nom, État initial, État final et Rôle compétent sont obligatoires.');
      return;
    }
    if (form.can_go_back && !form.go_back_step) {
      alert('Veuillez sélectionner l\'état vers lequel revenir.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="wfh-overlay" onClick={onClose}>
      <div className="wfh-modal-card" onClick={e => e.stopPropagation()}>
        <div className="wfh-modal-header">
          <h3>🔀 Nouvelle Transition</h3>
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
            <div className="wfh-form-field wfh-field-full">
              <label>NOM DE LA TRANSITION <span className="wfh-req">*</span></label>
              <input className="wfh-form-input" placeholder="Ex: Soumettre pour validation" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
            </div>
          </div>
          <div className="wfh-form-row">
            <div className="wfh-form-field wfh-field-full">
              <label>RÔLE COMPÉTENT <span className="wfh-req">*</span></label>
              <select className="wfh-form-input" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="">-- Sélectionner un rôle --</option>
                {roles.map(r => <option key={r.id || r.code_role} value={r.id}>{r.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="wfh-form-row">
            <div className="wfh-form-field">
              <label>ÉTAT INITIAL <span className="wfh-req">*</span></label>
              <select className="wfh-form-input" value={form.from_step} onChange={e => set('from_step', e.target.value)} disabled={!form.workflow}>
                <option value="">-- Sélectionner --</option>
                {steps.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="wfh-form-field">
              <label>ÉTAT FINAL <span className="wfh-req">*</span></label>
              <select className="wfh-form-input" value={form.to_step} onChange={e => set('to_step', e.target.value)} disabled={!form.workflow}>
                <option value="">-- Sélectionner --</option>
                {steps.filter(s => String(s.id) !== String(form.from_step)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="wfh-form-row wfh-form-checks">
            <label className="wfh-checkbox-label">
              <input type="checkbox" checked={form.can_go_back} onChange={e => set('can_go_back', e.target.checked)} />
              <span>Retour arrière autorisé</span>
            </label>
          </div>

          {form.can_go_back && (
            <div className="wfh-form-row" style={{ marginTop: '4px' }}>
              <div className="wfh-form-field wfh-field-full">
                <label>ÉTAT DE RETOUR <span className="wfh-req">*</span></label>
                <select 
                  className="wfh-form-input" 
                  value={form.go_back_step} 
                  onChange={e => set('go_back_step', e.target.value)}
                  style={{ borderColor: '#F59E0B' }}
                >
                  <option value="">-- Sélectionner l'état de destination du retour --</option>
                  {steps
                    .filter(s => String(s.id) !== String(form.to_step))
                    .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                  }
                </select>
                <p style={{ fontSize: '11px', color: '#939597', margin: '4px 0 0 0' }}>
                  En cas de rejet, le planning reviendra à cet état précis.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="wfh-modal-footer">
          <button className="wfh-btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="wfh-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Enregistrement...' : '✔ Créer la transition'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTransitionModal;
