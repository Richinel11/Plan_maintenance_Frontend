import React, { useState, useEffect } from 'react';
import { createRole, updateRole, assignPermissionToRole, removePermissionFromRole } from '../../../../services/userService';
import '../../UserManagement/components/Modals.css';

const RoleModal = ({ isOpen, onClose, role, allPermissions, onSuccess }) => {
    const isEditMode = !!role;

    const [formData, setFormData] = useState({
        nom: '',
        code_role: '',
        description: '',
        permissions: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permSearch, setPermSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (role && isEditMode) {
                setFormData({
                    nom: role.nom || '',
                    code_role: role.code_role || '',
                    description: role.description || '',
                    permissions: role.permissions || []
                });
            } else {
                setFormData({ nom: '', code_role: '', description: '', permissions: [] });
            }
            setError(null);
            setPermSearch('');
        }
    }, [isOpen, role, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNomBlur = () => {
        if (!formData.code_role && formData.nom) {
            const autoCode = formData.nom
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/gi, '')
                .trim()
                .replace(/\s+/g, '_');
            setFormData(prev => ({ ...prev, code_role: autoCode }));
        }
    };

    const handlePermissionToggle = (permCode) => {
        setFormData(prev => {
            const current = prev.permissions || [];
            if (current.includes(permCode)) {
                return { ...prev, permissions: current.filter(c => c !== permCode) };
            } else {
                return { ...prev, permissions: [...current, permCode] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const rolePayload = {
                nom: formData.nom || "",
                nom_role: formData.nom || "",
                code_role: formData.code_role || "",
                description: formData.description || ""
            };
            let savedRole;
            if (isEditMode) {
                savedRole = await updateRole(role.code_role, rolePayload);
            } else {
                savedRole = await createRole(rolePayload);
            }
            const roleCode = savedRole?.code_role || formData.code_role;

            if (isEditMode) {
                const currentPerms = role.permissions || [];
                const toAdd = formData.permissions.filter(c => !currentPerms.includes(c));
                const toRemove = currentPerms.filter(c => !formData.permissions.includes(c));
                for (const c of toAdd) { try { await assignPermissionToRole(roleCode, c); } catch (err) { console.warn(err); } }
                for (const c of toRemove) { try { await removePermissionFromRole(roleCode, c); } catch (err) { console.warn(err); } }
            } else {
                for (const c of formData.permissions) { try { await assignPermissionToRole(roleCode, c); } catch (err) { console.warn(err); } }
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.code_role?.[0] || err.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredPerms = (allPermissions || []).filter(p =>
        p.nom?.toLowerCase().includes(permSearch.toLowerCase()) ||
        (p.code_permission || p.code || '')?.toLowerCase().includes(permSearch.toLowerCase())
    );
    const selectedCount = formData.permissions.length;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">

                {/* ── Header ── */}
                <div className="modal-header">
                    <div className="modal-header-text">
                        <h2>{isEditMode ? 'Modifier le rôle' : 'Créer un rôle'}</h2>
                        <p>Définissez les détails et les permissions pour ce rôle au sein de l'organisation.</p>
                    </div>
                    <button className="close-btn" onClick={onClose} type="button">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-form-body">
                        {error && <div className="modal-error">{error}</div>}

                        {/* ── Carte principale (CSS Grid 2 colonnes) ── */}
                        <div className="form-card-grid">

                            {/* Colonne gauche : Nom du rôle */}
                            <div className="rm-field">
                                <label className="rm-label">Nom du rôle <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="nom"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                    onBlur={handleNomBlur}
                                    className="form-input"
                                    placeholder="Ex: Administrateur de contenu"
                                />
                            </div>

                            {/* Colonne droite : Code du rôle */}
                            <div className="rm-field">
                                <label className="rm-label">Code du rôle <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="code_role"
                                    required
                                    value={formData.code_role}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="ex: admin_contenu"
                                    disabled={isEditMode}
                                />
                                <span className="form-hint">
                                    {isEditMode ? 'Non modifiable.' : 'Auto-généré à partir du nom.'}
                                </span>
                            </div>

                            {/* Description — pleine largeur (2 colonnes) */}
                            <div className="col-span-2 rm-field">
                                <label className="rm-label">Description <span className="text-danger">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description || ""}
                                    onChange={handleChange}
                                    className="form-input"
                                    rows={4}
                                    placeholder="Décrivez les responsabilités et l'étendue de ce rôle..."
                                ></textarea>
                            </div>

                            {/* Séparateur — pleine largeur */}
                            <div className="col-span-2">
                                <hr className="form-divider" />
                            </div>

                            {/* Section Permissions — pleine largeur */}
                            <div className="col-span-2">
                                <div className="checklist-section">
                                    <div className="checklist-header">
                                        <label>
                                            Permissions associées
                                            {selectedCount > 0 && (
                                                <span className="checklist-counter" style={{ marginLeft: '8px' }}>
                                                    {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </label>
                                        <div className="checklist-search">
                                            <span className="material-symbols-outlined">search</span>
                                            <input
                                                type="text"
                                                placeholder="Ajouter une permission..."
                                                value={permSearch}
                                                onChange={e => setPermSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="checklist-box">
                                        {filteredPerms.length === 0 ? (
                                            <div className="checklist-empty">
                                                {permSearch ? 'Aucune permission trouvée' : 'Aucune permission disponible'}
                                            </div>
                                        ) : filteredPerms.map(perm => {
                                            const permCode = perm.code_permission || perm.code || perm.id || perm.nom;
                                            const isChecked = formData.permissions.includes(permCode);
                                            return (
                                                <div
                                                    key={permCode}
                                                    className="checklist-item"
                                                    onClick={() => handlePermissionToggle(permCode)}
                                                >
                                                    <span className="checklist-item-label">{perm.nom}</span>
                                                    <div className={`checklist-checkbox ${isChecked ? 'checked' : ''}`} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleModal;
