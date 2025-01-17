import axios from 'axios';

const isProduction = import.meta.env.PROD;
const baseURL = isProduction 
  ? 'https://pueba-backend.onrender.com/api'
  : '/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000 // 15 segundos
});

// Interceptor para manejar errores
api.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            console.error('La solicitud tardó demasiado tiempo');
        }
        return Promise.reject(error);
    }
);

export default api; 