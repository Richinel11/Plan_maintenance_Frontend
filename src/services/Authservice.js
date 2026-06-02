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

  // On ne stocke que les données essentielles dans le cookie pour éviter de dépasser
  // la limite de 4KB des cookies navigateurs (les permissions des rôles sont volumineuses).
  const essentialUserData = {
    id: userData.id,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    region: userData.region,
    is_active: userData.is_active,
    is_ldap: userData.is_ldap,
    first_connection: userData.first_connection,
    entite_metier: userData.entite_metier,
    // On garde les rôles SANS leurs permissions détaillées pour réduire la taille
    roles: (userData.roles || []).map(r => ({
      id: r.id,
      nom: r.nom,
      code_role: r.code_role,
      description: r.description,
    })),
  };

  // Stockage cookie (petit) + localStorage (complet) en parallèle
  try {
    Cookies.set('user', JSON.stringify(essentialUserData), { expires: 1 });
  } catch (e) {
    console.warn('Cookie trop grand, stockage dans localStorage uniquement');
  }
  // localStorage comme source de vérité (pas de limite de taille)
  localStorage.setItem('user', JSON.stringify(essentialUserData));

  console.log('User data stored:', essentialUserData);

  return {
    ...data,
    user: userData
  };
};

export const logout = () => {
  Cookies.remove('user');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('activeRole');
  Cookies.remove('activeRoleName');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  // Essaie d'abord le cookie, puis fallback sur localStorage
  const cookieUser = Cookies.get('user');
  if (cookieUser) {
    try { return JSON.parse(cookieUser); } catch (e) {}
  }
  const lsUser = localStorage.getItem('user');
  if (lsUser) {
    try { return JSON.parse(lsUser); } catch (e) {}
  }
  return null;
};

export const changePassword = async (password) => {
  const response = await api.post('users/change-password/', {new_password: password});
  return response.data;
};