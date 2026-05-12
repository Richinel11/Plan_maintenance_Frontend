import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getWorkflowById,
  getStepsByWorkflow,
  getTransitionsByWorkflow,
  createStep,
  deleteStep,
  createTransition,
  deleteTransition
} from '../../../../services/workflowService';
import { getRoles } from '../../../../services/userService';
import CreateStepModal from '../components/CreateStepModal';
import CreateTransitionModal from '../components/CreateTransitionModal';
import './WorkflowDetail.css';

// ─── Badge statut ─────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  actif:     { label: 'Actif',     bg: 'rgba(141,198,64,0.15)',  color: '#5d8b1f' },
  brouillon: { label: 'Brouillon', bg: 'rgba(147,149,151,0.15)', color: '#5a5c5e' },
  archivé:   { label: 'Archivé',   bg: 'rgba(229,57,53,0.10)',   color: '#c62828' },
};

const Badge = ({ status }) => {
  const s = STATUS_BADGE[status] || STATUS_BADGE.brouillon;
  return (
    <span style={{ background: s.bg, color: s.color, padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700, letterSpacing:'0.4px' }}>
      {s.label}
    </span>
  );
};

const WorkflowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modales
  const [showStepModal, setShowStepModal] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [savingModal, setSavingModal] = useState(false);

  const loadWorkflowData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wf, sts, trs, rls] = await Promise.all([
        getWorkflowById(id),
        getStepsByWorkflow(id).catch(() => []),
        getTransitionsByWorkflow(id).catch(() => []),
        getRoles().catch(() => []),
      ]);
      setWorkflow(wf);
      setSteps(Array.isArray(sts) ? sts : []);
      setTransitions(Array.isArray(trs) ? trs : []);
      setRoles(Array.isArray(rls) ? rls : []);
    } catch (err) {
      setError("Impossible de charger les détails du workflow.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorkflowData();
  }, [loadWorkflowData]);

  const handleSaveStep = async (form) => {
    setSavingModal(true);
    try {
      await createStep({
        workflow: id,
        name: form.name,
        code: form.code,
        number: parseInt(form.number) || 1,
        description: form.description,
        is_terminal: form.is_terminal,
      }, id);
      setShowStepModal(false);
      await loadWorkflowData();
    } catch (err) {
      alert("Erreur lors de la création de l'état.");
    } finally {
      setSavingModal(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet état ?')) return;
    try {
      await deleteStep(id, stepId);
      await loadWorkflowData();
    } catch (err) {
      alert("Erreur lors de la suppression de l'état.");
    }
  };

  const handleSaveTransition = async (form) => {
    setSavingModal(true);
    try {
      await createTransition({
        workflow: id,
        name: form.name,
        from_step: form.from_step,
        to_step: form.to_step,
        can_go_back: form.can_go_back,
        comment_required: form.comment_required,
        role: form.role,
      }, id);
      setShowTransitionModal(false);
      await loadWorkflowData();
    } catch (err) {
      alert("Erreur lors de la création de la transition.");
    } finally {
      setSavingModal(false);
    }
  };

  const handleDeleteTransition = async (transitionId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette transition ?')) return;
    try {
      await deleteTransition(id, transitionId);
      await loadWorkflowData();
    } catch (err) {
      alert("Erreur lors de la suppression de la transition.");
    }
  };

  if (loading && !workflow) {
    return (
      <div className="wfd-page-loading">
        <div className="wfd-spinner"></div>
        <p>Chargement du workflow...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wfd-page">
        <div className="wfd-alert-error">{error}</div>
        <button className="wfd-back-btn" onClick={() => navigate('/dashboard/workflow/historique')}>
          ← Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="wfd-page">
      {/* Modales */}
      {showStepModal && (
        <CreateStepModal
          onSave={handleSaveStep}
          onClose={() => setShowStepModal(false)}
          loading={savingModal}
          fixedWorkflowId={id}
        />
      )}
      {showTransitionModal && (
        <CreateTransitionModal
          roles={roles}
          onSave={handleSaveTransition}
          onClose={() => setShowTransitionModal(false)}
          loading={savingModal}
          fixedWorkflowId={id}
        />
      )}

      {/* Breadcrumb et Retour */}
      <div className="wfd-breadcrumb">
        <button className="wfd-back-btn" onClick={() => navigate('/dashboard/workflow/historique')}>
          ← Retour à l'historique des workflows
        </button>
      </div>

      {/* Header Info */}
      <div className="wfd-header">
        <div className="wfd-header-left">
          <div className="wfd-title-row">
            <h1 className="wfd-title">{workflow?.name || workflow?.nom}</h1>
            <Badge status={workflow?.is_active ? 'actif' : 'brouillon'} />
          </div>
          <div className="wfd-meta-row">
            <span className="wfd-code-pill">CODE: {workflow?.code}</span>
            {workflow?.created_at && (
              <span className="wfd-date-text">Créé le {new Date(workflow.created_at).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
          <p className="wfd-description">{workflow?.description || 'Aucune description fournie pour ce workflow.'}</p>
        </div>

        {/* KPI Cards */}
        <div className="wfd-kpis">
          <div className="wfd-kpi-card" style={{ borderLeftColor: '#F59E0B' }}>
            <div className="wfd-kpi-value" style={{ color: '#F59E0B' }}>{transitions.length}</div>
            <div className="wfd-kpi-label">Transitions</div>
          </div>
          <div className="wfd-kpi-card" style={{ borderLeftColor: '#8DC640' }}>
            <div className="wfd-kpi-value" style={{ color: '#8DC640' }}>{steps.length}</div>
            <div className="wfd-kpi-label">États (Steps)</div>
          </div>
        </div>
      </div>

      {/* SECTION DU HAUT : TRANSITIONS (FULL WIDTH) */}
      <div className="wfd-section">
        <div className="wfd-section-header">
          <div className="wfd-section-title">
            <span className="material-symbols-outlined icon-orange">alt_route</span>
            <h2>Transitions configurées</h2>
            <span className="wfd-badge-count">{transitions.length}</span>
          </div>
          <button className="wfd-btn-primary wfd-btn-sm" onClick={() => setShowTransitionModal(true)}>
            + Nouvelle Transition
          </button>
        </div>

        <div className="wfd-table-wrapper">
          <table className="wfd-table">
            <thead>
              <tr>
                <th>Nom de la Transition</th>
                <th>État Initial</th>
                <th>État Final</th>
                <th>Retour Arrière</th>
                <th>Rôle Compétent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transitions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="wfd-no-data">
                    Aucune transition configurée.
                  </td>
                </tr>
              ) : (
                transitions.map(t => {
                  const fromStep = steps.find(s => String(s.id) === String(t.from_step));
                  const toStep = steps.find(s => String(s.id) === String(t.to_step));
                  const r = roles.find(role => String(role.id) === String(t.role) || String(role.code_role) === String(t.role));
                  const roleName = t.role_name || (r ? r.nom : (t.role ? `#${t.role}` : '—'));

                  return (
                    <tr key={t.id}>
                      <td className="wfd-font-medium">{t.name || t.nom}</td>
                      <td>
                        <div className="wfd-step-pill">
                          {fromStep ? (fromStep.name || fromStep.nom) : `#${t.from_step}`}
                        </div>
                      </td>
                      <td>
                        <div className="wfd-step-pill">
                          {toStep ? (toStep.name || toStep.nom) : `#${t.to_step}`}
                        </div>
                      </td>
                      <td className="wfd-center">
                        {t.can_go_back 
                          ? <span className="material-symbols-outlined wfd-check-sober">check</span> 
                          : <span className="material-symbols-outlined wfd-cross-sober">close</span>}
                      </td>
                      <td>
                        {roleName !== '—' ? (
                          <span className="wfd-role-tag">{roleName}</span>
                        ) : (
                          <span style={{ color: '#939597' }}>—</span>
                        )}
                      </td>
                      <td className="wfd-td-actions">
                        <button
                          className="wfd-action-btn edit"
                          onClick={() => {/* TODO: handleEditTransition */}}
                          title="Modifier la transition"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="wfd-action-btn delete"
                          onClick={() => handleDeleteTransition(t.id)}
                          title="Supprimer la transition"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION DU BAS : ÉTATS / STEPS (FULL WIDTH) */}
      <div className="wfd-section">
        <div className="wfd-section-header">
          <div className="wfd-section-title">
            <span className="material-symbols-outlined icon-green">radio_button_checked</span>
            <h2>États (Steps) du Workflow</h2>
            <span className="wfd-badge-count">{steps.length}</span>
          </div>
          <button className="wfd-btn-secondary wfd-btn-sm" onClick={() => setShowStepModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Nouvel État
          </button>
        </div>

        <div className="wfd-table-wrapper">
          <table className="wfd-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ORDRE</th>
                <th>NOM DE L'ÉTAT</th>
                <th>CODE</th>
                <th>DESCRIPTION</th>
                <th>TYPE D'ÉTAT</th>
                <th className="wfd-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {steps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="wfd-no-data">
                    Aucun état (step) configuré.
                  </td>
                </tr>
              ) : (
                steps.sort((a, b) => (a.number || 0) - (b.number || 0)).map(s => (
                  <tr key={s.id}>
                    <td className="wfh-center">
                      <span className="wfd-num-badge">{s.number}</span>
                    </td>
                    <td className="wfd-font-medium">{s.name || s.nom}</td>
                    <td>
                      <span className="wfd-code-tag">{s.code}</span>
                    </td>
                    <td>
                      <p className="wfd-desc-text" title={s.description}>{s.description || '—'}</p>
                    </td>
                    <td>
                      {s.is_terminal ? (
                        <span className="wfd-badge-terminal">TERMINAL</span>
                      ) : (
                        <span className="wfd-badge-normal">INTERMÉDIAIRE</span>
                      )}
                    </td>
                    <td className="wfd-td-actions wfd-center">
                      <button
                        className="wfd-action-btn edit"
                        onClick={() => {/* TODO: handleEditStep */}}
                        title="Modifier l'état"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        className="wfd-action-btn delete"
                        onClick={() => handleDeleteStep(s.id)}
                        title="Supprimer l'état"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetail;
