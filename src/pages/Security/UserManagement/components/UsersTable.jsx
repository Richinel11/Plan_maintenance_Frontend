import React, { useState, useEffect, useRef } from 'react';
import './UsersTable.css';
import PaginationControls from '../../../../components/shared/PaginationControls/PaginationControls';

const ITEMS_PER_PAGE = 10;

const RolePopup = ({ roles, onClose }) => {
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div className="role-popup" ref={ref}>
            {roles.map(r => (
                <span key={r.code_role} className="role-pill">{r.nom}</span>
            ))}
        </div>
    );
};

const UsersTable = ({ users, regions = [], onEdit, onToggle }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [openRolePopup, setOpenRolePopup] = useState(null);

    useEffect(() => { setCurrentPage(1); }, [users.length]);

    const totalPages = Math.ceil((users?.length || 0) / ITEMS_PER_PAGE);
    const paginatedUsers = (users || []).slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const resolveRegion = (value) => {
        if (!value) return '-';
        if (typeof value === 'object') return value.code || '-';
        const found = regions.find(r => r.id === value);
        return found ? found.code : '-';
    };

    const renderRole = (rolesArr, userId) => {
        if (!Array.isArray(rolesArr) || rolesArr.length === 0)
            return <span className="text-gray">-</span>;
        const visible = rolesArr.slice(0, 1);
        const hidden = rolesArr.slice(1);
        return (
            <div className="roles-container" style={{ position: 'relative' }}>
                {visible.map(r => (
                    <span key={r.code_role} className="role-pill">{r.nom}</span>
                ))}
                {hidden.length > 0 && (
                    <span
                        className="role-more-pill"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setOpenRolePopup(openRolePopup === userId ? null : userId); }}
                    >
                        +{hidden.length}
                    </span>
                )}
                {openRolePopup === userId && (
                    <RolePopup roles={rolesArr} onClose={() => setOpenRolePopup(null)} />
                )}
            </div>
        );
    };

    const renderEntite = (entiteObj) => {
        if (!entiteObj) return <span className="text-gray">-</span>;
        if (Array.isArray(entiteObj)) {
            if (entiteObj.length === 0) return <span className="text-gray">-</span>;
            return entiteObj.map(e => e.name || e.nom || '-').join(', ');
        }
        if (typeof entiteObj === 'object') return entiteObj.name || entiteObj.nom || '-';
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
                        <th>RÉGION</th>
                        <th>ENTITÉ MÉTIER</th>
                        <th>RÔLE</th>
                        <th>STATUT</th>
                        <th className="th-actions">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="font-medium text-dark">{user.last_name || '-'}</td>
                                <td className="text-gray">{user.first_name || '-'}</td>
                                <td className="text-gray">{user.email || '-'}</td>
                                <td className="text-gray-code">{user.username}</td>
                                <td className="text-gray">{resolveRegion(user.region)}</td>
                                <td className="text-gray">{renderEntite(user.entite_metier)}</td>
                                <td>{renderRole(user.roles, user.id)}</td>
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
                                            <span className="material-symbols-outlined">block</span>
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
                            <td colSpan="9" className="empty-state">
                                Aucun utilisateur trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={users?.length || 0}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemLabel="utilisateur(s)"
            />
        </div>
    );
};

export default UsersTable;
