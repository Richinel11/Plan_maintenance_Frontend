import React, { useState, useEffect } from 'react';
import { createRole, updateRole } from '../../../../services/userService';
import '../../UserManagement/components/Modals.css'; // On hérite des styles globaux des form/modales

const RoleModal = ({ isOpen, onClose, role, allPermissions, onSuccess }) => {
    const isEditMode = !!role;

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        permissions: [] // tableau d'IDs
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (role && isEditMode) {
            setFormData({
                nom: role.nom || '',
                description: role.description || '',
                permissions: role.permissions || []
            });
        }
    }, [role, isEditMode]);

    // Grouper les permissions par catégorie pour l'affichage de la grille
    const groupedPermissions = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
            acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
    }, {});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const currentPerms = prev.permissions;
            if (currentPerms.includes(permId)) {
                return { ...prev, permissions: currentPerms.filter(id => id !== permId) };
            } else {
                return { ...prev, permissions: [...currentPerms, permId] };
            }
        });
    };

    const handleSelectAllCategory = (categoryName, isChecked) => {
        const categoryPermIds = groupedPermissions[categoryName].map(p => p.id);
        
        setFormData(prev => {
            let newPerms = [...prev.permissions];
            if (isChecked) {
                // Ajouter ceux qui n'y sont pas
                categoryPermIds.forEach(id => {
                    if (!newPerms.includes(id)) newPerms.push(id);
                });
            } else {
                // Retirer ceux de la catégorie
                newPerms = newPerms.filter(id => !categoryPermIds.includes(id));
            }
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isEditMode) {
                await updateRole(role.id, formData);
            } else {
                await createRole(formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || "Erreur lors de l'enregistrement du rôle.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth: '800px'}}>
                <div className="modal-header">
                    <h2>{isEditMode ? "Modifier le Rôle" : "Créer un nouveau Rôle"}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form" style={{maxHeight: '75vh', overflowY: 'auto'}}>
                    {error && <div className="modal-error">{error}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom du rôle <span className="text-danger">*</span></label>
                            <input type="text" name="nom" required value={formData.nom} onChange={handleChange} className="form-input" placeholder="ex: Superviseur Régional" />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Description du rôle</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows="2" placeholder="Résumé des accès conférés..."></textarea>
                    </div>

                    <div className="permissions-section-title">
                        <h3>Droits d'accès et Permissions</h3>
                        <p>Cochez les actions autorisées pour ce profil.</p>
                    </div>

                    <div className="permissions-grid">
                        {Object.entries(groupedPermissions).map(([category, perms]) => {
                            // Vérifier si toute la catégorie est cochée
                            const allChecked = perms.every(p => formData.permissions.includes(p.id));
                            const someChecked = perms.some(p => formData.permissions.includes(p.id));

                            return (
                                <div key={category} className="permission-card">
                                    <div className="permission-category-header">
                                        <h4>{category}</h4>
                                        <label className="checkbox-container select-all-label">
                                            <input 
                                                type="checkbox" 
                                                checked={allChecked}
                                                ref={input => {
                                                    if (input) input.indeterminate = someChecked && !allChecked;
                                                }}
                                                onChange={(e) => handleSelectAllCategory(category, e.target.checked)}
                                            />
                                            <span className="checkmark"></span>
                                            Tout
                                        </label>
                                    </div>
                                    
                                    <div className="permission-list">
                                        {perms.map(perm => (
                                            <label key={perm.id} className="checkbox-container">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.permissions.includes(perm.id)}
                                                    onChange={() => handlePermissionToggle(perm.id)}
                                                />
                                                <span className="checkmark"></span>
                                                <div className="perm-content">
                                                    <span className="perm-action">{perm.action}</span>
                                                    <span className="perm-desc">{perm.description}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="modal-actions" style={{position: 'sticky', bottom: '-24px', backgroundColor: 'white', padding: '16px 0', borderTop: '1px solid #e2e8f0', margin: '24px -24px -24px -24px', paddingRight: '24px'}}>
                        <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? "Patientez..." : (isEditMode ? "Enregistrer" : "Créer le rôle")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleModal;
