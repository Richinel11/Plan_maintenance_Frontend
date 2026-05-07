import React from 'react';
import '../../UserManagement/components/UsersTable.css'; // On réutilise les styles de base

const PermissionsTable = ({ permissions, onEdit, onDelete }) => {
    return (
        <div className="users-table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>MODULE</th>
                        <th>NOM</th>
                        <th>CODE</th>
                        <th>DESCRIPTION</th>
                        <th className="th-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions && permissions.length > 0 ? (
                        permissions.map((perm) => {
                            const pId = perm.code_permission || perm.code || perm.id || perm.nom;
                            return (
                            <tr key={pId}>
                                <td className="font-medium text-dark">{perm.module || '-'}</td>
                                <td>
                                    <div className="status-pill" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>
                                        {perm.nom}
                                    </div>
                                </td>
                                <td className="text-gray-code">{perm.code || perm.code_permission || '-'}</td>
                                <td className="text-gray" style={{maxWidth: '300px'}}>{perm.description || '-'}</td>
                                <td className="td-actions">
                                    <button 
                                        className="action-btn edit-btn" 
                                        title="Modifier cette permission"
                                        onClick={() => onEdit(perm)}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button 
                                        className="action-btn delete-btn" 
                                        title="Supprimer cette permission"
                                        onClick={() => onDelete(pId)}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state">
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
