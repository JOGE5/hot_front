import api from '../api/axios';

export const auth = {
  get token() {
    return localStorage.getItem('token');
  },

  get user() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.token;
  },

  async login(credentials) {
    const response = await api.post('/login', credentials);

    const token = response.data.token;
    const user = response.data.user;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};