import api from '../API/axiosInstance';
import Cookies from 'js-cookie';

const decodJWT = (token) =>{
  const payload = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payload));
  return decodedPayload;
};

export const login = async (username, password) => {
  const { data } = await api.post('users/login/', { username, password });

    // On stocke les tokens dans les cookies
  if (data.access) {
    Cookies.set('accessToken', data.access, { expires: 1 });
  }
  if (data.refresh) {
    Cookies.set('refreshToken', data.refresh, { expires: 7 });
  }

  const tokenPayload = decodJWT(data.access);
  const userId = tokenPayload.user_id;
  console.log('token decoder', tokenPayload);
  console.log('user id', userId);

  const userResponse = await api.get(`users/find-user/${userId}/`);
  const userData = userResponse.data;
  Cookies.set('user', JSON.stringify(userData), { expires: 1 });

  // Lier le "service" (entité métier) pour les formulaires Plannings / Travaux
  if (userData && userData.entite_metier) {
      let serviceName = '';
      if (Array.isArray(userData.entite_metier) && userData.entite_metier.length > 0) {
          serviceName = userData.entite_metier[0].name || userData.entite_metier[0].nom || userData.entite_metier[0];
      } else if (typeof userData.entite_metier === 'object') {
          serviceName = userData.entite_metier.name || userData.entite_metier.nom;
      } else {
          serviceName = userData.entite_metier;
      }
      
      if (serviceName && typeof serviceName === 'string') {
          Cookies.set('service', serviceName.toLowerCase(), { expires: 1 });
      }
  }

  return {
    ...data,
    user: userData
  }
};

export const logout = () => {
  Cookies.remove('user');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('activeRole');
  Cookies.remove('activeRoleName');
};

export const getCurrentUser = () => {
  const user = Cookies.get('user');
  return user ? JSON.parse(user) : null;
};

export const changePassword = async (password) => {
  const response = await api.post('users/change-password/', {new_password: password});
  return response.data;
};
