import api from './api.config';

export interface Product {
    productoId?: number;
    nombre: string;
    cantidadLibras: number;
    precioPorLibra: number;
    tipoEmpaque: string;
    estaActivo: boolean;
    valorTotal?: number;
    ultimaActualizacion?: string;
}

export interface ProductSearchParams {
    nombre?: string;
    precioMin?: number;
    precioMax?: number;
    estado?: boolean;
    bajoStock?: boolean;
}

export const ProductService = {
    // Get all products
    getAll: () => api.get<Product[]>('/api/productos'),

    // Get product by ID
    getById: (id: number) => api.get<Product>(`/api/productos/${id}`),

    // Get active products
    getActive: () => api.get<Product[]>('/api/productos/active'),

    // Create new product
    create: (product: Omit<Product, 'productoId' | 'ultimaActualizacion' | 'valorTotal'>) => 
        api.post<Product>('/api/productos', product),

    // Update product
    update: (id: number, product: Partial<Product>) => 
        api.put<Product>(`/api/productos/${id}`, product),

    // Update product status
    updateStatus: (id: number) => api.patch<Product>(`/api/productos/${id}/status`),

    // Validate product stock
    validateStock: (id: number) => api.get<{ hasStock: boolean }>(`/api/productos/${id}/validate-stock`),

    // Update product stock
    updateStock: (id: number, stock: number) => api.patch<Product>(`/api/productos/${id}/stock`, { stock }),

    // Search products with filters
    search: (params: ProductSearchParams) => api.get<Product[]>('/api/productos/buscar', { params }),

    // Helper function to check if stock is low (below 5 pounds)
    esBajoStock: (cantidadLibras: number): boolean => cantidadLibras <= 5
}; 