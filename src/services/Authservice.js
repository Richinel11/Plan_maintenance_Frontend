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
  Cookies.set('user', JSON.stringify(userResponse.data), { expires: 1 });

  return {
    ...data,
    user: userResponse.data
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

export const changePassword = async (data) => {
  const response = await api.post('users/change-password/', data);
  return response.data;
};
