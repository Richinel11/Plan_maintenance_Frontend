import React from 'react';
import '../../UserManagement/components/UsersTable.css'; // On réutilise les styles de base

const PermissionsTable = ({ permissions, onDelete }) => {
    return (
        <div className="users-table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>CATÉGORIE</th>
                        <th>ACTION</th>
                        <th>DESCRIPTION</th>
                        <th className="th-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions && permissions.length > 0 ? (
                        permissions.map((perm) => (
                            <tr key={perm.id}>
                                <td className="font-medium text-dark">{perm.category}</td>
                                <td>
                                    <div className="status-pill" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>
                                        {perm.action}
                                    </div>
                                </td>
                                <td className="text-gray" style={{maxWidth: '300px'}}>{perm.description || '-'}</td>
                                <td className="td-actions">
                                    <button 
                                        className="action-btn delete-btn" 
                                        title="Supprimer cette permission"
                                        onClick={() => onDelete(perm.id)}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="empty-state">
                                Aucune permission configurée.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionsTable;
