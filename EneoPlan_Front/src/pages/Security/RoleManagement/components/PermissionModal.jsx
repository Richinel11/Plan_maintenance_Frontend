import React, { useState } from 'react';
import { createPermission, updatePermission } from '../../../../services/userService';
import '../../UserManagement/components/Modals.css';

const PermissionModal = ({ isOpen, onClose, permission, onSuccess }) => {
    const [formData, setFormData] = useState({
        nom: '',
        code: '',
        module: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = !!permission;

    React.useEffect(() => {
        if (permission && isOpen) {
            setFormData({
                nom: permission.nom || '',
                code: permission.code || '',
                module: permission.module || '',
                description: permission.description || ''
            });
        } else {
            setFormData({
                nom: '',
                code: '',
                module: '',
                description: ''
            });
        }
    }, [permission, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Génère un code automatique à partir du nom et du module
    const handleNomBlur = () => {
        if (!formData.code && formData.nom) {
            const autoCode = formData.nom
                .toLowerCase()
                .replace(/[^a-z0-9\s]/gi, '')
                .replace(/\s+/g, '_');
            setFormData(prev => ({ ...prev, code: autoCode }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Le backend attend "nom_permission" et "code_permission"
            const payload = {
                nom: formData.nom || "",
                nom_permission: formData.nom || "",
                code: formData.code || "",
                code_permission: formData.code || "",
                module: formData.module || "",
                description: formData.description || ""
            };

            if (isEditMode) {
                await updatePermission(permission.code, payload);
            } else {
                await createPermission(payload);
            }
            onSuccess(); // Rafraîchit les données
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.code?.[0] || err.message || `Erreur lors de la ${isEditMode ? 'modification' : 'création'} de la permission.`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-header-text">
                        <h2>{isEditMode ? 'Modifier la Permission' : 'Créer une nouvelle Permission'}</h2>
                        <p>{isEditMode ? 'Modifiez les informations de cette permission.' : 'Ajoutez une nouvelle permission au catalogue de l\'application.'}</p>
                    </div>
                    <button className="close-btn" onClick={onClose} type="button">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-form-body">
                        {error && <div className="modal-error">{error}</div>}

                        <p className="form-hint" style={{ marginBottom: '20px' }}>
                            {isEditMode
                                ? "Modifiez les informations de cette permission."
                                : "Cette permission sera ajoutée à la base de données et pourra ensuite être sélectionnée et assignée lors de la création ou de la modification d'un rôle."
                            }
                        </p>

                        <div className="form-card-grid">

                            {/* Ligne 1 : Nom (50%) + Code (50%) */}
                            <div className="rm-field">
                                <label className="rm-label">Nom de la permission <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="nom"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                    onBlur={handleNomBlur}
                                    className="form-input"
                                    placeholder="ex: Lecture plannings..."
                                />
                            </div>

                            <div className="rm-field">
                                <label className="rm-label">Code technique <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="code"
                                    required
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="ex: view_planning..."
                                />
                                <span className="form-hint">Auto-généré à partir du nom.</span>
                            </div>

                            {/* Ligne 2 : Module (100%) */}
                            <div className="col-span-2 rm-field">
                                <label className="rm-label">Module <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="module"
                                    required
                                    value={formData.module}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="ex: planning, security, exploitation..."
                                />
                                <span className="form-hint">Permet de regrouper les permissions par module fonctionnel.</span>
                            </div>

                            {/* Ligne 3 : Description (100%) */}
                            <div className="col-span-2 rm-field">
                                <label className="rm-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="form-input"
                                    rows="3"
                                    placeholder="Veuillez décrire concrètement ce que cette permission autorise..."
                                ></textarea>
                            </div>

                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? "Enregistrement..." : (isEditMode ? "Enregistrer les modifications" : "Ajouter à la base")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PermissionModal;
