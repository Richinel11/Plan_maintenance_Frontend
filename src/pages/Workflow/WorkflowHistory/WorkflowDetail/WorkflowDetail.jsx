import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getWorkflowById,
  getStepsByWorkflow,
  getTransitions,
  createStep,
  updateStep,
  deleteStep,
  createTransition,
  updateTransition,
  deleteTransition,
  getAllPlannings,
  associatePlanningToWorkflow,
  dissociatePlanningFromWorkflow
} from '../../../../services/workflowService';
import { getRoles } from '../../../../services/userService';
import CreateStepModal from '../components/CreateStepModal';
import CreateTransitionModal from '../components/CreateTransitionModal';
import AssociatePlanningModal from '../components/AssociatePlanningModal';
import './WorkflowDetail.css';

// ... (STATUS_BADGE and Badge components unchanged)

const WorkflowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // état actuel du step en cours d'édition (null = fermé ; {} vide = création ; objet = édition)
  const [selectedStep, setSelectedStep] = useState(null);  
  // état actuel de la transition en cours d'édition
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [savingModal, setSavingModal] = useState(false);

  const loadWorkflowData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wf, sts, trs, allPls, rls] = await Promise.all([
        getWorkflowById(id),
        getStepsByWorkflow(id).catch(() => []),
        getTransitions(id).catch(() => []),
        getAllPlannings().catch(() => []),
        getRoles().catch(() => []),
      ]);
      setWorkflow(wf);
      setSteps(Array.isArray(sts) ? sts : []);
      setTransitions(Array.isArray(trs) ? trs : []);

      // Filtrer les plannings associés à ce workflow (par UUID)
      const associatedPlannings = Array.isArray(allPls)
        ? allPls.filter(p => p.workflow?.id === id || p.workflow === id)
        : [];
      setPlannings(associatedPlannings);

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

  // ─ Handler unifié pour créer OU modifier un step ───────────────────────────────
  const handleSaveStep = async (form) => {
    setSavingModal(true);
    const payload = {
      workflow: id,
      name: form.name,
      code: form.code,
      number: parseInt(form.number) || 1,
      description: form.description,
      is_terminal: form.is_terminal,
    };
    try {
      if (selectedStep?.id) {
        // Mode édition
        await updateStep(payload, id, selectedStep.id);
      } else {
        // Mode création
        await createStep(payload, id);
      }
      setSelectedStep(null);
      await loadWorkflowData();
      toast.success(selectedStep?.id ? "État modifié avec succès." : "État créé avec succès.");
    } catch (err) {
      toast.error(selectedStep?.id ? "Erreur lors de la modification de l'état." : "Erreur lors de la création de l'état.");
    } finally {
      setSavingModal(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet état ?')) return;
    try {
      await deleteStep(id, stepId);
      await loadWorkflowData();
      toast.success("État supprimé avec succès.");
    } catch (err) {
      toast.error("Erreur lors de la suppression de l'état.");
    }
  };

  // ─ Handler unifié pour créer OU modifier une transition ─────────────────────
  const handleSaveTransition = async (form) => {
    setSavingModal(true);
    const payload = {
      workflow: id,
      name: form.name,
      from_step: form.from_step,
      to_step: form.to_step,
      can_go_back: form.can_go_back,
      // n'envoyer go_back_step que si le retour arrière est activé
      go_back_step: form.can_go_back ? (form.go_back_step || null) : null,
      comment_required: form.comment_required,
      role: form.role,
    };
    try {
      if (selectedTransition?.id) {
        // Mode édition
        await updateTransition(payload, id, selectedTransition.id);
      } else {
        // Mode création
        await createTransition(payload, id);
      }
      setSelectedTransition(null);
      await loadWorkflowData();
      toast.success(selectedTransition?.id ? "Transition modifiée avec succès." : "Transition créée avec succès.");
    } catch (err) {
      toast.error(selectedTransition?.id ? "Erreur lors de la modification de la transition." : "Erreur lors de la création de la transition.");
    } finally {
      setSavingModal(false);
    }
  };

  const handleDeleteTransition = async (transitionId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette transition ?')) return;
    try {
      await deleteTransition(id, transitionId);
      await loadWorkflowData();
      toast.success("Transition supprimée avec succès.");
    } catch (err) {
      toast.error("Erreur lors de la suppression de la transition.");
    }
  };

  const handleAssociatePlanning = async (planningId) => {
    setSavingModal(true);
    try {
      await associatePlanningToWorkflow(id, planningId);
      setShowAssociateModal(false);
      await loadWorkflowData();
      toast.success("Planning associé avec succès.");
    } catch (err) {
      toast.error("Erreur lors de l'association du planning.");
    } finally {
      setSavingModal(false);
    }
  };

  const handleDissociatePlanning = async (planningId) => {
    if (!window.confirm('Voulez-vous vraiment dissocier ce planning de ce workflow ?')) return;
    try {
      await dissociatePlanningFromWorkflow(id, planningId);
      await loadWorkflowData();
      toast.success("Planning dissocié avec succès.");
    } catch (err) {
      toast.error("Erreur lors de la dissociation du planning.");
    }
  };

  if (loading && !workflow) {
    // ... (Loading state unchanged)
  }

  if (error) {
    // ... (Error state unchanged)
  }

  return (
    <div className="wfd-page">
      {/* Modale Step : sélectionné = création ({}) OU édition (objet avec .id) */}
      {selectedStep !== null && (
        <CreateStepModal
          onSave={handleSaveStep}
          onClose={() => setSelectedStep(null)}
          loading={savingModal}
          fixedWorkflowId={id}
          initialData={selectedStep?.id ? selectedStep : null}
        />
      )}
      {/* Modale Transition : sélectionnée = création ({}) OU édition (objet avec .id) */}
      {selectedTransition !== null && (
        <CreateTransitionModal
          roles={roles}
          onSave={handleSaveTransition}
          onClose={() => setSelectedTransition(null)}
          loading={savingModal}
          fixedWorkflowId={id}
          initialData={selectedTransition?.id ? selectedTransition : null}
        />
      )}
      {showAssociateModal && (
        <AssociatePlanningModal
          onSave={handleAssociatePlanning}
          onClose={() => setShowAssociateModal(false)}
          loading={savingModal}
          existingPlanningIds={plannings.map(p => p.id)}
        />
      )}

      {/* Breadcrumb et Retour */}
      {/* ... */}

      {/* Header Info */}
      <div className="wfd-header">
        <div className="wfd-header-left">
          {/* ... */}
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
          <div className="wfd-kpi-card" style={{ borderLeftColor: '#1B75BB' }}>
            <div className="wfd-kpi-value" style={{ color: '#1B75BB' }}>{plannings.length}</div>
            <div className="wfd-kpi-label">Plannings</div>
          </div>
        </div>
      </div>

      {/* SECTION DU HAUT : PLANNINGS ASSOCIÉS (AJOUTÉE) */}
      <div className="wfd-section">
        <div className="wfd-section-header">
          <div className="wfd-section-title">
            <span className="material-symbols-outlined icon-blue">calendar_month</span>
            <h2>Plannings associés</h2>
            <span className="wfd-badge-count">{plannings.length}</span>
          </div>
          <button className="wfd-btn-primary wfd-btn-sm" onClick={() => setShowAssociateModal(true)}>
            + Associer un Planning
          </button>
        </div>

        <div className="wfd-table-wrapper">
          <table className="wfd-table">
            <thead>
              <tr>
                <th>Nom du Planning</th>
                <th>Code</th>
                <th>Service</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plannings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="wfd-no-data">
                    Aucun planning associé à ce workflow.
                  </td>
                </tr>
              ) : (
                plannings.map(p => (
                  <tr key={p.id}>
                    <td className="wfd-font-medium">{p.nom || p.name}</td>
                    <td><span className="wfd-code-tag">{p.code}</span></td>
                    <td>{p.service || '—'}</td>
                    <td>{p.statut || '—'}</td>
                    <td className="wfd-td-actions">
                      <button
                        className="wfd-action-btn delete"
                        onClick={() => handleDissociatePlanning(p.id)}
                        title="Dissocier le planning"
                      >
                        <span className="material-symbols-outlined">link_off</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION DU MILIEU : TRANSITIONS (FULL WIDTH) */}
      <div className="wfd-section">
        <div className="wfd-section-header">
          <div className="wfd-section-title">
            <span className="material-symbols-outlined icon-orange">alt_route</span>
            <h2>Transitions configurées</h2>
            <span className="wfd-badge-count">{transitions.length}</span>
          </div>
          <button className="wfd-btn-primary wfd-btn-sm" onClick={() => setSelectedTransition({})}>
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
                  const fromStep = t.from_step;
                  const toStep = t.to_step;
                  const r = roles.find(role => String(role.id) === String(t.role) || String(role.code_role) === String(t.role));
                  const roleName = t.role_name || (r ? r.nom : (t.role ? `#${t.role}` : '—'));
                  // console.log("steps", steps)

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
                          ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined wfd-check-sober">check</span>
                              {t.go_back_step && (
                                <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 600 }}>
                                  → {steps.find(s => String(s.id) === String(t.go_back_step))?.name || `#${t.go_back_step}`}
                                </span>
                              )}
                            </div>
                          )
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
                          onClick={() => setSelectedTransition(t)}
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
          <button className="wfd-btn-secondary wfd-btn-sm" onClick={() => setSelectedStep({})}>
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
                        onClick={() => setSelectedStep(s)}
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
