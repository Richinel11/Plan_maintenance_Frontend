import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getWorkflows, deleteWorkflow,
  getStepsByWorkflow, createStep, deleteStep,
  getTransitions, createTransition, deleteTransition
} from '../../../services/workflowService';
import { getRoles } from '../../../services/userService';
import ConfirmModal from './components/ConfirmModal';
import CreateWorkflowModal from './components/CreateWorkflowModal';
import CreateStepModal from './components/CreateStepModal';
import CreateTransitionModal from './components/CreateTransitionModal';
import './WorkflowHistory.css';

// ─── Badge statut ─────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  actif: { label: 'Actif', bg: 'rgba(141,198,64,0.15)', color: '#5d8b1f' },
  brouillon: { label: 'Brouillon', bg: 'rgba(147,149,151,0.15)', color: '#5a5c5e' },
  archivé: { label: 'Archivé', bg: 'rgba(229,57,53,0.10)', color: '#c62828' },
};
const Badge = ({ status }) => {
  const s = STATUS_BADGE[status] || STATUS_BADGE.brouillon;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.4px' }}>
      {s.label}
    </span>
  );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
const WorkflowHistory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const [workflows, setWorkflows] = useState([]);
  const [steps, setSteps] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Modales
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id }

  // Chargement initial
  const loadAll = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const wfs = await getWorkflows().catch(() => []);
      const workflowList = Array.isArray(wfs) ? wfs : [];
      setWorkflows(workflowList);

      const allSteps = [];
      const allTransitions = [];

      await Promise.all(workflowList.map(async (w) => {
        try {
          const sts = await getStepsByWorkflow(w.id);
          if (Array.isArray(sts)) {
            allSteps.push(...sts.map(s => ({ ...s, workflow: s.workflow || w.id })));
          }
        } catch (e) { }
        try {
          const trs = await getTransitions(w.id);
          if (Array.isArray(trs)) {
            allTransitions.push(...trs.map(t => ({ ...t, workflow: t.workflow || w.id })));
          }
        } catch (e) { }
      }));

      setSteps(allSteps);
      setTransitions(allTransitions);
    } catch (e) {
      setError('Impossible de charger les données. Vérifiez la connexion au backend.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Filtres ───
  const filteredWorkflows = workflows.filter(item =>
    ['name', 'nom', 'code'].some(f => item[f] && String(item[f]).toLowerCase().includes(search.toLowerCase()))
  );

  // ─── Handlers suppression ───
  const handleDelete = async () => {
    const { type, id } = confirmDelete;
    try {
      if (type === 'workflow') await deleteWorkflow(id);
      await loadAll();
    } catch {
      alert('Erreur lors de la suppression.');
    } finally {
      setConfirmDelete(null);
    }
  };

  // ─── Handlers création Workflow ───
  const handleSaveWorkflow = async (form) => {
    setSavingModal(true);
    try {
      await createWorkflow({
        name: form.name,
        code: form.code,
        description: form.description,
        is_active: form.is_active,
        planning_id: null
      });
      setShowWorkflowModal(false);
      await loadAll();
    } catch {
      alert('Erreur lors de la création du workflow.');
    } finally {
      setSavingModal(false);
    }
  };

  return (
    <div className="wfh-page">
      {/* ─── Modales ─── */}
      {confirmDelete && (
        <ConfirmModal
          message={`Voulez-vous vraiment supprimer ce workflow ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {showWorkflowModal && (
        <CreateWorkflowModal
          onSave={handleSaveWorkflow}
          onClose={() => setShowWorkflowModal(false)}
          loading={savingModal}
        />
      )}

      {/* ─── HEADER ─── */}
      <div className="wfh-header">
        <div>
          <h1 className="wfh-title">Gestion des Workflows</h1>
          <p className="wfh-subtitle">Configurez les séquences de maintenance, les états et les transitions métier.</p>
        </div>
        <div className="wfh-header-actions">
          <button className="wfh-btn-primary" onClick={() => setShowWorkflowModal(true)}>
            <span className="material-symbols-outlined">add_circle</span>
            Nouveau Workflow
          </button>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div className="wfh-kpis">
        <div className="wfh-kpi-card" style={{ borderLeftColor: '#1B75BB' }}>
          <div className="wfh-kpi-value" style={{ color: '#1B75BB' }}>{workflows.length}</div>
          <div className="wfh-kpi-label">Workflows</div>
        </div>
        <div className="wfh-kpi-card" style={{ borderLeftColor: '#8DC640' }}>
          <div className="wfh-kpi-value" style={{ color: '#8DC640' }}>{steps.length}</div>
          <div className="wfh-kpi-label">États (Steps) globaux</div>
        </div>
        <div className="wfh-kpi-card" style={{ borderLeftColor: '#F59E0B' }}>
          <div className="wfh-kpi-value" style={{ color: '#F59E0B' }}>{transitions.length}</div>
          <div className="wfh-kpi-label">Transitions globales</div>
        </div>
        <div className="wfh-kpi-card" style={{ borderLeftColor: '#8DC640' }}>
          <div className="wfh-kpi-value" style={{ color: '#8DC640' }}>
            {workflows.filter(w => w.is_active).length}
          </div>
          <div className="wfh-kpi-label">Workflows actifs</div>
        </div>
      </div>

      {/* ─── Erreur ou chargement ─── */}
      {error && <div className="wfh-alert-error">{error}</div>}

      {/* ─── BARRE DE RECHERCHE + CONTENU ─── */}
      <div className="wfh-section">
        <div className="wfh-filters-bar">
          <div className="wfh-search-wrapper">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text" className="wfh-search"
              placeholder="Rechercher un workflow..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loadingData ? (
          <div className="wfh-loading">
            <div className="wfh-spinner"></div>
            <p>Chargement des données...</p>
          </div>
        ) : (
          <div className="wfh-table-wrapper">
            <table className="wfh-table">
              <thead>
                <tr>
                  <th>NOM DU WORKFLOW</th>
                  <th>CODE</th>
                  <th>DESCRIPTION</th>
                  <th className="wfh-center">ÉTAPES</th>
                  <th className="wfh-center">TRANSITIONS</th>
                  <th>STATUT</th>
                  <th className="wfh-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.length === 0 ? (
                  <tr><td colSpan={7} className="wfh-no-data">Aucun workflow trouvé</td></tr>
                ) : filteredWorkflows.map(w => (
                  <tr key={w.id}>
                    <td className="wfh-name-cell" onClick={() => navigate(`/dashboard/workflow/${w.id}`)}>{w.name || w.nom}</td>
                    <td className="wfh-text-gray-code">{w.code}</td>
                    <td className="wfh-text-gray">{w.description || '—'}</td>
                    <td className="wfh-center">
                      <span className="wfh-count-pill">
                        {steps.filter(s => String(s.workflow) === String(w.id)).length}
                      </span>
                    </td>
                    <td className="wfh-center">
                      <span className="wfh-count-pill" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                        {transitions.filter(t => String(t.workflow) === String(w.id)).length}
                      </span>
                    </td>
                    <td>
                      <Badge status={w.is_active ? 'actif' : 'brouillon'} />
                    </td>
                    <td className="wfh-td-actions wfh-center">
                      <button className="wfh-action-btn edit"
                        onClick={() => navigate(`/dashboard/workflow/${w.id}`)}
                        title="Modifier">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="wfh-action-btn delete"
                        onClick={() => setConfirmDelete({ type: 'workflow', id: w.id })}
                        title="Supprimer">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

  );
};

export default WorkflowHistory;
