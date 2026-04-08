import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

/**
 * Mappage des segments d'URL vers des noms conviviaux en français.
 */
const pathNames = {
    'users': 'Utilisateurs',
    'roles': 'Rôles',
    'permissions': 'Permissions',
    'home': 'Tableau de bord',
    'plannings': 'Plannings',
    'import': 'Importer Planning',
    'create-job': 'Nouveau Travail',
    'gantt': 'Diagramme Gantt',
    'calendrier': 'Calendrier',
    'alertes': 'Alertes Conflits',
    'effectifs': 'Plannings Effectifs',
    'historique': 'Historique',
    'rapports': 'Rapports & KPI',
    'validations': 'Validation Plannings',
    'ddr': 'Demandes DDR',
    'napt': 'Documents NAPT',
    'traitement-ddr': 'Traitement DDR',
    'validation-napt': 'Validation NAPT',
    'audit-plannings': 'Audit Plannings',
    'audit-ddr': 'Audit DDR',
    'audit-napt': 'Audit NAPT',
    'export': 'Export Global',
    'select-role': 'Sélection du rôle',
    'create': 'Création'
};

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Génération du fil d'Ariane
    const generateBreadcrumb = () => {
        const segments = location.pathname.split('/').filter(s => s && s !== 'dashboard');
        
        return segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const label = pathNames[segment] || (segment.charAt(0).toUpperCase() + segment.slice(1));
            
            return (
                <React.Fragment key={segment}>
                    <span className={`breadcrumb-item ${isLast ? 'active' : 'parent'}`}>
                        {label}
                    </span>
                    {!isLast && <span className="breadcrumb-separator">/</span>}
                </React.Fragment>
            );
        });
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login', { replace: true });
    };

    return (
        <header className="topbar">
            {/* Fil d'Ariane (Breadcrumb) dynamique */}
            <div className="breadcrumb">
                {generateBreadcrumb()}
            </div>
            
            <div className="topbar-actions">
                <div className="separator"></div>
                <button className="logout-btn-header" onClick={handleLogout}>
                    Deconnexion
                </button>
            </div>
        </header>
    );
};

export default Header;
