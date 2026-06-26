import React, { useState, useEffect } from 'react';
import '../../UserManagement/components/UsersTable.css';
import PaginationControls from '../../../../components/shared/PaginationControls/PaginationControls';

const ITEMS_PER_PAGE = 10;

const PermissionsTable = ({ permissions, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { setCurrentPage(1); }, [permissions.length]);

    const totalPages = Math.ceil((permissions?.length || 0) / ITEMS_PER_PAGE);
    const paginatedPerms = (permissions || []).slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
                    {paginatedPerms.length > 0 ? (
                        paginatedPerms.map((perm) => {
                            const pId = perm.code_permission || perm.code || perm.id || perm.nom;
                            return (
                                <tr key={pId}>
                                    <td className="font-medium text-dark">{perm.module || '-'}</td>
                                    <td>
                                        <div className="status-pill" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                                            {perm.nom}
                                        </div>
                                    </td>
                                    <td className="text-gray-code">{perm.code || perm.code_permission || '-'}</td>
                                    <td className="text-gray" style={{ maxWidth: '300px' }}>{perm.description || '-'}</td>
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

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={permissions?.length || 0}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemLabel="permission(s)"
            />
        </div>
    );
};

export default PermissionsTable;
