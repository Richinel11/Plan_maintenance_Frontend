import React, { useState, useEffect } from 'react';
import { getPermissions, deletePermission } from '../../../services/userService';
import PermissionsTable from '../RoleManagement/components/PermissionsTable';
import PermissionModal from '../RoleManagement/components/PermissionModal';
import '../RoleManagement/RoleManagement.css'; // On réutilise les styles structurels de la page

const PermissionManagement = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    
    // États pour la recherche avancée
    const [searchQuery, setSearchQuery] = useState('');
    const [searchModule, setSearchModule] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const permsData = await getPermissions();
            setPermissions(Array.isArray(permsData) ? permsData : []);
        } catch (error) {
            console.error("Erreur lors du chargement des permissions", error);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    // Obtenir la liste des modules uniques pour le menu déroulant
    const modules = [...new Set(permissions.map(p => p.module).filter(Boolean))];

    // Logique de filtrage
    const filteredPermissions = permissions.filter(perm => {
        const queryLower = searchQuery.toLowerCase();
        
        // Recherche textuelle sur nom, module et description
        const matchText = !searchQuery || 
               (perm.nom?.toLowerCase() || '').includes(queryLower) ||
               (perm.description?.toLowerCase() || '').includes(queryLower) ||
               (perm.module?.toLowerCase() || '').includes(queryLower) ||
               (perm.code?.toLowerCase() || '').includes(queryLower);
        
        // Recherche par module depuis le menu déroulant
        const matchModule = !searchModule || perm.module === searchModule;

        return matchText && matchModule;
    });

    const handleAddPermissionClick = () => {
        setSelectedPermission(null);
        setIsPermissionModalOpen(true);
    };

    const handleEditPermissionClick = (perm) => {
        setSelectedPermission(perm);
        setIsPermissionModalOpen(true);
    };

    const handleDeletePermissionClick = async (permId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette permission ? Les rôles associés perdront également cette permission.")) {
            try {
                await deletePermission(permId);
                fetchData();
            } catch (error) {
                console.error("Erreur lors de la suppression de la permission", error);
                alert(error.response?.data?.detail || "Erreur lors de la suppression");
            }
        }
    };

    return (
        <div className="role-management-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestion des Permissions</h1>
                    <p className="page-subtitle">Visualisez et ajoutez de nouvelles permissions au catalogue de l'application.</p>
                </div>
                <button className="primary-btn create-role-btn" onClick={handleAddPermissionClick}>
                    <span className="material-symbols-outlined" style={{fontSize: '20px'}}>security</span>
                    Créer une permission
                </button>
            </div>

            <div className="filters-bar">
                <div className="filter-input-group" style={{maxWidth: '400px'}}>
                    <span className="material-symbols-outlined filter-icon">search</span>
                    <input 
                        type="text" 
                        placeholder="Rechercher nom, module, description..." 
                        className="filter-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-dropdown-group" style={{maxWidth: '300px'}}>
                    <span className="material-symbols-outlined filter-icon">category</span>
                    <select 
                        className="filter-select"
                        value={searchModule}
                        onChange={(e) => setSearchModule(e.target.value)}
                    >
                        <option value="">Tous les modules</option>
                        {modules.map((mod, idx) => (
                            <option key={idx} value={mod}>{mod}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des permissions...</p>
                    </div>
                ) : (
                    <PermissionsTable 
                        permissions={filteredPermissions} 
                        onEdit={handleEditPermissionClick}
                        onDelete={handleDeletePermissionClick}
                    />
                )}
            </div>

            {isPermissionModalOpen && (
                <PermissionModal 
                    isOpen={isPermissionModalOpen}
                    onClose={() => setIsPermissionModalOpen(false)}
                    permission={selectedPermission}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default PermissionManagement;
