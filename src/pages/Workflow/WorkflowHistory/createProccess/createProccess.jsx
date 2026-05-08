import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoles } from '../../../../services/userService';
import { getCurrentUser } from '../../../../services/Authservice';
import { createProcess } from '../../../../services/workflowService';
import GeneralInfo from '../components/GeneralInfo';
import './createproccess.css';

/**
 * Composant de création d'un nouveau processus technique.
 */
const CreateProcess = () => {
    const navigate = useNavigate();

    // État local pour le formulaire
    const [processInfo, setProcessInfo] = useState({
        name: '',
        code: '',
        description: ''
    });
    const [isActive, setIsActive] = useState(true);
    const [selectedPlanning, setSelectedPlanning] = useState(null);

    // États pour gérer les phases
    const [isWorkflowCreated, setIsWorkflowCreated] = useState(false);
    const [workflowId, setWorkflowId] = useState(null);

    // Listes dynamiques pour les dropdowns
    const [availableStates, setAvailableStates] = useState([]);
    const [availableActions, setAvailableActions] = useState([]); // Sera rempli par les permissions des rôles
    const [dbRoles, setDbRoles] = useState([]); // Rôles venant de la BD

    // État pour les transitions
    const [transitions, setTransitions] = useState([]);

    // État pour les lignes de création temporaires (uniquement pour les États désormais)
    const [newItems, setNewItems] = useState([]);

    // Charger les rôles et extraire les permissions au montage
    useEffect(() => {
        const fetchData = async () => {
            try {
                const roles = await getRoles();
                setDbRoles(roles);

                // Extraction des permissions uniques de tous les rôles
                const permsMap = new Map(); // Utilisation d'une Map pour garantir l'unicité par Nom/Code
                
                roles.forEach(role => {
                    if (role.permissions && Array.isArray(role.permissions)) {
                        role.permissions.forEach(perm => {
                            const pName = typeof perm === 'object' ? (perm.nom || perm.code) : perm;
                            const pId = typeof perm === 'object' ? (perm.id || pName) : perm;
                            
                            if (pName && !permsMap.has(pName)) {
                                permsMap.set(pName, {
                                    id: pId,
                                    nom: pName,
                                    module: perm.module || 'Général'
                                });
                            }
                        });
                    }
                });
                
                // Conversion de la Map en tableau et tri par nom
                const uniquePerms = Array.from(permsMap.values()).sort((a, b) => a.nom.localeCompare(b.nom));
                setAvailableActions(uniquePerms);

            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            }
        };
        fetchData();
    }, []);

    // Ajouter une nouvelle ligne de transition
    const addTransition = () => {
        const lastTransition = transitions[transitions.length - 1];
        const newFrom = lastTransition ? lastTransition.to : '';
        
        setTransitions([...transitions, { 
            id: Date.now(), 
            from: newFrom, 
            action: '', 
            to: ''
        }]);
    };

    // Ajouter une ligne de création (État uniquement désormais)
    const addNewItemRow = (type) => {
        if (type !== 'state') return;
        setNewItems([...newItems, { id: Date.now(), type, value: '', is_terminal: false }]);
    };

    // Valider et ajouter l'item à la liste globale avec vérification d'unicité
    const confirmNewItem = (id, type, value, is_terminal) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;
        
        // Vérification d'unicité (Insensible à la casse)
        const isDuplicate = availableStates.some(
            item => item.name.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (isDuplicate) {
            alert(`Cet état existe déjà.`);
            return;
        }
        
        setAvailableStates(prev => [...prev, { name: trimmedValue, is_terminal }]);
        setNewItems(newItems.filter(item => item.id !== id));
    };

    const removeTransition = (id) => {
        setTransitions(transitions.filter(t => t.id !== id));
    };

    // Gérer le changement d'état avec validation d'unicité (from != to) et intégrité globale
    const handleTransitionStateChange = (id, field, value) => {
        setTransitions(transitions.map((t, index) => {
            if (t.id === id) {
                const otherField = field === 'from' ? 'to' : 'from';
                if (value !== '' && value === t[otherField]) {
                    alert("L'état initial et l'état final d'une même transition doivent être différents.");
                    return t;
                }

                const isFirstTransition = index === 0 && field === 'from';
                const isLastTransition = index === transitions.length - 1 && field === 'to';

                if (isFirstTransition && transitions.length > 1) {
                    const lastTo = transitions[transitions.length - 1].to;
                    if (value !== '' && value === lastTo) {
                        alert("Le premier état du processus et le dernier état ne peuvent pas être les mêmes.");
                        return t;
                    }
                }

                if (isLastTransition && transitions.length > 1) {
                    const firstFrom = transitions[0].from;
                    if (value !== '' && value === firstFrom) {
                        alert("Le dernier état du processus ne peut pas être identique au tout premier état (intégrité globale).");
                        return t;
                    }
                }

                return { ...t, [field]: value };
            }
            return t;
        }));
    };

    const handleCreateWorkflow = async () => {
        if (!processInfo.name || !processInfo.code) {
            alert("Veuillez saisir au moins le Nom et le Code.");
            return;
        }

        const payload = {
            nom: processInfo.name,
            code: processInfo.code,
            description: processInfo.description,
            is_active: isActive,
            planning_id: selectedPlanning
        };
        console.log("Appel API (Création Workflow) :", payload);

        // MOCK : Simuler le retour de l'API avec un ID
        setWorkflowId("mock-wf-id-1234");
        setIsWorkflowCreated(true);
    };

    const handleSave = async () => {
        if (!isWorkflowCreated) {
            await handleCreateWorkflow();
        } else {
            // L'utilisateur a fini la configuration
            navigate('/dashboard/workflow/historique');
        }
    };

    return (
        <div className="create-process-wrapper">
            <header className="process-header">
                <div>
                    <nav className="breadcrumb">
                        PROCESSUS <span className="separator">&gt;</span> <span className="active-path">NOUVEAU PROCESSUS</span>
                    </nav>
                    <h1 className="page-title">Créer un Nouveau processus</h1>
                    <p className="page-subtitle">Définissez la logique et les étapes de votre processus métier.</p>
                </div>
                
                <div className="actions-container">
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                        {isWorkflowCreated ? 'Terminer & Quitter' : 'Annuler'}
                    </button>
                    {!isWorkflowCreated && (
                        <button type="button" className="btn-primary" onClick={handleSave}>Créer</button>
                    )}
                </div>
            </header>

            <main className="process-content">
                <GeneralInfo 
                    type="Processus"
                    name={processInfo.name}
                    code={processInfo.code}
                    description={processInfo.description}
                    selectedPlanning={selectedPlanning}
                    onNameChange={(val) => setProcessInfo({...processInfo, name: val})}
                    onCodeChange={(val) => setProcessInfo({...processInfo, code: val})}
                    onDescriptionChange={(val) => setProcessInfo({...processInfo, description: val})}
                    onPlanningChange={setSelectedPlanning}
                    showIsActive={true}
                    isActive={isActive}
                    onIsActiveChange={setIsActive}
                    isReadOnly={isWorkflowCreated}
                />

                {!isWorkflowCreated && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                        <button type="button" className="btn-primary" onClick={handleCreateWorkflow} style={{ padding: '0.8rem 3rem', fontSize: '1rem' }}>
                            Créer le Workflow pour configurer les étapes
                        </button>
                    </div>
                )}

                {isWorkflowCreated && (
                    <>
                        <section className="info-card">
                            <div className="card-header flex-between">
                                <div className="header-left">
                                    <div className="status-icon-container transition-theme"><span className="material-symbols-outlined">account_tree</span></div>
                                    <div className="card-titles">
                                        <h2>Configuration des Transitions</h2>
                                        <p>Définissez les règles de passage d'un état à un autre.</p>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button type="button" className="btn-outline" onClick={() => addNewItemRow('state')}><span className="material-symbols-outlined">add_circle</span> État</button>
                                    <button type="button" className="btn-add-transition" onClick={addTransition}><span className="material-symbols-outlined">add_task</span> Transition</button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="transitions-table">
                                    <thead>
                                        <tr>
                                            <th>ÉTAT INITIAL</th>
                                            <th>OPTIONS (RETOUR / COMMENTAIRE)</th>
                                            <th>ÉTAT FINAL</th>
                                            <th className="text-right">ACTIONS</th>
                                        </tr>
                                    </thead>
                            <tbody>
                                {newItems.map((item) => (
                                    <tr key={item.id} className="creation-row">
                                        <td colSpan="3">
                                            <div className="creation-input-wrapper">
                                                <span className={`creation-badge ${item.type}`}>NOUVEL ÉTAT</span>
                                                <input 
                                                    autoFocus type="text" className="table-input" placeholder="Nom de l'état..."
                                                    value={item.value}
                                                    onChange={(e) => setNewItems(newItems.map(i => i.id === item.id ? {...i, value: e.target.value} : i))}
                                                    onKeyPress={(e) => e.key === 'Enter' && confirmNewItem(item.id, item.type, item.value, item.is_terminal)}
                                                />
                                                <label style={{display: 'flex', alignItems: 'center', fontSize: '0.8rem', gap: '5px', whiteSpace: 'nowrap'}}>
                                                    <input type="checkbox" checked={item.is_terminal || false} onChange={(e) => setNewItems(newItems.map(i => i.id === item.id ? {...i, is_terminal: e.target.checked} : i))} />
                                                    Étape terminale
                                                </label>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <button className="btn-confirm" onClick={() => confirmNewItem(item.id, item.type, item.value, item.is_terminal)}><span className="material-symbols-outlined">check_circle</span></button>
                                            <button className="btn-cancel" onClick={() => setNewItems(newItems.filter(i => i.id !== item.id))}><span className="material-symbols-outlined">cancel</span></button>
                                        </td>
                                    </tr>
                                ))}

                                {transitions.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            <select 
                                                className="table-select" 
                                                value={t.from} 
                                                onChange={(e) => handleTransitionStateChange(t.id, 'from', e.target.value)}
                                            >
                                                <option value="">Sélectionner</option>
                                                {availableStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem'}}>
                                                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                    <input type="checkbox" checked={t.can_go_back || false} onChange={(e) => setTransitions(transitions.map(tr => tr.id === t.id ? {...tr, can_go_back: e.target.checked} : tr))} />
                                                    Retour en arrière autorisé
                                                </label>
                                                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                    <input type="checkbox" checked={t.comment_required || false} onChange={(e) => setTransitions(transitions.map(tr => tr.id === t.id ? {...tr, comment_required: e.target.checked} : tr))} />
                                                    Commentaire requis
                                                </label>
                                            </div>
                                            <div style={{marginTop: '10px'}}>
                                                <strong style={{fontSize: '0.75rem', display: 'block', marginBottom: '5px', color: '#939597'}}>RÔLES AUTORISÉS</strong>
                                                <div className="roles-chips-container" style={{marginBottom: '5px'}}>
                                                    {(t.roles || []).map(roleId => {
                                                        const r = dbRoles.find(dbR => dbR.id === roleId);
                                                        return r ? (
                                                            <span key={roleId} className="role-chip">
                                                                {r.nom}
                                                                <span className="material-symbols-outlined remove-chip" onClick={() => {
                                                                    setTransitions(transitions.map(tr => tr.id === t.id ? {...tr, roles: tr.roles.filter(id => id !== roleId)} : tr));
                                                                }}>close</span>
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                                <select 
                                                    className="table-select" 
                                                    style={{fontSize: '0.8rem', padding: '4px'}}
                                                    onChange={(e) => {
                                                        const rId = parseInt(e.target.value);
                                                        if (!rId) return;
                                                        setTransitions(transitions.map(tr => tr.id === t.id ? {...tr, roles: [...(tr.roles || []), rId]} : tr));
                                                        e.target.value = "";
                                                    }}
                                                >
                                                    <option value="">+ Ajouter un rôle</option>
                                                    {dbRoles.filter(r => !(t.roles || []).includes(r.id)).map(r => (
                                                        <option key={r.id} value={r.id}>{r.nom}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            <select 
                                                className="table-select" 
                                                value={t.to} 
                                                onChange={(e) => handleTransitionStateChange(t.id, 'to', e.target.value)}
                                            >
                                                <option value="">Sélectionner</option>
                                                {availableStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-right">
                                            <button type="button" className="btn-delete-row" onClick={() => removeTransition(t.id)}><span className="material-symbols-outlined">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transitions.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#939597' }}>Cliquez sur "Transition" pour commencer à définir votre flux.</p>}
                    </div>
                </section>

                <section className="info-card no-margin-bottom">
                    <div className="card-header flex-between mb-lg">
                        <div className="header-left">
                            <div className="status-icon-container preview-theme"><span className="material-symbols-outlined">visibility</span></div>
                            <div className="card-titles">
                                <h2>Visualisation en temps réel</h2>
                                <p>Visualisez le parcours de votre processus métier.</p>
                            </div>
                        </div>
                    </div>

                    <div className="visualizer-canvas">
                        <div className="canvas-grid"></div>
                        <div className="nodes-container">
                            {transitions.map((t, index) => (
                                <React.Fragment key={t.id}>
                                    <div className="node-group">
                                        <span className="node-label">{index === 0 ? 'INITIAL' : 'ÉTAT'}</span>
                                        <div className="process-node node-standard">
                                            {t.from || ''}
                                        </div>
                                    </div>
                                    <div className="connector">
                                        <div className="connector-line"></div>
                                        <div className="connector-action">{t.action || ''}</div>
                                    </div>
                                    {index === transitions.length - 1 && (
                                        <div className="node-group">
                                            <span className="node-label success">FINAL</span>
                                            <div className="process-node node-success">
                                                {t.to || ''}
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </section>
                </>
                )}
            </main>
        </div>
    );
};

export default CreateProcess;
