import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

export const API_BASE_URL = 'https://pueba-backend.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false, // Disable sending cookies for cross-origin requests
    timeout: 60000, // Increase timeout to 30 seconds since Render might need time to wake up
});

// Configure retry mechanism
axiosRetry(api, { 
    retries: 3,
    retryDelay: (retryCount: number) => {
        return retryCount * 2000; // Wait 2s, 4s, 6s between retries
    },
    retryCondition: (error: AxiosError) => {
        // Retry on timeout errors and network errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               error.code === 'ECONNABORTED';
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        console.log('Making request to:', config.url);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        if (error.message === 'Network Error') {
            console.error('No se puede conectar al servidor. Por favor, verifique su conexión y que el servidor esté funcionando.');
        } else if (error.code === 'ERR_NAME_NOT_RESOLVED') {
            console.error('No se puede resolver el nombre del servidor. Por favor, verifique la URL del backend.');
        } else if (error.code === 'ECONNABORTED') {
            console.error('La conexión ha excedido el tiempo de espera. El servidor puede estar iniciándose, por favor espere un momento e intente nuevamente.');
        }
        return Promise.reject(error);
    }
);

export default api; 