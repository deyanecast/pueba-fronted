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

export interface Combo {
    comboId?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    productos: {
        productoId: number;
        cantidad: number;
    }[];
    estaActivo?: boolean;
    fechaCreacion?: string;
}

export interface ComboProducto {
    productoId: number;
    cantidad: number;
    nombreProducto?: string;
    precioUnitario?: number;
    subtotal?: number;
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
    search: (params: ProductSearchParams) => api.get('/api/productos/buscar', { params }),

    // Get low stock products
    getLowStock: () => api.get('/api/productos/bajo-stock'),

    // Get product sales report
    getVentasReporte: (fechaInicio: string, fechaFin: string) => 
        api.get('/api/productos/reporte-ventas', { 
            params: { fechaInicio, fechaFin } 
        }),
        
    // Helper function to check if stock is low (below 5 pounds)
    esBajoStock: (cantidadLibras: number): boolean => cantidadLibras <= 5
}; 