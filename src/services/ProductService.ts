import api from './api.config';

export interface Product {
    productoId?: number;
    nombre: string;
    cantidadLibras: number;
    precioPorLibra: number;
    tipoEmpaque: string;
    estaActivo?: boolean;
    ultimaActualizacion?: string;
    valorTotal?: number;
}

export interface ProductSearchParams {
    nombre?: string;
    precioMin?: number;
    precioMax?: number;
    estado?: boolean;
}

export const ProductService = {
    // Get all products
    getAll: () => api.get('/api/productos'),

    // Get product by ID
    getById: (id: number) => api.get(`/api/productos/${id}`),

    // Create new product
    create: (product: Omit<Product, 'productoId' | 'ultimaActualizacion' | 'valorTotal'>) => 
        api.post('/api/productos', product),

    // Update product
    update: (id: number, product: Partial<Product>) => 
        api.put(`/api/productos/${id}`, product),

    // Delete product
    delete: (id: number) => api.delete(`/api/productos/${id}`),

    // Toggle product state
    toggleState: (id: number) => api.patch(`/api/productos/${id}/toggle-estado`),

    // Search products with filters
    search: (params: ProductSearchParams) => api.get('/api/productos/buscar', { params })
}; 