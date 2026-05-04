import React, { useState, useEffect } from 'react';
import { getRoles, getPermissions, deleteRole, getRolePermissions } from '../../../services/userService';
import RolesTable from './components/RolesTable';
import RoleModal from './components/RoleModal';
import './RoleManagement.css';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchPermission, setSearchPermission] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData] = await Promise.all([
                getRoles(),
                getPermissions()
            ]);

            const rolesArray = Array.isArray(rolesData) ? rolesData : [];
            const permsArray = Array.isArray(permsData) ? permsData : [];

            // Pour chaque rôle, charger ses permissions associées
            const rolesWithPermissions = await Promise.all(
                rolesArray.map(async (role) => {
                    try {
                        const rolePerms = await getRolePermissions(role.code_role);
                        return {
                            ...role,
                            permissions: Array.isArray(rolePerms) ? rolePerms.map(p => p.code_permission || p.code || p.id || p.nom) : []
                        };
                    } catch {
                        // Si l'appel échoue (ex: 401), on met un tableau vide
                        return { ...role, permissions: [] };
                    }
                })
            );

            setRoles(rolesWithPermissions);
            setAllPermissions(permsArray);
        } catch (error) {
            console.error("Erreur lors du chargement de la gestion des rôles", error);
            setRoles([]);
            setAllPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrage des rôles
    const filteredRoles = roles.filter(role => {
        const queryLower = searchQuery.toLowerCase();
        const matchText = !searchQuery || 
               (role.nom?.toLowerCase() || '').includes(queryLower) ||
               (role.description?.toLowerCase() || '').includes(queryLower) ||
               (role.code_role?.toLowerCase() || '').includes(queryLower);
        
        // Filtrage croisé par permission ciblée (comparison UUID string)
        let matchPerm = true;
        if (searchPermission !== '') {
            matchPerm = role.permissions && role.permissions.includes(searchPermission);
        }

        return matchText && matchPerm;
    });

    const handleAddRoleClick = () => {
        setSelectedRole(null);
        setIsRoleModalOpen(true);
    };

    const handleEditRoleClick = (role) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const handleDeleteRoleClick = async (role) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`)) {
            try {
                await deleteRole(role.id);
                refreshData(); 
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                alert(error.response?.data?.detail || error.message || "Impossible de supprimer ce rôle.");
            }
        }
    };

    const refreshData = () => {
        fetchData();
    };

    return (
        <div className="role-management-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestion des Rôles</h1>
                    <p className="page-subtitle">Créez des profils et paramétrez finement les droits d'accès à l'application.</p>
                </div>
                <button className="primary-btn create-role-btn" onClick={handleAddRoleClick}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Créer un nouveau rôle
                </button>
            </div>

            <div className="filters-bar">
                <div className="filter-input-group" style={{maxWidth: '400px'}}>
                    <span className="material-symbols-outlined filter-icon">search</span>
                    <input 
                        type="text" 
                        placeholder="Rechercher un rôle ou une description..." 
                        className="filter-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-dropdown-group" style={{maxWidth: '300px'}}>
                    <span className="material-symbols-outlined filter-icon">security</span>
                    <select 
                        className="filter-select"
                        value={searchPermission}
                        onChange={(e) => setSearchPermission(e.target.value)}
                    >
                        <option value="">Filtre: Toutes les permissions</option>
                        {allPermissions.map(p => {
                            const pId = p.code_permission || p.code || p.id || p.nom;
                            return <option key={pId} value={pId}>{p.module} - {p.nom}</option>
                        })}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des rôles...</p>
                    </div>
                ) : (
                    <RolesTable 
                        roles={filteredRoles} 
                        permissions={allPermissions}
                        onEdit={handleEditRoleClick} 
                        onDelete={handleDeleteRoleClick}
                    />
                )}
            </div>

            {isRoleModalOpen && (
                <RoleModal 
                    isOpen={isRoleModalOpen}
                    onClose={() => setIsRoleModalOpen(false)}
                    role={selectedRole}
                    allPermissions={allPermissions}
                    onSuccess={refreshData}
                />
            )}
        </div>
    );
};

export default RoleManagement;
