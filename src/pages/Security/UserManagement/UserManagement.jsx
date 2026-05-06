import React, { useState, useEffect } from 'react';
import { getUsers, getRoles, getEntites } from '../../../services/userService';
import UsersTable from './components/UsersTable';
import UserModal from './components/UserModal';
import ConfirmModal from './components/ConfirmModal';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [entites, setEntites] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchRole, setSearchRole] = useState('');
    const [searchStatus, setSearchStatus] = useState('');

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData, entitesData] = await Promise.all([
                getUsers(),
                getRoles(),
                getEntites()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
            setEntites(entitesData);
        } catch (error) {
            console.error("Erreur lors du chargement des données", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrage des utilisateurs
    const filteredUsers = users.filter(user => {
        // 1. Recherche par nom/prénom/username
        const queryLower = searchQuery.toLowerCase();
        const matchName = !searchQuery || 
            (user.nom?.toLowerCase() || '').includes(queryLower) ||
            (user.prenom?.toLowerCase() || '').includes(queryLower) ||
            (user.username?.toLowerCase() || '').includes(queryLower);
        
        // 2. Recherche par email
        const matchEmail = !searchEmail || (user.email?.toLowerCase() || '').includes(searchEmail.toLowerCase());

        // 3. Filtrage par Rôle
        let matchRole = true;
        if (searchRole !== '') {
            const roleId = parseInt(searchRole);
            matchRole = Array.isArray(user.roles) 
                ? user.roles.some(r => (r.id || r) === roleId)
                : (user.roles?.id === roleId);
        }

        // 4. Filtrage par Statut
        let matchStatus = true;
        if (searchStatus !== '') {
            const isActiveUser = user.is_active !== undefined ? user.is_active : user.actif;
            if (searchStatus === 'active' && !isActiveUser) matchStatus = false;
            if (searchStatus === 'inactive' && isActiveUser) matchStatus = false;
        }

        return matchName && matchEmail && matchRole && matchStatus;
    });

    // Actions
    const handleAddClick = () => {
        setSelectedUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const handleToggleStatusClick = (user) => {
        setSelectedUser(user);
        setIsConfirmModalOpen(true);
    };

    const refreshData = () => {
        fetchData();
    };

    return (
        <div className="user-management-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestion des Utilisateurs</h1>
                    <p className="page-subtitle">Gérez les accès et les informations des membres de votre organisation.</p>
                </div>
                <button className="primary-btn create-user-btn" onClick={handleAddClick}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Créer un utilisateur
                </button>
            </div>

            <div className="filters-bar">
                <div className="filter-input-group">
                    <span className="material-symbols-outlined filter-icon">search</span>
                    <input 
                        type="text" 
                        placeholder="Nom ou Prénom..." 
                        className="filter-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-input-group">
                    <span className="material-symbols-outlined filter-icon">alternate_email</span>
                    <input 
                        type="text" 
                        placeholder="Email..." 
                        className="filter-input" 
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                </div>
                <div className="filter-dropdown-group">
                    <span className="material-symbols-outlined filter-icon">badge</span>
                    <select 
                        className="filter-select"
                        value={searchRole}
                        onChange={(e) => setSearchRole(e.target.value)}
                    >
                        <option value="">Tous les rôles</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                    </select>
                </div>
                <div className="filter-dropdown-group">
                    <span className="material-symbols-outlined filter-icon">toggle_on</span>
                    <select 
                        className="filter-select"
                        value={searchStatus}
                        onChange={(e) => setSearchStatus(e.target.value)}
                    >
                        <option value="">Statut: Tous</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des utilisateurs...</p>
                    </div>
                ) : (
                    <UsersTable 
                        users={filteredUsers} 
                        onEdit={handleEditClick} 
                        onToggle={handleToggleStatusClick} 
                    />
                )}
            </div>

            {/* Modales */}
            {isUserModalOpen && (
                <UserModal 
                    isOpen={isUserModalOpen} 
                    onClose={() => setIsUserModalOpen(false)}
                    user={selectedUser}
                    roles={roles}
                    entites={entites}
                    onSuccess={refreshData}
                />
            )}

            {isConfirmModalOpen && (
                <ConfirmModal 
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    user={selectedUser}
                    onSuccess={refreshData}
                />
            )}
        </div>
    );
};

export default UserManagement;
