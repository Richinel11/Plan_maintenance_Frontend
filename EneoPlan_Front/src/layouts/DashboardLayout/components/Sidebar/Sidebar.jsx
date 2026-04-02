import React from 'react';
import { NavLink } from 'react-router-dom';
import { menuConfig } from '../../../../config/menus';
import './Sidebar.css';

/**
 * Composant Sidebar strict
 * Il se contente d'afficher le menu et ne gère aucune logique lourde. 
 * Scalabilité maximale.
 */
const Sidebar = () => {
    // 1. Récupération des informations de l'utilisateur stockées en session
    const userString = sessionStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { nom: 'Utilisateur', prenom: '' };
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur Anonyme';

    // 2. Détermination du rôle actif pour savoir quels menus afficher
    const activeRoleCode = sessionStorage.getItem('activeRole');
    
    // 3. Extraction des menus correspondants (tableau vide si aucun match)
    const dynamicLinks = menuConfig[activeRoleCode] || [];

    return (
        <aside className="sidebar">
            {/* Logo de l'application */}
            <div className="sidebar-brand">
                <img src="/Group 1.png" alt="ENEOPLAN" className="brand-logo" />
            </div>
            
            {/* Navigation Dynamique */}
            <nav className="sidebar-nav">
                {/* 1. L'accueil est toujours présent pour tout le monde */}
                <NavLink to="/dashboard/home" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="material-symbols-outlined nav-icon">dashboard</span>
                    Accueil
                </NavLink>

                {/* 2. On boucle intelligemment sur les menus récupérés depuis le fichier de config */}
                {dynamicLinks.map((link, index) => (
                    <NavLink key={index} to={link.path} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                        <span className="material-symbols-outlined nav-icon">{link.icon}</span>
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            {/* Profil dynamique de l'utilisateur branché au backend */}
            <div className="sidebar-footer-profile">
                {/* Petit avatar généré automatiquement selon le nom */}
                <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1B75BB&color=fff`} 
                    alt="Avatar" 
                    className="sidebar-avatar" 
                />
                <div className="sidebar-user-info">
                    <span className="sidebar-user-name">{fullName}</span>
                    <span className="sidebar-user-role">{activeRoleCode || 'Aucun rôle'}</span>
                </div>
                <span className="material-symbols-outlined sidebar-chevron">expand_more</span>
            </div>
        </aside>
    );
};

export default Sidebar;
