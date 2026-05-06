import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../../../../services/userService';
import './Modals.css';

const UserModal = ({ isOpen, onClose, user, roles, entites, onSuccess }) => {
    const isEditMode = !!user;

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        username: '',
        email: '',
        password: '', // Seulement pour l'ajout
        roles: [],
        entite: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && isEditMode) {
            // Pre-fill
            setFormData({
                nom: user.nom || '',
                prenom: user.prenom || '',
                username: user.username || '',
                email: user.email || '',
                password: '', // on ne préremplit jamais le mot de passe
                roles: Array.isArray(user.roles) ? user.roles.map(r => r.id || r) : (user.roles ? [user.roles] : []),
                entite: user.entite || ''
            });
        }
    }, [user, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (e) => {
        // Pour un select multiple ou select simple, adapté selon le backend
        const value = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setFormData(prev => ({ ...prev, roles: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Nettoyage des champs vides
            const payload = { ...formData };
            if (isEditMode) {
                delete payload.password; // On n'update pas le mot de passe ici
            }

            if (isEditMode) {
                await updateUser(user.id, payload);
            } else {
                await createUser(payload);
            }
            onSuccess(); // Rafraîchir
            onClose(); // Fermer modale
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditMode ? "Modifier l'utilisateur" : "Créer un utilisateur"}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="modal-error">{error}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom <span className="text-danger">*</span></label>
                            <input type="text" name="nom" required value={formData.nom} onChange={handleChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label>Prénom <span className="text-danger">*</span></label>
                            <input type="text" name="prenom" required value={formData.prenom} onChange={handleChange} className="form-input" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom d'utilisateur <span className="text-danger">*</span></label>
                            <input type="text" name="username" required value={formData.username} onChange={handleChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label>Email <span className="text-danger">*</span></label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="form-input" />
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="form-group">
                            <label>Mot de passe provisoire <span className="text-danger">*</span></label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="form-input" />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Rôle(s) <span className="text-danger">*</span></label>
                        <select name="roles" multiple value={formData.roles} onChange={handleRoleChange} className="form-input" required size="3">
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.nom}</option>
                            ))}
                        </select>
                        <small className="form-hint">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs rôles.</small>
                    </div>

                    <div className="form-group">
                        <label>Entité Métier</label>
                        <select name="entite" value={formData.entite} onChange={handleChange} className="form-input">
                            <option value="">-- Aucune --</option>
                            {entites.map(e => (
                                <option key={e.id} value={e.id}>{e.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? "Enregistrement..." : (isEditMode ? "Mettre à jour" : "Créer")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
