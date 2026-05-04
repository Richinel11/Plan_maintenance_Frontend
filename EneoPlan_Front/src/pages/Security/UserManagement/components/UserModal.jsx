import React, { useState, useEffect } from 'react';
import { createUser, updateUser , update_userrole } from '../../../../services/userService';
import './Modals.css';

const UserModal = ({ isOpen, onClose, user, roles, entites, onSuccess }) => {
    const isEditMode = !!user;

    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        username: '',
        email: '',
        password: '',
        code_role: '',
        entite_metier: '',
        is_ldap: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [roleSearch, setRoleSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (user && isEditMode) {
                const firstRole = user.roles?.[0]?.code_role || '';
                setFormData({
                    last_name: user.last_name || '',
                    first_name: user.first_name || '',
                    username: user.username || '',
                    email: user.email || '',
                    password: '',
                    code_role: firstRole,
                    entite_metier: user.entite_metier?.id || user.entite_metier || '',
                    is_ldap: user.is_ldap || false
                });
            } else {
                setFormData({
                    last_name: '',
                    first_name: '',
                    username: '',
                    email: '',
                    password: '',
                    code_role: '',
                    entite_metier: '',
                    is_ldap: false
                });
            }
            setError(null);
            setRoleSearch('');
        }
    }, [isOpen, user, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleToggle = (code) => {
        setFormData(prev => ({ ...prev, code_role: prev.code_role === code ? '' : code }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isEditMode) {
                const payload = {
                    username: formData.username,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    entite_metier: formData.entite_metier,
                    is_ldap: formData.is_ldap,

                };
                await updateUser(user.id, payload);
                const payload2 = {
                    role: formData.code_role
                };
                await update_userrole(user.id, payload2);
            } else {
                const payload = {
                    username: formData.username,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    code_role: formData.code_role,
                    entite_metier: formData.entite_metier,
                    is_ldap: formData.is_ldap
                };
                if (!formData.is_ldap && formData.password) {
                    payload.password = formData.password;
                }
                await createUser(payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            const apiError = err.response?.data;
            if (apiError && typeof apiError === 'object') {
                const messages = Object.entries(apiError)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
                    .join(' | ');
                setError(messages);
            } else {
                setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredRoles = (roles || []).filter(r =>
        r.nom?.toLowerCase().includes(roleSearch.toLowerCase()) ||
        r.code_role?.toLowerCase().includes(roleSearch.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-header-text">
                        <h2>{isEditMode ? "Modifier l'utilisateur" : "Créer un utilisateur"}</h2>
                        <p>{isEditMode ? "Modifiez les informations de l'utilisateur." : "Remplissez les informations pour ajouter un nouvel utilisateur au système."}</p>
                    </div>
                    <button className="close-btn" onClick={onClose} type="button">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-form-body">
                        {error && <div className="modal-error">{error}</div>}

                        {/* Infos de base */}
                        <div className="form-card">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nom <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        required
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Ex: Dupont"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Prénom <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        required
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Ex: Jean"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Adresse mail <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="exemple@mjn.fr"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nom d'utilisateur <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="j.dupont"
                                    />
                                </div>
                            </div>

                            {entites && entites.length > 0 && (
                                <div className="form-group">
                                    <label>Entité Métier</label>
                                    <select
                                        name="entite_metier"
                                        value={formData.entite_metier}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="">-- Sélectionner une entité --</option>
                                        {entites.map(e => (
                                            <option key={e.id} value={e.id}>{e.name || e.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Rôles */}
                        <div className="form-card">
                            <div className="checklist-section">
                                <div className="checklist-header">
                                    <label>
                                        Rôles associés
                                        {formData.code_role && (
                                            <span className="checklist-counter" style={{marginLeft: '8px'}}>1 sélectionné</span>
                                        )}
                                    </label>
                                    <div className="checklist-search">
                                        <span className="material-symbols-outlined">search</span>
                                        <input
                                            type="text"
                                            placeholder="Rechercher un rôle..."
                                            value={roleSearch}
                                            onChange={e => setRoleSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="checklist-box">
                                    {filteredRoles.length === 0 ? (
                                        <div className="checklist-empty">Aucun rôle trouvé</div>
                                    ) : filteredRoles.map(r => {
                                        const isChecked = formData.code_role === r.code_role;
                                        return (
                                            <div
                                                key={r.code_role}
                                                className="checklist-item"
                                                onClick={() => handleRoleToggle(r.code_role)}
                                            >
                                                <span className="checklist-item-label">{r.nom}</span>
                                                <div className={`checklist-checkbox ${isChecked ? 'checked' : ''}`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Auth */}
                        <div className="toggle-card">
                            <div className="toggle-row">
                                <div className="toggle-label-group">
                                    <strong>Authentification via AD</strong>
                                    <span>Synchroniser avec l'Active Directory</span>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_ldap}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            is_ldap: e.target.checked,
                                            password: e.target.checked ? '' : prev.password
                                        }))}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>

                            {!formData.is_ldap && !isEditMode && (
                                <div className="form-group" style={{marginTop: 4}}>
                                    <label>Mot de passe <span className="text-danger">*</span></label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required={!formData.is_ldap}
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="••••••••"
                                        />
                                        <span
                                            className="material-symbols-outlined password-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Enregistrement...' : (isEditMode ? 'Enregistrer' : 'Créer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
