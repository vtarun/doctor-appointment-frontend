import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token && config.headers){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        const isAuthRoute = originalRequest?.url?.includes('/auth/login') || 
                            originalRequest?.url?.includes('/auth/register');
        if(error.response?.status === 401 && !isAuthRoute){
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);