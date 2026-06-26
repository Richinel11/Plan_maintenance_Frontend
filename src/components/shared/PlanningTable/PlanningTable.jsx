import React, { useState } from 'react';
import './PlanningTable.css';
import PaginationControls from '../PaginationControls/PaginationControls';

const getStatusClass = (status) => {
    if (!status) return 'status-brouillon';
    switch (status.toLowerCase()) {
        case 'brouillon':  return 'status-brouillon';
        case 'soumis':     return 'status-soumis';
        case 'en cours':   return 'status-encours';
        case 'clôturé':    return 'status-cloture';
        default:           return 'status-brouillon';
    }
};

const PlanningTable = ({ plannings = [], loading = false, onRowClick, onEdit, onDelete, currentPage = 1, totalPages = 1, totalItems = 0, onPageChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const showActions = onEdit || onDelete;

    const filtered = plannings.filter(p =>
        (p.nom || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.entite_metier?.name || p.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.statut || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedPlannings = searchTerm ? filtered : plannings;

    return (
        <div className="pt-card">
            <div className="pt-header">
                <h2 className="pt-title">Liste des Plannings</h2>
                <div className="pt-search-container">
                    <span className="material-symbols-outlined pt-search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Rechercher par nom, code, entité ou statut..."
                        className="pt-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <table className="pt-table">
                <thead>
                    <tr>
                        <th>Nom du Planning</th>
                        <th>Code</th>
                        <th>Entité</th>
                        <th>Statut</th>
                        {showActions && <th style={{ textAlign: 'right' }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={showActions ? 5 : 4} className="pt-empty">
                                Chargement...
                            </td>
                        </tr>
                    ) : displayedPlannings.length > 0 ? (
                        displayedPlannings.map(planning => (
                            <tr key={planning.id}>
                                <td
                                    className="pt-name-cell"
                                    onClick={() => onRowClick && onRowClick(planning)}
                                    title="Cliquez pour voir les détails"
                                >
                                    <span className="pt-name">{planning.nom || planning.name || '—'}</span>
                                </td>
                                <td><span className="pt-ref">{planning.code || '—'}</span></td>
                                <td>{planning.entite_metier?.name || planning.service || '—'}</td>
                                <td>
                                    <span className={`pt-status ${getStatusClass(planning.statut)}`}>
                                        {planning.statut || 'Brouillon'}
                                    </span>
                                </td>
                                {showActions && (
                                    <td>
                                        {(planning.statut || '').toLowerCase() !== 'clôturé' ? (
                                            <div className="pt-actions">
                                                {onEdit && (
                                                    <button className="pt-btn pt-edit-btn" title="Modifier" onClick={(e) => onEdit(planning, e)}>
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button className="pt-btn pt-delete-btn" title="Supprimer" onClick={(e) => onDelete(planning, e)}>
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="pt-actions">
                                                <span title="Planning clôturé" style={{ color: '#9ca3af', cursor: 'not-allowed', display: 'flex', alignItems: 'center', padding: '6px' }}>
                                                    <span className="material-symbols-outlined">lock</span>
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={showActions ? 5 : 4} className="pt-empty">
                                Aucun planning trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {!searchTerm && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={onPageChange}
                    itemLabel="planning(s)"
                />
            )}
        </div>
    );
};

export default PlanningTable;
