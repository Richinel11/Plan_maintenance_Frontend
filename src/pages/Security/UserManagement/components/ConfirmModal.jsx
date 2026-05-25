import React, { useState } from 'react';
import { deactivateUser, activateUser } from '../../../../services/userService';
import { toast } from 'sonner';
import './Modals.css';

const ConfirmModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const isActive = user?.is_active;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (isActive) {
                await deactivateUser(user.id);
                toast.success(`Utilisateur "${user.username}" désactivé avec succès.`);
            } else {
                await activateUser(user.id);
                toast.success(`Utilisateur "${user.username}" réactivé avec succès.`);
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || err.response?.data?.error || "Une erreur s'est produite.");
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
                    <div className="confirm-icon-wrapper">
                        <span className="material-symbols-outlined confirm-icon">
                            {isActive ? 'person_off' : 'how_to_reg'}
                        </span>
                    </div>
                    <p className="confirm-text">
                        Voulez-vous vraiment <strong>{isActive ? 'désactiver' : 'réactiver'}</strong> l'utilisateur <br/>
                        <span className="highlight-user">{user.last_name} {user.first_name} ({user.username})</span> ?
                    </p>
                    {isActive ? (
                        <p className="confirm-warning">
                            Son statut passera à <strong>Inactif</strong>. Il ne pourra plus se connecter à l'application.
                        </p>
                    ) : (
                        <p className="confirm-success-info">
                            Son statut passera à <strong>Actif</strong>. Il pourra à nouveau se connecter.
                        </p>
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
                        {loading ? "Patientez..." : (isActive ? "Désactiver" : "Réactiver")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
