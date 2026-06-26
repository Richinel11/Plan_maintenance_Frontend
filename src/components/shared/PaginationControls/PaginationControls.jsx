import React from 'react';
import './PaginationControls.css';

const PaginationControls = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, itemLabel = 'élément(s)' }) => {
    if (!totalPages || totalPages <= 1) return null;

    const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pc-footer">
            <span className="pc-info">
                Affichage de {start} à {end} sur {totalItems} {itemLabel}
            </span>
            <div className="pc-controls">
                <button
                    className="pc-btn"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    title="Page précédente"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="pc-page-info">Page {currentPage} / {totalPages || 1}</span>
                <button
                    className="pc-btn"
                    disabled={currentPage >= (totalPages || 1)}
                    onClick={() => onPageChange(currentPage + 1)}
                    title="Page suivante"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
    );
};

export default PaginationControls;
