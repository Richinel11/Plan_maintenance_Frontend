import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { login } from '../../services/Authservice';
import { getUserById } from '../../services/userService';
import { toast } from 'sonner';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await login(identifier, password);
            const user = await getUserById(data.user.id);
            console.log(data);
            console.log(user);

            if (!user.is_ldap && user.first_connection) {
                navigate('/change-password', { state: { userId: user.id } });
            } else {
                navigate('/select-role');
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            if (err.response) {
                const backendData = err.response.data;
                let backendMessage = null;
                
                if (backendData && backendData.detail) {
                    backendMessage = backendData.detail;
                } else if (backendData && backendData.error) {
                    backendMessage = backendData.error;
                } else if (backendData && backendData.non_field_errors) {
                    backendMessage = backendData.non_field_errors[0];
                } else if (typeof backendData === 'object') {
                    const firstKey = Object.keys(backendData)[0];
                    if (firstKey && Array.isArray(backendData[firstKey])) {
                        backendMessage = backendData[firstKey][0];
                    } else if (firstKey && typeof backendData[firstKey] === 'string') {
                        backendMessage = backendData[firstKey];
                    }
                } else if (typeof backendData === 'string' && backendData.length < 100) {
                    backendMessage = backendData;
                }

                if (backendMessage) {
                    toast.error(backendMessage);
                } else {
                    if (err.response.status === 400) {
                        toast.error('Format des identifiants invalide. Veuillez vérifier votre saisie.');
                    } else if (err.response.status === 401) {
                        toast.error('Identifiant ou mot de passe incorrect.');
                    } else if (err.response.status === 403) {
                        toast.error('Votre compte est désactivé ou vous n\'avez pas la permission de vous connecter.');
                    } else if (err.response.status === 404) {
                        toast.error('Profil introuvable. Ce compte existe mais ne possède pas de profil applicatif valide dans SocadelPlan.');
                    } else if (err.response.status >= 500) {
                        toast.error('Le serveur d\'authentification est indisponible (Erreur ' + err.response.status + '). Veuillez réessayer plus tard.');
                    } else {
                        toast.error(`Erreur de connexion inattendue (Code ${err.response.status}).`);
                    }
                }
            } else if (err.request) {
                toast.error(err.message);
            } else {
                toast.error('Erreur inattendue : ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Connexion"
            subtitle="Accédez à votre espace SocadelPLAN"
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