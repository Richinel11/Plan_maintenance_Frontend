import React from 'react';
import './UsersTable.css';

const UsersTable = ({ users, onEdit, onToggle }) => {
    // Helper function to render roles properly like the mockup
    const renderRoles = (rolesObj) => {
        // If the backend returns an array of roles or an object
        let rolesArray = [];
        if (Array.isArray(rolesObj)) {
            rolesArray = rolesObj;
        } else if (rolesObj && typeof rolesObj === 'object') {
            rolesArray = Object.values(rolesObj);
        }

        if (rolesArray.length === 0) {
            return <span className="text-gray">-</span>;
        }

        const mainRole = rolesArray[0];
        const extraRolesCount = rolesArray.length - 1;

        return (
            <div className="roles-container">
                <span className="role-pill">{mainRole.nom || mainRole}</span>
                {extraRolesCount > 0 && (
                    <span className="role-count-pill">+{extraRolesCount}</span>
                )}
            </div>
        );
    };

    return (
        <div className="users-table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>NOM</th>
                        <th>PRÉNOM</th>
                        <th>EMAIL</th>
                        <th>NOM D'UTILISATEUR</th>
                        <th>RÔLE(S)</th>
                        <th>STATUT</th>
                        <th className="th-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {users && users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td className="font-medium text-dark">{user.nom || '-'}</td>
                                <td className="text-gray">{user.prenom || '-'}</td>
                                <td className="text-gray">{user.email || '-'}</td>
                                <td className="text-gray-code">{user.username}</td>
                                <td>{renderRoles(user.roles)}</td>
                                <td>
                                    {user.actif || user.is_active ? (
                                        <div className="status-pill status-active">
                                            <span className="status-dot green-dot"></span> Active
                                        </div>
                                    ) : (
                                        <div className="status-pill status-inactive">
                                            <span className="status-dot gray-dot"></span> Inactive
                                        </div>
                                    )}
                                </td>
                                <td className="td-actions">
                                    <button 
                                        className="action-btn edit-btn" 
                                        title="Modifier"
                                        onClick={() => onEdit(user)}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    
                                    {user.actif || user.is_active ? (
                                        <button 
                                            className="action-btn delete-btn" 
                                            title="Désactiver"
                                            onClick={() => onToggle(user)}
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    ) : (
                                        <button 
                                            className="action-btn activate-btn" 
                                            title="Activer"
                                            onClick={() => onToggle(user)}
                                        >
                                            <span className="material-symbols-outlined">check_circle</span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="empty-state">
                                Aucun utilisateur trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* Pied de page Tableau : Pagination */}
            <div className="table-footer">
                <span className="pagination-info">Affichage de 1 à {users?.length || 0} sur {users?.length || 0} utilisateurs</span>
                <div className="pagination-controls">
                    <button className="page-btn" disabled><span className="material-symbols-outlined">chevron_left</span></button>
                    <button className="page-btn" disabled><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
            </div>
        </div>
    );
};

export default UsersTable;
