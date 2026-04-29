import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import './DashboardLayout.css';

/**
 * DashboardLayout (Pattern Modulaire)
 * Le rôle unique de ce composant est d'organiser la structure visuelle globale.
 * Il ne connaît pas les détails du menu, ni du bouton déconnexion.
 * Il ne fait qu'assembler les briques (Header, Sidebar) et injecter le module enfant (Outlet).
 */
const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            {/* Colonne Gauche : Le Menu */}
            <Sidebar />

            {/* Colonne Droite : Header + Contenu actif */}
            <div className="main-area">
                <Header />

                {/* C'est ici que les futures pages des modules métiers vont s'afficher (ex: Gestion des Rôles) */}
                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
