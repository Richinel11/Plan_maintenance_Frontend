import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { login } from '../../services/Authservice';
import { getUserById } from '../../services/userService';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(identifier, password);
            const user = await getUserById(data.user.id);
            console.log(data);
            console.log(user);

            // Si c'est un compte Active Directory (LDAP), ils ne changent jamais leur mot de passe ici !
            // Sinon (compte externe), on vérifie si c'est la première connexion.
            if (!user.ldap_req && user.first_connection) {
                navigate('/change-password', { state: { userId: user.id } });
            } else {
                navigate('/select-role');
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            if (err.response) {
                const backendData = err.response.data;
                let backendMessage = null;
                
                // Tente d'extraire le message d'erreur depuis les formats standards de Django DRF
                if (backendData && backendData.detail) {
                    backendMessage = backendData.detail;
                } else if (backendData && backendData.error) {
                    backendMessage = backendData.error;
                } else if (backendData && backendData.non_field_errors) {
                    backendMessage = backendData.non_field_errors[0];
                } else if (typeof backendData === 'object') {
                    // S'il y a d'autres champs d'erreurs (ex: {"username": ["Ce champ est requis"]})
                    const firstKey = Object.keys(backendData)[0];
                    if (firstKey && Array.isArray(backendData[firstKey])) {
                        backendMessage = backendData[firstKey][0];
                    } else if (firstKey && typeof backendData[firstKey] === 'string') {
                        backendMessage = backendData[firstKey];
                    }
                } else if (typeof backendData === 'string' && backendData.length < 100) {
                    backendMessage = backendData;
                }

                // Si on a réussi à extraire le message du backend, on l'affiche
                if (backendMessage) {
                    setError(backendMessage);
                } else {
                    // Fallbacks par défaut liés au contexte de connexion
                    if (err.response.status === 400) {
                        setError('Format des identifiants invalide. Veuillez vérifier votre saisie.');
                    } else if (err.response.status === 401) {
                        setError('Identifiant ou mot de passe incorrect.');
                    } else if (err.response.status === 403) {
                        setError('Votre compte est désactivé ou vous n\'avez pas la permission de vous connecter.');
                    } else if (err.response.status === 404) {
                        setError('Profil introuvable. Ce compte existe mais ne possède pas de profil applicatif valide dans EneoPlan.');
                    } else if (err.response.status >= 500) {
                        setError('Le serveur d\'authentification est indisponible (Erreur ' + err.response.status + '). Veuillez réessayer plus tard.');
                    } else {
                        setError(`Erreur de connexion inattendue (Code ${err.response.status}).`);
                    }
                }
            } else if (err.request) {
                const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
                setError(`Impossible de joindre le serveur. Vérifiez que le backend tourne rellement sur ${apiUrl}.`);
            } else {
                setError('Erreur inattendue : ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Connexion"
            subtitle="Accédez à votre espace ENEOPLAN"
        >
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Identifiant</label>
                    <div className="input-wrapper">
                        <span className="material-symbols-outlined input-icon">person</span>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Entrez votre identifiant"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Mot de passe</label>
                    <div className="input-wrapper">
                        <span className="material-symbols-outlined input-icon">lock</span>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="input-field"
                            placeholder="Entrez votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            className="material-symbols-outlined input-icon-right"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </div>
                </div>

                {/* Affichage de l'erreur */}
                {error && (
                    <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '10px' }}>
                        {error}
                    </div>
                )}

                {/* <div className="forgot-password-container">
                    <a href="#" className="forgot-password-link">Mot de passe oublié ?</a>
                </div> */}

                <button type="submit" className="submit-btn uppercase" disabled={loading}>
                    {loading ? 'Connexion...' : 'SE CONNECTER'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;