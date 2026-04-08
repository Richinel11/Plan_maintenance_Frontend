import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/authService';
import './SelectRole.css';

// Ces données servent juste de fallback pour l'icône si on reconnaît le code_role
const staticRolesFallback = {
    'op_saisie': { icon: 'edit_square' },
    'gest_planif': { icon: 'calendar_month' },
    'resp_exploit': { icon: 'settings' },
    'ccr': { icon: 'hub' },
    'eq_comm': { icon: 'campaign' },
    'reg_audit': { icon: 'fact_check' }
};

const SelectRole = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();

    // 1. On lit les données utilisateur que le backend nous a envoyées via la connexion
    const userString = sessionStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    // 2. On récupère la liste des rôles de l'utilisateur. 
    // On supporte si le backend renvoie 'role' (un seul) ou 'roles' (plusieurs plus tard)
    const allowedRolesList = user?.roles ? user.roles : (user?.role ? [user.role] : []);

    // 3. Auto-sélection : si l'utilisateur n'a accès qu'à 1 SEUL rôle, on le sélectionne automatiquement
    useEffect(() => {
        if (allowedRolesList.length === 1 && !selectedRole) {
            const r = allowedRolesList[0];
            setSelectedRole(r.code_role || r.code || r.nom || r.id);
        }
    }, [allowedRolesList, selectedRole]);

    const handleContinue = () => {
        if (selectedRole) {
            // On sauvegarde le rôle choisi comme "Rôle Actif" pour le Dashboard
            sessionStorage.setItem('activeRole', selectedRole);
            navigate('/dashboard/home');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Si l'utilisateur n'a aucun rôle (ça ne devrait pas arriver d'après le modèle, mais on gère l'erreur)
    if (allowedRolesList.length === 0) {
        return (
            <div className="select-role-page">
                <div className="top-logo-container">
                    <img src="/Group 1.png" alt="EneoPlan" className="top-logo-img" />
                </div>
                <div className="select-role-header" style={{ marginTop: '100px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'red' }}>error</span>
                    <h1 className="welcome-title" style={{ marginTop: '20px' }}>Erreur de configuration</h1>
                    <p className="welcome-subtitle" style={{ color: 'red', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
                        Aucun rôle n'est assigné à votre compte. Vous ne pouvez pas accéder à l'application. 
                        Veuillez contacter l'administrateur système pour associer un rôle à l'utilisateur {user?.username}.
                    </p>
                    <button className="submit-btn" style={{ marginTop: '30px', maxWidth: '200px' }} onClick={handleLogout}>
                        RETOUR À LA CONNEXION
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="select-role-page">
            <div className="top-logo-container">
                <img src="/Group 1.png" alt="EneoPlan" className="top-logo-img" />
            </div>
            <div className="select-role-header">
                <div className="avatar-wrapper">
                    <span className="status-dot avatar-status"></span>
                </div>
                <h1 className="welcome-title">Bonjour{user?.nom ? `, ${user.prenom} ${user.nom}` : ''}</h1>
                <p className="welcome-subtitle">Sélectionnez votre rôle pour cette session</p>
            </div>

            <div className="roles-grid">
                {allowedRolesList.map(role => {
                    // On utilise le code_role s'il existe, sinon le code, le nom ou l'id
                    const roleIdentifier = role.code_role || role.code || role.nom || role.id;
                    const fallback = staticRolesFallback[roleIdentifier] || { icon: 'person' };
                    
                    return (
                        <div 
                            key={roleIdentifier} 
                            className={`role-card ${selectedRole === roleIdentifier ? 'selected' : ''}`}
                            onClick={() => setSelectedRole(roleIdentifier)}
                            style={{ 
                                cursor: 'pointer',
                                border: selectedRole !== roleIdentifier ? '1px solid transparent' : '1px solid #1B75BB'
                            }}
                        >
                            {selectedRole === roleIdentifier && (
                                <div className="selected-badge">
                                    <span className="material-symbols-outlined badge-icon">check</span>
                                </div>
                            )}
                            <div className="role-icon-wrapper">
                                <span className="material-symbols-outlined role-icon">{fallback.icon}</span>
                            </div>
                            <h3 className="role-title">{role.nom}</h3>
                            <p className="role-description">
                                {role.description || "Aucune description fournie."}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="action-footer">
                <button className="secondary-btn" onClick={handleLogout} style={{ marginRight: '15px' }}>
                    Déconnexion
                </button>
                <button 
                    className={`continue-btn ${!selectedRole ? 'disabled' : ''}`}
                    onClick={handleContinue}
                    disabled={!selectedRole}
                >
                    Continuer
                    <span className="material-symbols-outlined btn-arrow">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default SelectRole;
