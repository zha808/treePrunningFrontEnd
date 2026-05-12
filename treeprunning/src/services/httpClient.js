import axios from 'axios';
import authService from './authService'

const http = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: { "Access-Control-Allow-Origin": "*" }
});

http.interceptors.request.use(async (config) => {
  try {
    // attempt to refresh token if it's close to expiring
    const token = await authService.updateToken(10).catch(() => authService.getToken());
    const t = token || authService.getToken();
    if (t) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${t}`;
    }
  } catch (e) {
    // ignore and continue without token
    console.warn('Could not attach token to request', e);
  }
  return config;
}, (error) => Promise.reject(error));

export default http;
