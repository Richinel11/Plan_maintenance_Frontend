import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

/**
 * Composant Header (Topbar) isolé.
 * Ne gère que l'affichage de la barre du haut et la déconnexion.
 */
const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // En vrai mode React expert, on vide totalement le contexte/session
        sessionStorage.clear();
        // Optionnellement, on pourrait faire un appel api logout si le backend l'exige
        navigate('/login', { replace: true });
    };

    return (
        <header className="topbar">
            {/* Fil d'Ariane (Breadcrumb) pour se repérer, qui pourra être rendu dynamique selon l'URL */}
            <div className="breadcrumb">
                <span>Application Eneoplan</span>
            </div>
            
            <div className="topbar-actions">
                <div className="separator"></div>
                {/* Bouton pour se déconnecter de la plateforme et couper la session */}
                <button className="logout-btn-header" onClick={handleLogout}>
                    Deconnexion
                </button>
            </div>
        </header>
    );
};

export default Header;
