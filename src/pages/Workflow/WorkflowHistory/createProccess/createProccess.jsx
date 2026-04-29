import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoles } from '../../../../services/userService';
import './createProccess.css';

/**
 * Composant de création d'un nouveau processus technique.
 */
const CreateProcess = () => {
    const navigate = useNavigate();

    // État local pour le formulaire
    const [processInfo, setProcessInfo] = useState({
        name: '',
        description: ''
    });

    // Listes dynamiques pour les dropdowns
    const [availableStates, setAvailableStates] = useState([]);
    const [availableActions, setAvailableActions] = useState([]); // Sera rempli par les permissions des rôles
    const [dbRoles, setDbRoles] = useState([]); // Rôles venant de la BD

    // État pour les transitions
    const [transitions, setTransitions] = useState([]);

    // État pour les lignes de création temporaires (uniquement pour les États désormais)
    const [newItems, setNewItems] = useState([]);
    
    // État pour gérer quel sélecteur de rôle est ouvert
    const [activeRolePicker, setActiveRolePicker] = useState(null);

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
            to: '', 
            roles: [] 
        }]);
    };

    // Ajouter/Retirer un rôle à une transition
    const toggleRoleToTransition = (transitionId, roleName) => {
        setTransitions(transitions.map(t => {
            if (t.id === transitionId) {
                const hasRole = t.roles.includes(roleName);
                const newRoles = hasRole 
                    ? t.roles.filter(r => r !== roleName)
                    : [...t.roles, roleName];
                return { ...t, roles: newRoles };
            }
            return t;
        }));
    };

    // Ajouter une ligne de création (État uniquement désormais)
    const addNewItemRow = (type) => {
        if (type !== 'state') return;
        setNewItems([...newItems, { id: Date.now(), type, value: '' }]);
    };

    // Valider et ajouter l'item à la liste globale avec vérification d'unicité
    const confirmNewItem = (id, type, value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;
        
        // Vérification d'unicité (Insensible à la casse)
        const isDuplicate = availableStates.some(
            item => item.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (isDuplicate) {
            alert(`Cet état existe déjà.`);
            return;
        }
        
        setAvailableStates(prev => [...prev, trimmedValue]);
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

    const handleSave = () => {
        console.log("Données sauvegardées :", { processInfo, transitions });
    };

    return (
        <div className="create-process-wrapper">
            <header className="process-header">
                <div className="titles-container">
                    <nav className="breadcrumb">
                        PROCESSUS <span className="separator">&gt;</span> <span className="active-path">NOUVEAU PROCESSUS</span>
                    </nav>
                    <h1 className="page-title">Créer un Nouveau processus</h1>
                    <p className="page-subtitle">Définissez la logique et les étapes de votre processus métier.</p>
                </div>
                
                <div className="actions-container">
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Annuler</button>
                    <button type="button" className="btn-primary" onClick={handleSave}>Enregistrer</button>
                </div>
            </header>

            <main className="process-content">
                <section className="info-card">
                    <div className="card-header">
                        <div className="status-icon-container info-theme"><span className="material-symbols-outlined">info</span></div>
                        <div className="card-titles">
                            <h2>Informations Générales</h2>
                            <p>Nommez et décrivez l'usage de ce processus.</p>
                        </div>
                    </div>

                    <div className="form-container">
                        <div className="input-group">
                            <label className="field-label">NOM DU PROCESSUS <span className="required-star">*</span></label>
                            <input 
                                type="text" className="form-input" placeholder="Ex: Validation de Factures"
                                value={processInfo.name} onChange={(e) => setProcessInfo({...processInfo, name: e.target.value})}
                            />
                        </div>
                        <div className="input-group full-width">
                            <label className="field-label">DESCRIPTION DÉTAILLÉE</label>
                            <textarea 
                                className="form-textarea" rows="3" placeholder="Décrivez les objectifs..."
                                value={processInfo.description} onChange={(e) => setProcessInfo({...processInfo, description: e.target.value})}
                            ></textarea>
                        </div>
                    </div>
                </section>

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
                                    <th>ACTION (PERMISSION)</th>
                                    <th>ÉTAT FINAL</th>
                                    <th>RÔLES AUTORISÉS</th>
                                    <th className="text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newItems.map((item) => (
                                    <tr key={item.id} className="creation-row">
                                        <td colSpan="4">
                                            <div className="creation-input-wrapper">
                                                <span className={`creation-badge ${item.type}`}>NOUVEL ÉTAT</span>
                                                <input 
                                                    autoFocus type="text" className="table-input" placeholder="Nom de l'état..."
                                                    value={item.value}
                                                    onChange={(e) => setNewItems(newItems.map(i => i.id === item.id ? {...i, value: e.target.value} : i))}
                                                    onKeyPress={(e) => e.key === 'Enter' && confirmNewItem(item.id, item.type, item.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <button className="btn-confirm" onClick={() => confirmNewItem(item.id, item.type, item.value)}><span className="material-symbols-outlined">check_circle</span></button>
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
                                                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <select 
                                                className="table-select" 
                                                value={t.action} 
                                                onChange={(e) => setTransitions(transitions.map(tr => tr.id === t.id ? {...tr, action: e.target.value} : tr))}
                                            >
                                                <option value="">Choisir une permission</option>
                                                {availableActions.map(perm => {
                                                    const permName = typeof perm === 'object' ? (perm.nom || perm.code) : perm;
                                                    const permId = typeof perm === 'object' ? perm.id : perm;
                                                    return <option key={permId} value={permName}>{permName}</option>;
                                                })}
                                            </select>
                                        </td>
                                        <td>
                                            <select 
                                                className="table-select" 
                                                value={t.to} 
                                                onChange={(e) => handleTransitionStateChange(t.id, 'to', e.target.value)}
                                            >
                                                <option value="">Sélectionner</option>
                                                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <div className="roles-chips-container">
                                                {t.roles.map((role, i) => (
                                                    <span key={i} className="role-chip">
                                                        {role}
                                                        <span className="material-symbols-outlined remove-chip" onClick={() => toggleRoleToTransition(t.id, role)}>close</span>
                                                    </span>
                                                ))}
                                                <div className="role-picker-wrapper">
                                                    <button type="button" className="btn-add-role" onClick={() => setActiveRolePicker(activeRolePicker === t.id ? null : t.id)}>+ Rôle</button>
                                                    {activeRolePicker === t.id && (
                                                        <div className="role-picker-dropdown">
                                                            {dbRoles.length > 0 ? (
                                                                dbRoles.map(role => (
                                                                    <div key={role.id} className={`role-option ${t.roles.includes(role.nom) ? 'selected' : ''}`} onClick={() => toggleRoleToTransition(t.id, role.nom)}>
                                                                        <span className="material-symbols-outlined">{t.roles.includes(role.nom) ? 'check_box' : 'check_box_outline_blank'}</span>
                                                                        {role.nom}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="no-role">Aucun rôle trouvé</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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
            </main>
        </div>
    );
};

export default CreateProcess;
