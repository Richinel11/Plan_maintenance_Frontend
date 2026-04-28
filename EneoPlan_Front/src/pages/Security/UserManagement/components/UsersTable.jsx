import React from 'react';
import './UsersTable.css';

const UsersTable = ({ users, onEdit, onToggle }) => {
    // Helper: affiche le rôle de l'utilisateur
    // Le backend retourne `roles` comme un TABLEAU [{nom, code_role, ...}]
    const renderRole = (rolesArr) => {
        if (!Array.isArray(rolesArr) || rolesArr.length === 0)
            return <span className="text-gray">-</span>;
        return (
            <div className="roles-container">
                {rolesArr.map(r => (
                    <span key={r.code_role} className="role-pill">{r.nom}</span>
                ))}
            </div>
        );
    };

    // Helper: affiche l'entité métier
    const renderEntite = (entiteObj) => {
        if (!entiteObj) return '-';
        if (typeof entiteObj === 'object') return entiteObj.nom || '-';
        return entiteObj;
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
                        <th>RÔLE</th>
                        <th>STATUT</th>
                        <th className="th-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {users && users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td className="font-medium text-dark">{user.last_name || '-'}</td>
                                <td className="text-gray">{user.first_name || '-'}</td>
                                <td className="text-gray">{user.email || '-'}</td>
                                <td className="text-gray-code">{user.username}</td>
                                <td>{renderRole(user.roles)}</td>
                                <td>
                                    {user.is_active ? (
                                        <div className="status-pill status-active">
                                            <span className="status-dot green-dot"></span> Active
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
                                        title="Modifier"
                                        onClick={() => onEdit(user)}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    
                                    {user.is_active ? (
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
