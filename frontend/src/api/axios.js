// src/api/axios.js
// Central axios instance - all API calls go through here
// Automatically attaches JWT token to every request

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:5000/api
});

// ---- REQUEST INTERCEPTOR ----
// Before every request: attach token from localStorage
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ---- RESPONSE INTERCEPTOR ----
// If token expired (401), log out automatically
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
