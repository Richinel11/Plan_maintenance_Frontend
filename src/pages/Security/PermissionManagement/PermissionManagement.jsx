import React, { useState, useEffect } from 'react';
import { getPermissions, deletePermission } from '../../../services/userService';
import PermissionsTable from '../RoleManagement/components/PermissionsTable';
import PermissionModal from '../RoleManagement/components/PermissionModal';
import '../RoleManagement/RoleManagement.css'; // On réutilise les styles structurels de la page

const PermissionManagement = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    
    // Nouveaux états pour la recherche avancée
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const permsData = await getPermissions();
            setPermissions(permsData);
        } catch (error) {
            console.error("Erreur lors du chargement des permissions", error);
        } finally {
            setLoading(false);
        }
    };

    // Obtenir la liste des catégories uniques pour le menu déroulant
    const categories = [...new Set(permissions.map(p => p.category))];

    // Logique de filtrage améliorée
    const filteredPermissions = permissions.filter(perm => {
        const queryLower = searchQuery.toLowerCase();
        
        // Recherche textuelle sur action et description
        const matchText = !searchQuery || 
               (perm.action?.toLowerCase() || '').includes(queryLower) ||
               (perm.description?.toLowerCase() || '').includes(queryLower) ||
               (perm.category?.toLowerCase() || '').includes(queryLower);
        
        // Recherche par catégorie stricte depuis le menu déroulant
        const matchCategory = !searchCategory || perm.category === searchCategory;

        return matchText && matchCategory;
    });

    const handleAddPermissionClick = () => {
        setIsPermissionModalOpen(true);
    };

    const handleDeletePermissionClick = async (permId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette permission ? Les rôles associés perdront également cette permission.")) {
            try {
                await deletePermission(permId);
                fetchData();
            } catch (error) {
                console.error("Erreur lors de la suppression de la permission", error);
                alert("Erreur lors de la suppression");
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
                        placeholder="Rechercher action, catégorie, description..." 
                        className="filter-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-dropdown-group" style={{maxWidth: '300px'}}>
                    <span className="material-symbols-outlined filter-icon">category</span>
                    <select 
                        className="filter-select"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
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
                        onDelete={handleDeletePermissionClick}
                    />
                )}
            </div>

            {isPermissionModalOpen && (
                <PermissionModal 
                    isOpen={isPermissionModalOpen}
                    onClose={() => setIsPermissionModalOpen(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default PermissionManagement;
