import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkflowHistory.css';

// ─── DONNÉES ───────────────────────────────────
const STATUS_BADGE = {
  actif:      { label: 'Actif',      bg: 'rgba(141,198,64,0.15)',     color: '#5d8b1f' },
  brouillon:  { label: 'Brouillon',  bg: 'rgba(147,149,151,0.15)',    color: '#5a5c5e' },
  archivé:    { label: 'Archivé',    bg: 'rgba(229,57,53,0.10)',      color: '#c62828' },
};

const Badge = ({ status }) => {
  const s = STATUS_BADGE[status] || STATUS_BADGE.brouillon;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.4px'
    }}>
      {s.label}
    </span>
  );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────
const WorkflowHistory = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('processes'); // 'processes' | 'orchestrators'
  const [searchProcess, setSearchProcess] = useState('');
  const [searchOrch, setSearchOrch] = useState('');
  
  // Remplacé par des states vides pour l'intégration API
  const [processes, setProcesses] = useState([]);
  const [orchestrators, setOrchestrators] = useState([]);

  const filteredProcesses = processes.filter(p =>
    (p.name && p.name.toLowerCase().includes(searchProcess.toLowerCase())) ||
    (p.object && p.object.toLowerCase().includes(searchProcess.toLowerCase()))
  );

  const filteredOrch = orchestrators.filter(w =>
    (w.name && w.name.toLowerCase().includes(searchOrch.toLowerCase()))
  );

  return (
    <div className="wfh-page">
      {/* ─── HEADER DE PAGE ─── */}
      <div className="wfh-header">
        <div>
          <h1 className="wfh-title">Gestion des Workflows</h1>
          <p className="wfh-subtitle">
            Concevez et gérez les machines à états (Processus) et les orchestrateurs globaux de votre application.
          </p>
        </div>
        <div className="wfh-header-actions">
          <button className="wfh-btn-secondary" onClick={() => navigate('/dashboard/workflow/processus/creer')}>
            + Nouveau Processus
          </button>
          <button className="wfh-btn-primary" onClick={() => navigate('/dashboard/workflow/orchestrateur/creer')}>
            + Nouvel Orchestrateur
          </button>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div className="wfh-kpis">
        <div className="wfh-kpi-card">
          <div className="wfh-kpi-value" style={{ color: '#1B75BB' }}>{processes.length}</div>
          <div className="wfh-kpi-label">Processus modélisés</div>
        </div>
        <div className="wfh-kpi-card">
          <div className="wfh-kpi-value" style={{ color: '#14689E' }}>{orchestrators.length}</div>
          <div className="wfh-kpi-label">Orchestrateurs actifs</div>
        </div>
        <div className="wfh-kpi-card">
          <div className="wfh-kpi-value" style={{ color: '#8DC640' }}>
            {processes.filter(p => p.status === 'actif').length}
          </div>
          <div className="wfh-kpi-label">Processus en production</div>
        </div>
        <div className="wfh-kpi-card">
          <div className="wfh-kpi-value" style={{ color: '#939597' }}>
            {processes.filter(p => p.status === 'brouillon').length + orchestrators.filter(w => w.status === 'brouillon').length}
          </div>
          <div className="wfh-kpi-label">Brouillons en attente</div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="wfh-tabs">
        <button className={`wfh-tab ${tab === 'processes' ? 'active' : ''}`}
          onClick={() => setTab('processes')}>
          ⚙ Processus ({processes.length})
        </button>
        <button className={`wfh-tab ${tab === 'orchestrators' ? 'active' : ''}`}
          onClick={() => setTab('orchestrators')}>
          🔀 Orchestrateurs ({orchestrators.length})
        </button>
      </div>

      {/* ─── LISTE PROCESSUS ─── */}
      {tab === 'processes' && (
        <div className="wfh-section">
          <div className="wfh-search-bar">
            <input type="text" className="wfh-search" placeholder="🔍 Rechercher un processus..."
              value={searchProcess} onChange={e => setSearchProcess(e.target.value)} />
          </div>
          <div className="wfh-table-wrapper">
            <table className="wfh-table">
              <thead>
                <tr>
                  <th>Nom du Processus</th>
                  <th>Application</th>
                  <th>Objet</th>
                  <th>États</th>
                  <th>Auteur</th>
                  <th>Créé le</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.length === 0 ? (
                  <tr><td colSpan={8} className="wfh-no-data">Aucun processus trouvé</td></tr>
                ) : filteredProcesses.map(p => (
                  <tr key={p.id}>
                    <td className="wfh-name-cell">{p.name}</td>
                    <td><span className="wfh-app-tag">{p.app}</span></td>
                    <td>{p.object}</td>
                    <td className="wfh-center">{p.states}</td>
                    <td>{p.author}</td>
                    <td>{p.createdAt}</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <div className="wfh-row-actions">
                        <button className="wfh-action-btn edit"
                          onClick={() => navigate('/dashboard/workflow/processus/creer')}
                          title="Modifier">✏️</button>
                        <button className="wfh-action-btn delete" title="Supprimer">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── LISTE ORCHESTRATEURS ─── */}
      {tab === 'orchestrators' && (
        <div className="wfh-section">
          <div className="wfh-search-bar">
            <input type="text" className="wfh-search" placeholder="🔍 Rechercher un orchestrateur..."
              value={searchOrch} onChange={e => setSearchOrch(e.target.value)} />
          </div>
          <div className="wfh-table-wrapper">
            <table className="wfh-table">
              <thead>
                <tr>
                  <th>Nom de l'Orchestrateur</th>
                  <th>Processus enchaînés</th>
                  <th>Déclencheurs</th>
                  <th>Auteur</th>
                  <th>Créé le</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrch.length === 0 ? (
                  <tr><td colSpan={7} className="wfh-no-data">Aucun orchestrateur trouvé</td></tr>
                ) : filteredOrch.map(w => (
                  <tr key={w.id}>
                    <td className="wfh-name-cell">{w.name}</td>
                    <td className="wfh-center">{w.processes}</td>
                    <td className="wfh-center">{w.triggers}</td>
                    <td>{w.author}</td>
                    <td>{w.createdAt}</td>
                    <td><Badge status={w.status} /></td>
                    <td>
                      <div className="wfh-row-actions">
                        <button className="wfh-action-btn edit"
                          onClick={() => navigate('/dashboard/workflow/orchestrateur/creer')}
                          title="Modifier">✏️</button>
                        <button className="wfh-action-btn delete" title="Supprimer">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowHistory;
