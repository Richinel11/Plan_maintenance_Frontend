import React from 'react';
import '../../UserManagement/components/UsersTable.css'; // On réutilise intelligemment les styles de base du tableau

const RolesTable = ({ roles, permissions, onEdit, onDelete }) => {
    
    // Fonction qui convertit des IDs de permissions en petits badges (pour les 3 premières, etc.)
    const renderPermissionsSummary = (rolePermsIds) => {
        if (!rolePermsIds || rolePermsIds.length === 0) return <span className="text-gray-code">Aucune permission</span>;
        
        const count = rolePermsIds.length;
        return (
            <div className="roles-container">
                <span className="role-pill" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>
                    {count} permission(s)
                </span>
            </div>
        );
    };

    return (
        <div className="users-table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>NOM DU RÔLE</th>
                        <th>DESCRIPTION</th>
                        <th>UTILISATEURS</th>
                        <th>PERMISSIONS</th>
                        <th className="th-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {roles && roles.length > 0 ? (
                        roles.map((role) => (
                            <tr key={role.id}>
                                <td className="font-medium text-dark">{role.nom}</td>
                                <td className="text-gray" style={{maxWidth: '250px'}}>{role.description || '-'}</td>
                                <td>
                                    <div className="status-pill" style={{backgroundColor: '#f1f5f9', color: '#475569'}}>
                                        <span className="material-symbols-outlined" style={{fontSize: '14px'}}>group</span>
                                        {role.nbUsers || 0}
                                    </div>
                                </td>
                                <td>{renderPermissionsSummary(role.permissions)}</td>
                                <td className="td-actions">
                                    <button 
                                        className="action-btn edit-btn" 
                                        title="Modifier ce rôle"
                                        onClick={() => onEdit(role)}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    
                                    <button 
                                        className="action-btn delete-btn" 
                                        title="Supprimer ce rôle"
                                        onClick={() => onDelete(role)}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state">
                                Aucun rôle configuré.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RolesTable;
