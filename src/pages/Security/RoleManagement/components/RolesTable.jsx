import React from 'react';
import '../../UserManagement/components/UsersTable.css'; // On réutilise intelligemment les styles de base du tableau

const RolesTable = ({ roles, permissions, onEdit, onDelete }) => {
    
    // Fonction qui affiche un résumé des permissions d'un rôle
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
                        <th>CODE</th>
                        <th>DESCRIPTION</th>
                        <th>PERMISSIONS</th>
                        <th>STATUT</th>
                        <th className="th-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {roles && roles.length > 0 ? (
                        roles.map((role) => (
                            <tr key={role.id}>
                                <td className="font-medium text-dark">{role.nom}</td>
                                <td className="text-gray-code">{role.code_role || '-'}</td>
                                <td className="text-gray" style={{maxWidth: '250px'}}>{role.description || '-'}</td>
                                <td>{renderPermissionsSummary(role.permissions)}</td>
                                <td>
                                    {role.is_active !== false ? (
                                        <div className="status-pill status-active">
                                            <span className="status-dot green-dot"></span> Actif
                                        </div>
                                    ) : (
                                        <div className="status-pill status-inactive">
                                            <span className="status-dot gray-dot"></span> Inactif
                                        </div>
                                    )}
                                </td>
                                <td className="td-actions">
                                    <button 
                                        className="action-btn edit-btn" 
                                        title="Modifier ce rôle"
                                        onClick={() => onEdit(role)}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    
                                    {role.is_active !== false ? (
                                        <button 
                                            className="action-btn delete-btn" 
                                            title="Désactiver ce rôle"
                                            onClick={() => onDelete(role)}
                                        >
                                            <span className="material-symbols-outlined">block</span>
                                        </button>
                                    ) : (
                                        <button 
                                            className="action-btn activate-btn" 
                                            title="Activer ce rôle"
                                            onClick={() => onDelete(role)}
                                        >
                                            <span className="material-symbols-outlined">check_circle</span>
                                        </button>
                                    )}
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
