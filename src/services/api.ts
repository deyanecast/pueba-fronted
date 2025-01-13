import axios from 'axios';
import { Product, Sale } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-render-backend-url.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getAllProducts = () => api.get<Product[]>('/api/productos');
export const addProduct = (product: Product) => api.post<Product>('/api/productos', product);
export const updateProduct = (id: string, product: Product) => api.put<Product>(`/api/productos/${id}`, product);

// Sales
export const getSalesData = () => api.get<Sale[]>('/api/ventas');

export default api; 