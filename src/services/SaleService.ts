import api from './api.config';

export interface SaleItem {
    tipoItem: 'Producto' | 'Combo';
    itemId: number;
    cantidad: number;
}

export interface Sale {
    id?: number;
    cliente: string;
    items: SaleItem[];
    observaciones?: string;
    fecha?: string;
}

export interface SaleReportFilters {
    fechaInicio?: string;
    fechaFin?: string;
    cliente?: string;
}

export const SaleService = {
    // Get all sales
    getAll: () => api.get('/api/ventas'),

    // Get sale by ID
    getById: (id: number) => api.get(`/api/ventas/${id}`),

    // Create new sale
    create: (sale: Sale) => api.post('/api/ventas', sale),

    // Generate sales report
    generateReport: (filters: SaleReportFilters) => 
        api.get('/api/ventas/reporte', { params: filters })
}; 