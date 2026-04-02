import api from '../api/axiosInstance';

export const login = async (username, password) => {
  const { data } = await api.post('/users/login/', { username, password });
  sessionStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  sessionStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};