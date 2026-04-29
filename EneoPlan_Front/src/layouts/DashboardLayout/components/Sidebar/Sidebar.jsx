import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { menuConfig } from '../../../../config/menus';
import Cookies from 'js-cookie';
import './Sidebar.css';

/**
 * Composant Sidebar strict
 * Il se contente d'afficher le menu et ne gère aucune logique lourde. 
 * Scalabilité maximale.
 */
const Sidebar = () => {
    // 1. Récupération des informations de l'utilisateur stockées en session
    const userString = Cookies.get('user');
    const user = userString ? JSON.parse(userString) : { nom: 'Utilisateur', prenom: '' };
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur Anonyme';

    // 2. Détermination du rôle actif pour savoir quels menus afficher
    // On utilise le NOM du rôle (stable) plutôt que le CODE (instable ex: op1, Ad1...)
    // Le nom est normalisé : "operateur de saisie" → "operateur_de_saisie" → clé dans menus.js
    const activeRoleCode = Cookies.get('activeRole');     // Gardé uniquement pour l'affichage footer
    const activeRoleName = Cookies.get('activeRoleName'); // Source principale pour le menu

    let dynamicLinks = [];
    if (activeRoleName) {
        const menuKey = activeRoleName.toLowerCase().replace(/\s+/g, '_');
        dynamicLinks = menuConfig[menuKey] || [];
    }

    // 3. État pour gérer l'ouverture des sous-menus (ex: Workflow)
    const [openMenus, setOpenMenus] = useState({});
    const toggleMenu = (name) => setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));

    return (
        <aside className="sidebar">
            {/* Logo de l'application */}
            <div className="sidebar-brand">
                <img src="/Group 1.png" alt="ENEOPLAN" className="brand-logo" />
            </div>
            
            {/* Navigation Dynamique */}
            <nav className="sidebar-nav">
                {/* 1. L'accueil est toujours présent pour tout le monde */}
                {/* <NavLink to="/dashboard/OP-home" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="material-symbols-outlined nav-icon">dashboard</span>
                    Accueil
                </NavLink> */}

                {/* 2. On boucle intelligemment sur les menus récupérés depuis le fichier de config */}
                {dynamicLinks.map((link, index) => {
                    // Si l'item a des enfants => on affiche un item déroulant
                    if (link.children) {
                        const isOpen = openMenus[link.name] || false;
                        return (
                            <div key={index}>
                                <div
                                    className={`nav-item nav-item-parent ${isOpen ? 'nav-item-parent-open' : ''}`}
                                    onClick={() => toggleMenu(link.name)}
                                >
                                    <span className="material-symbols-outlined nav-icon">{link.icon}</span>
                                    {link.name}
                                    <span className="material-symbols-outlined nav-chevron">
                                        {isOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </div>
                                {isOpen && (
                                    <div className="nav-submenu">
                                        {link.children.map((child, idx) => (
                                            <NavLink
                                                key={idx}
                                                to={child.path}
                                                className={({isActive}) => isActive ? "nav-item nav-subitem active" : "nav-item nav-subitem"}
                                            >
                                                <span className="material-symbols-outlined nav-icon">{child.icon}</span>
                                                {child.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    // Item simple (comportement d'origine inchangé)
                    return (
                        <NavLink key={index} to={link.path} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                            <span className="material-symbols-outlined nav-icon">{link.icon}</span>
                            {link.name}
                        </NavLink>
                    );
                })}
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
                    <span className="sidebar-user-role">{activeRoleName || activeRoleCode || 'Aucun rôle'}</span>
                </div>
                <span className="material-symbols-outlined sidebar-chevron">expand_more</span>
            </div>
        </aside>
    );
};

export default Sidebar;
