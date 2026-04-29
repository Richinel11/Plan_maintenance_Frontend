import React, { useState } from 'react';
import { patchUser } from '../../../../services/userService';
import './Modals.css';

const ConfirmModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isActive = user?.is_active;

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            // Si actif → désactiver (is_active: false), si inactif → activer (is_active: true)
            if (isActive) {
                await patchUser(user.id, { is_active: false });
            } else {
                await patchUser(user.id, { is_active: true });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.error || "Une erreur s'est produite.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content confirm-content">
                <div className="modal-header">
                    <h2>Confirmation</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="modal-body">
                    {error && <div className="modal-error">{error}</div>}
                    <div className="confirm-icon-wrapper">
                        <span className="material-symbols-outlined confirm-icon">
                            {isActive ? 'warning' : 'check_circle'}
                        </span>
                    </div>
                    <p className="confirm-text">
                        Voulez-vous vraiment <strong>{isActive ? 'désactiver' : 'activer'}</strong> l'utilisateur <br/>
                        <span className="highlight-user">{user.nom} {user.prenom} ({user.username})</span> ?
                    </p>
                    {isActive && (
                        <p className="confirm-warning">Cet utilisateur ne pourra plus se connecter à l'application.</p>
                    )}
                </div>

                <div className="modal-actions confirm-actions">
                    <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                        Annuler
                    </button>
                    <button 
                        type="button" 
                        className={`primary-btn ${isActive ? 'danger-btn' : 'success-btn'}`} 
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Patientez..." : "Oui, confirmer"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
