import React, { useState } from 'react';
import { createPermission } from '../../../../services/userService';
import '../../UserManagement/components/Modals.css';

const PermissionModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        category: '',
        action: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await createPermission(formData);
            onSuccess(); // Rafraîchit les données dans la page Rôles
            onClose();
        } catch (err) {
            setError(err.message || "Erreur lors de la création de la permission.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth: '500px'}}>
                <div className="modal-header">
                    <h2>Créer une nouvelle Permission</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="modal-error">{error}</div>}
                    
                    <p className="form-hint" style={{marginBottom: '20px'}}>
                        Cette permission sera ajoutée à la base de données et pourra ensuite être sélectionnée et assignée lors de la création ou de la modification d'un rôle.
                    </p>

                    <div className="form-group">
                        <label>Catégorie <span className="text-danger">*</span></label>
                        <input 
                            type="text" 
                            name="category" 
                            required 
                            value={formData.category} 
                            onChange={handleChange} 
                            className="form-input" 
                            placeholder="ex: Plannings, Utilisateurs, Rapports..." 
                        />
                        <span className="form-hint">Permet de regrouper les permissions visuellement.</span>
                    </div>

                    <div className="form-group">
                        <label>Action <span className="text-danger">*</span></label>
                        <input 
                            type="text" 
                            name="action" 
                            required 
                            value={formData.action} 
                            onChange={handleChange} 
                            className="form-input" 
                            placeholder="ex: Lecture, Création, Exportation..." 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            className="form-input" 
                            rows="2" 
                            placeholder="Veuillez décrire concrètement ce que cette permission autorise..."
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? "Création..." : "Ajouter à la base"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PermissionModal;
