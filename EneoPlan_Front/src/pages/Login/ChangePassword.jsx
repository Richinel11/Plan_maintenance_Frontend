import React, { useState } from 'react';
import './Login.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import api from '../../API/axiosInstance';

const ChangePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Récupère l'id de l'utilisateur transmis depuis LoginPage
    const location = useLocation();
    const userId = location.state?.userId;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validations locales (inchangées)
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/users/${userId}/set_password/`, { password });
            setSuccess(true);

            // Redirection vers login après succès
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Première connexion"
            subtitle="Veuillez définir votre mot de passe pour sécuriser votre compte ENEOPLAN"
        >
            {success ? (
                <div className="success-message">
                    Votre mot de passe a été mis à jour avec succès. Redirection...
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="input-group">
                        <label className="input-label">Nouveau mot de passe</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">lock</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                placeholder="Entrez votre nouveau mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="material-symbols-outlined input-icon-right"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "visibility_off" : "visibility"}
                            </span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirmer le mot de passe</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">lock_reset</span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="input-field"
                                placeholder="Confirmez votre nouveau mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <span
                                className="material-symbols-outlined input-icon-right"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "visibility_off" : "visibility"}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn uppercase" disabled={loading}>
                        {loading ? 'Enregistrement...' : 'ENREGISTRER'}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default ChangePassword;