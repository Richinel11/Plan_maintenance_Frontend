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

  // état actuel du step en cours d'édition (null = fermé ; {} vide = création ; objet = édition)
  const [selectedStep, setSelectedStep] = useState(null);  
  // état actuel de la transition en cours d'édition
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [savingModal, setSavingModal] = useState(false);

  const loadWorkflowData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wf, sts, trs, rls] = await Promise.all([
        getWorkflowById(id),
        getStepsByWorkflow(id).catch(() => []),
        getTransitions(id).catch(() => []),
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

  const handleDeleteStep = (stepId) => {
    toast.warning("Supprimer cet état ?", {
      description: "Cette action est irréversible.",
      duration: 8000,
      action: {
        label: "Confirmer",
        onClick: async () => {
          try {
            await deleteStep(id, stepId);
            await loadWorkflowData();
            toast.success("État supprimé avec succès.");
          } catch (err) {
            toast.error("Erreur lors de la suppression de l'état.");
          }
        }
      },
      cancel: {
        label: "Annuler",
        onClick: () => {}
      }
    });
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
      go_back_to: form.can_go_back ? (form.go_back_step || null) : null,
      comment_required: form.comment_required,
      role: form.role,
    };
    try {
      if (selectedTransition?.id) {
        await updateTransition(payload, id, selectedTransition.id);
      } else {
        await createTransition(payload, id);
      }
      setSelectedTransition(null);
      await loadWorkflowData();
      toast.success(selectedTransition?.id ? "Transition modifiée avec succès." : "Transition créée avec succès.");
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError && typeof apiError === 'object') {
        const messages = Object.entries(apiError)
          .map(([key, val]) => `${key} : ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        toast.error(messages);
      } else {
        toast.error(err.message || "Erreur lors de l'enregistrement de la transition.");
      }
    } finally {
      setSavingModal(false);
    }
  };

  const handleDeleteTransition = (transitionId) => {
    toast.warning("Supprimer cette transition ?", {
      description: "Cette action est irréversible.",
      duration: 8000,
      action: {
        label: "Confirmer",
        onClick: async () => {
          try {
            await deleteTransition(id, transitionId);
            await loadWorkflowData();
            toast.success("Transition supprimée avec succès.");
          } catch (err) {
            toast.error("Erreur lors de la suppression de la transition.");
          }
        }
      },
      cancel: {
        label: "Annuler",
        onClick: () => {}
      }
    });
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
                  /*
                   * Données de la transition retournées par WorkflowTransitionSerializer :
                   *
                   *  - t.from_step  : objet Step { id, name, code, ... }
                   *  - t.to_step    : objet Step { id, name, code, ... }
                   *  - t.go_back_to : objet Step { id, name, ... } ou null
                   *                   ⚠️ Ce champ s'appelle "go_back_to" (nom du FK dans le modèle),
                   *                      PAS "go_back_step" — erreur corrigée ici.
                   *  - t.role_info  : objet { id, nom, code_role } récupéré via WorkflowValidation
                   *                   ⚠️ Le rôle n'est pas sur WorkflowTransition directement,
                   *                      il est calculé côté backend dans get_role_info().
                   */
                  const fromStep = t.from_step;
                  const toStep   = t.to_step;

                  // go_back_to est un objet Step imbriqué (ou null si can_go_back=false).
                  // On accède directement à .name, sans chercher dans la liste locale.
                  const goBackStep = t.go_back_to;

                  // role_info est calculé côté backend via WorkflowValidation.
                  // Il contient { id, nom, code_role } ou null si aucune validation liée.
                  const roleName = t.role_info?.nom || '—';

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
                              {/* Affiche le nom de l'étape de retour si elle existe */}
                              {goBackStep && (
                                <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 600 }}>
                                  → {goBackStep.name || goBackStep.nom}
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
