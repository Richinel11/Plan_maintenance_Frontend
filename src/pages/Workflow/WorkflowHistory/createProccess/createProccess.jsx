import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoles } from '../../../../services/userService';
import { createStep, createTransition } from '../../../../services/workflowService';
import GeneralInfo from '../components/GeneralInfo';
import './createproccess.css';

/**
 * Composant de création d'un nouveau processus / workflow.
 * Phase 1 : Remplir les infos générales et créer la coquille.
 * Phase 2 : Ajouter des états (Steps) et des transitions directement liés au workflow créé.
 */
const CreateProcess = () => {
    const navigate = useNavigate();

    // --- Phase 1 : Informations générales ---
    const [processInfo, setProcessInfo] = useState({ name: '', code: '', description: '' });
    const [isActive, setIsActive] = useState(true);
    const [selectedPlanning, setSelectedPlanning] = useState(null);
    const [isWorkflowCreated, setIsWorkflowCreated] = useState(false);
    const [workflowId, setWorkflowId] = useState(null);

    // --- Phase 2 : États (Steps) ---
    const [availableStates, setAvailableStates] = useState([]);
    const [showStepModal, setShowStepModal] = useState(false);
    const [stepForm, setStepForm] = useState({ nom: '', code: '', number: '', description: '', is_terminal: false });
    const [isSavingStep, setIsSavingStep] = useState(false);

    // --- Phase 2 : Transitions ---
    const [transitions, setTransitions] = useState([]);
    const [dbRoles, setDbRoles] = useState([]);

    // Charger les rôles au montage
    useEffect(() => {
        const fetchData = async () => {
            try {
                const roles = await getRoles();
                setDbRoles(roles);
            } catch (error) {
                console.error("Erreur lors de la récupération des rôles :", error);
            }
        };
        fetchData();
    }, []);

    // =====================================================================
    // PHASE 1 — Création du workflow
    // =====================================================================
    const handleCreateWorkflow = async () => {
        if (!processInfo.name || !processInfo.code) {
            alert("Veuillez saisir au moins le Nom et le Code.");
            return;
        }
        const payload = {
            name: processInfo.name,
            code: processInfo.code,
            description: processInfo.description,
            is_active: isActive,
            planning_id: selectedPlanning || null
        };
        console.log("📡 [API MOCK] POST /pilotage/workflows/ →", payload);
        // MOCK : Simuler le retour de l'API avec un ID généré
        const mockId = `wf-${Date.now()}`;
        setWorkflowId(mockId);
        setIsWorkflowCreated(true);
    };

    // =====================================================================
    // PHASE 2 — Gestion des États (Steps) via Modale
    // =====================================================================
    const openStepModal = () => {
        setStepForm({ nom: '', code: '', number: availableStates.length + 1, description: '', is_terminal: false });
        setShowStepModal(true);
    };

    const closeStepModal = () => {
        setShowStepModal(false);
    };

    const handleSaveStep = async () => {
        if (!stepForm.nom.trim() || !stepForm.code.trim()) {
            alert("Le Nom et le Code de l'état sont obligatoires.");
            return;
        }
        const isDuplicate = availableStates.some(
            s => s.code.toLowerCase() === stepForm.code.trim().toLowerCase()
        );
        if (isDuplicate) {
            alert("Un état avec ce code existe déjà.");
            return;
        }

        const payload = {
            workflow: workflowId,
            name: stepForm.nom.trim(),
            code: stepForm.code.trim(),
            number: parseInt(stepForm.number) || availableStates.length + 1,
            description: stepForm.description.trim(),
            is_terminal: stepForm.is_terminal
        };
        console.log("📡 [API MOCK] POST /pilotage/steps/ →", payload);
        setIsSavingStep(true);

        // MOCK : Simuler la réponse API
        await new Promise(r => setTimeout(r, 400));
        const savedStep = { ...payload, id: `step-${Date.now()}` };
        setAvailableStates(prev => [...prev, savedStep]);
        setIsSavingStep(false);
        closeStepModal();
    };

    // =====================================================================
    // PHASE 2 — Gestion des Transitions
    // =====================================================================
    const addTransition = () => {
        const lastTransition = transitions[transitions.length - 1];
        const newFrom = lastTransition ? lastTransition.to : '';
        setTransitions([...transitions, {
            id: Date.now(),
            nom: '',
            from: newFrom,
            to: '',
            can_go_back: false,
            comment_required: false,
            roles: []
        }]);
    };

    const updateTransition = (id, field, value) => {
        setTransitions(transitions.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSaveTransition = async (t) => {
        if (!t.from || !t.to || !t.nom.trim()) {
            alert("Le Nom, l'État initial et l'État final sont obligatoires.");
            return;
        }
        const payload = {
            workflow: workflowId,
            name: t.nom,
            from_step: t.from,
            to_step: t.to,
            can_go_back: t.can_go_back,
            comment_required: t.comment_required,
            roles: t.roles
        };
        console.log("📡 [API MOCK] POST /pilotage/transitions/ →", payload);
        // MOCK : Marquer la transition comme sauvegardée
        setTransitions(transitions.map(tr =>
            tr.id === t.id ? { ...tr, saved: true } : tr
        ));
    };

    const removeTransition = (id) => {
        setTransitions(transitions.filter(t => t.id !== id));
    };

    // =====================================================================
    // RENDU
    // =====================================================================
    return (
        <>
            {/* ── MODALE CRÉATION D'UN ÉTAT ─────────────────────────────────── */}
            {showStepModal && (
                <div className="cp-modal-overlay" onClick={closeStepModal}>
                    <div className="cp-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="cp-modal-header">
                            <div className="cp-modal-title-group">
                                <span className="material-symbols-outlined">radio_button_checked</span>
                                <h3>Nouvel État</h3>
                            </div>
                            <button className="cp-modal-close" onClick={closeStepModal}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="cp-modal-body">
                            <div className="cp-modal-row">
                                <div className="cp-modal-field">
                                    <label>NOM <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ex : En attente de validation"
                                        value={stepForm.nom}
                                        onChange={e => setStepForm({ ...stepForm, nom: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="cp-modal-field cp-modal-field--sm">
                                    <label>CODE <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ex : EN_ATTENTE"
                                        value={stepForm.code}
                                        onChange={e => setStepForm({ ...stepForm, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                                    />
                                </div>
                                <div className="cp-modal-field cp-modal-field--xs">
                                    <label>N°</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="1"
                                        value={stepForm.number}
                                        onChange={e => setStepForm({ ...stepForm, number: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="cp-modal-field">
                                <label>DESCRIPTION</label>
                                <textarea
                                    className="form-textarea"
                                    rows="2"
                                    placeholder="Décrivez cet état..."
                                    value={stepForm.description}
                                    onChange={e => setStepForm({ ...stepForm, description: e.target.value })}
                                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </div>

                            <label className="cp-modal-checkbox">
                                <input
                                    type="checkbox"
                                    checked={stepForm.is_terminal}
                                    onChange={e => setStepForm({ ...stepForm, is_terminal: e.target.checked })}
                                />
                                <span>Étape terminale (état final du processus)</span>
                            </label>
                        </div>

                        <div className="cp-modal-footer">
                            <button className="btn-secondary" onClick={closeStepModal} disabled={isSavingStep}>
                                Annuler
                            </button>
                            <button className="btn-primary" onClick={handleSaveStep} disabled={isSavingStep}>
                                {isSavingStep ? (
                                    <><span className="material-symbols-outlined spinning">progress_activity</span> Enregistrement...</>
                                ) : (
                                    <><span className="material-symbols-outlined">check</span> Créer l'état</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PAGE PRINCIPALE ──────────────────────────────────────────── */}
            <div className="create-process-wrapper">
                <header className="process-header">
                    <div>
                        <nav className="breadcrumb">
                            WORKFLOW <span className="separator">&gt;</span>
                            <span className="active-path">
                                {isWorkflowCreated ? processInfo.name.toUpperCase() : 'NOUVEAU WORKFLOW'}
                            </span>
                        </nav>
                        <h1 className="page-title">
                            {isWorkflowCreated ? `Configuration : ${processInfo.name}` : 'Créer un Nouveau Workflow'}
                        </h1>
                        <p className="page-subtitle">
                            {isWorkflowCreated
                                ? `ID : ${workflowId} — Ajoutez des états et des transitions pour définir le flux.`
                                : 'Remplissez les informations générales pour initialiser le workflow.'}
                        </p>
                    </div>
                    <div className="actions-container">
                        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                            {isWorkflowCreated ? 'Terminer & Quitter' : 'Annuler'}
                        </button>
                        {!isWorkflowCreated && (
                            <button type="button" className="btn-primary" onClick={handleCreateWorkflow}>
                                <span className="material-symbols-outlined">rocket_launch</span>
                                Créer
                            </button>
                        )}
                    </div>
                </header>

                <main className="process-content">
                    {/* Bloc Informations Générales */}
                    <GeneralInfo
                        type="Processus"
                        name={processInfo.name}
                        code={processInfo.code}
                        description={processInfo.description}
                        selectedPlanning={selectedPlanning}
                        onNameChange={val => setProcessInfo({ ...processInfo, name: val })}
                        onCodeChange={val => setProcessInfo({ ...processInfo, code: val })}
                        onDescriptionChange={val => setProcessInfo({ ...processInfo, description: val })}
                        onPlanningChange={setSelectedPlanning}
                        showIsActive={true}
                        isActive={isActive}
                        onIsActiveChange={setIsActive}
                        isReadOnly={isWorkflowCreated}
                    />

                    {/* Bouton de création visible seulement avant la Phase 2 */}
                    {!isWorkflowCreated && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                            <button type="button" className="btn-primary" onClick={handleCreateWorkflow}
                                style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', gap: '8px' }}>
                                <span className="material-symbols-outlined">rocket_launch</span>
                                Créer et configurer les étapes
                            </button>
                        </div>
                    )}

                    {/* ─── PHASE 2 : Configuration ─────────────────────────────── */}
                    {isWorkflowCreated && (
                        <>
                            {/* Résumé des états créés */}
                            <section className="info-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="card-header flex-between">
                                    <div className="header-left">
                                        <div className="status-icon-container info-theme">
                                            <span className="material-symbols-outlined">radio_button_checked</span>
                                        </div>
                                        <div className="card-titles">
                                            <h2>États du Workflow</h2>
                                            <p>{availableStates.length} état(s) défini(s)</p>
                                        </div>
                                    </div>
                                    <div className="header-actions">
                                        <button type="button" className="btn-outline" onClick={openStepModal}>
                                            <span className="material-symbols-outlined">add_circle</span> Nouvel État
                                        </button>
                                    </div>
                                </div>

                                {availableStates.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#939597' }}>
                                        Aucun état défini. Cliquez sur "Nouvel État" pour commencer.
                                    </p>
                                ) : (
                                    <div className="cp-states-list">
                                        {availableStates.map((s, i) => (
                                            <div key={s.id} className={`cp-state-chip ${s.is_terminal ? 'terminal' : ''}`}>
                                                <span className="cp-state-num">{s.number}</span>
                                                <div className="cp-state-info">
                                                    <strong>{s.name}</strong>
                                                    <code>{s.code}</code>
                                                </div>
                                                {s.is_terminal && (
                                                    <span className="cp-state-badge terminal">FINAL</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Table des Transitions */}
                            <section className="info-card no-margin-bottom">
                                <div className="card-header flex-between">
                                    <div className="header-left">
                                        <div className="status-icon-container transition-theme">
                                            <span className="material-symbols-outlined">account_tree</span>
                                        </div>
                                        <div className="card-titles">
                                            <h2>Transitions</h2>
                                            <p>Définissez les règles de passage d'un état à un autre.</p>
                                        </div>
                                    </div>
                                    <div className="header-actions">
                                        <button type="button" className="btn-add-transition" onClick={addTransition}
                                            disabled={availableStates.length < 2}
                                            title={availableStates.length < 2 ? "Créez au moins 2 états pour ajouter une transition" : ""}>
                                            <span className="material-symbols-outlined">add_task</span> Transition
                                        </button>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="transitions-table">
                                        <thead>
                                            <tr>
                                                <th>NOM</th>
                                                <th>ÉTAT INITIAL</th>
                                                <th>VALIDATION (RÔLES)</th>
                                                <th>ÉTAT FINAL</th>
                                                <th>OPTIONS</th>
                                                <th className="text-right">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transitions.map(t => (
                                                <tr key={t.id} className={t.saved ? 'row-saved' : ''}>
                                                    {/* Nom */}
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="table-input"
                                                            placeholder="Ex : Soumettre"
                                                            value={t.nom}
                                                            onChange={e => updateTransition(t.id, 'nom', e.target.value)}
                                                            disabled={t.saved}
                                                        />
                                                    </td>

                                                    {/* État Initial */}
                                                    <td>
                                                        <select
                                                            className="table-select"
                                                            value={t.from}
                                                            onChange={e => updateTransition(t.id, 'from', e.target.value)}
                                                            disabled={t.saved}
                                                        >
                                                            <option value="">Sélectionner</option>
                                                            {availableStates.map(s => (
                                                                <option key={s.id} value={s.code}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    {/* Validation — Rôles */}
                                                    <td>
                                                        <div className="cp-roles-cell">
                                                            <div className="cp-roles-chips">
                                                                {(t.roles || []).map(roleId => {
                                                                    const r = dbRoles.find(dbR => dbR.id === roleId);
                                                                    return r ? (
                                                                        <span key={roleId} className="cp-role-chip">
                                                                            {r.nom}
                                                                            {!t.saved && (
                                                                                <span
                                                                                    className="material-symbols-outlined cp-chip-remove"
                                                                                    onClick={() => updateTransition(t.id, 'roles', t.roles.filter(id => id !== roleId))}
                                                                                >close</span>
                                                                            )}
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                            {!t.saved && (
                                                                <select
                                                                    className="table-select cp-roles-select"
                                                                    value=""
                                                                    onChange={e => {
                                                                        const rId = parseInt(e.target.value);
                                                                        if (!rId) return;
                                                                        updateTransition(t.id, 'roles', [...(t.roles || []), rId]);
                                                                    }}
                                                                >
                                                                    <option value="">+ Ajouter un rôle</option>
                                                                    {dbRoles
                                                                        .filter(r => !(t.roles || []).includes(r.id))
                                                                        .map(r => (
                                                                            <option key={r.id} value={r.id}>{r.nom}</option>
                                                                        ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* État Final */}
                                                    <td>
                                                        <select
                                                            className="table-select"
                                                            value={t.to}
                                                            onChange={e => updateTransition(t.id, 'to', e.target.value)}
                                                            disabled={t.saved}
                                                        >
                                                            <option value="">Sélectionner</option>
                                                            {availableStates
                                                                .filter(s => s.code !== t.from)
                                                                .map(s => (
                                                                    <option key={s.id} value={s.code}>{s.name}</option>
                                                                ))}
                                                        </select>
                                                    </td>

                                                    {/* Options */}
                                                    <td>
                                                        <div className="cp-transition-options">
                                                            <label className="cp-option-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={t.can_go_back}
                                                                    onChange={e => updateTransition(t.id, 'can_go_back', e.target.checked)}
                                                                    disabled={t.saved}
                                                                />
                                                                <span>Retour arrière</span>
                                                            </label>
                                                            <label className="cp-option-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={t.comment_required}
                                                                    onChange={e => updateTransition(t.id, 'comment_required', e.target.checked)}
                                                                    disabled={t.saved}
                                                                />
                                                                <span>Commentaire requis</span>
                                                            </label>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="text-right">
                                                        {t.saved ? (
                                                            <span className="cp-saved-badge">
                                                                <span className="material-symbols-outlined">check_circle</span> Sauvegardé
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn-confirm"
                                                                    onClick={() => handleSaveTransition(t)}
                                                                    title="Enregistrer cette transition"
                                                                >
                                                                    <span className="material-symbols-outlined">save</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn-cancel"
                                                                    onClick={() => removeTransition(t.id)}
                                                                    title="Supprimer"
                                                                >
                                                                    <span className="material-symbols-outlined">delete</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {transitions.length === 0 && availableStates.length >= 2 && (
                                        <p style={{ textAlign: 'center', padding: '20px', color: '#939597' }}>
                                            Cliquez sur "+ Transition" pour commencer à définir votre flux.
                                        </p>
                                    )}
                                    {availableStates.length < 2 && (
                                        <p style={{ textAlign: 'center', padding: '20px', color: '#f59e0b' }}>
                                            ⚠️ Créez au moins <strong>2 états</strong> avant de pouvoir ajouter des transitions.
                                        </p>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </>
    );
};

export default CreateProcess;
