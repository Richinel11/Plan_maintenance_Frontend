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
                 if (err.response.status === 401) {
                     setError('Identifiant ou mot de passe incorrect.');
                 } else if (err.response.status === 404) {
                     setError('Profil utilisateur introuvable. Ce compte n\'a pas de profil applicatif (superuser Django ?).');
                 } else {
                     setError(`Erreur serveur (${err.response.status}). Vérifiez que le backend est bien démarré.`);
                 }
             } else if (err.request) {
                 const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
                 setError(`Impossible de joindre le serveur. Vérifiez que le backend tourne sur ${apiUrl}.`);
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