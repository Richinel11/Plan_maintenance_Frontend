import React, { useState, useEffect } from 'react';
import '../../UserManagement/components/UsersTable.css';
import PaginationControls from '../../../../components/shared/PaginationControls/PaginationControls';

const ITEMS_PER_PAGE = 10;

/**
 * Table générique pour une liste d'entités à un seul champ "valeur"
 * (Tronçons, Centrales thermiques...). En mode `readOnly`, aucune colonne
 * d'action n'est affichée — la table sert juste à confirmer visuellement
 * le contenu déjà en base.
 */
const SimpleListTable = ({ items, columnLabel, itemLabel, emptyLabel, onEdit, onDelete, readOnly = false }) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { setCurrentPage(1); }, [items.length]);

    const totalPages = Math.ceil((items?.length || 0) / ITEMS_PER_PAGE);
    const paginated = (items || []).slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="users-table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>{columnLabel}</th>
                        {!readOnly && <th className="th-actions">ACTIONS</th>}
                    </tr>
                </thead>
                <tbody>
                    {paginated.length > 0 ? (
                        paginated.map((it) => (
                            <tr key={it.id}>
                                <td className="font-medium text-dark">{it.valeur}</td>
                                {!readOnly && (
                                    <td className="td-actions">
                                        <button
                                            className="action-btn edit-btn"
                                            title="Modifier"
                                            onClick={() => onEdit(it)}
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            title="Supprimer"
                                            onClick={() => onDelete(it)}
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={readOnly ? 1 : 2} className="empty-state">{emptyLabel}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={items?.length || 0}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemLabel={itemLabel}
            />
        </div>
    );
};

export default SimpleListTable;
