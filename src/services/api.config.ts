import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

export const API_BASE_URL = 'https://pueba-backend.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false
});

// Configure retry mechanism
axiosRetry(api, { 
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000; // Esperar 1s, 2s, 3s entre reintentos
    },
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error);
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        console.log('Request URL:', config.url);
        console.log('Request Data:', config.data);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    response => {
        console.log('Response:', response.data);
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            console.error('Error Data:', error.response.data);
            console.error('Error Status:', error.response.status);
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor. La petición sigue en proceso...');
        }
        return Promise.reject(error);
    }
);

export default api; 