import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://10.250.90.90:8000/api/',
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur pour injecter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de session (ex: token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = Cookies.get('accessToken');
      // Ne pas déconnecter le compte de test local (token bidon)
      if (token === 'test.dGVzdA.test') {
        return Promise.reject(error);
      }
      // Si on reçoit un 401 (Non autorisé), on nettoie la session et on redirige
      Cookies.remove('user');
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('activeRole');
      Cookies.remove('activeRoleName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default api;