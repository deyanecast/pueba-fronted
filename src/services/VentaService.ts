import api from './api.config';

export interface ItemVentaInput {
    tipoItem: 'Producto' | 'Combo';
    itemId: number;
    cantidad: number;
}

export interface ItemVentaResponse extends ItemVentaInput {
    nombre: string;
    precioUnitario: number;
    subtotal: number;
}

export interface VentaInput {
    cliente: string;
    items: ItemVentaInput[];
    observaciones?: string;
    total: number;
}

export interface VentaResponse {
    ventaId: number;
    cliente: string;
    items: ItemVentaResponse[];
    observaciones: string;
    total: number;
    fechaVenta: string;
}

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface ReporteVentas {
    totalVentas: number;
    montoTotal: number;
}

export const VentaService = {
    // Get all sales
    getAll: () => api.get<VentaResponse[]>('/api/ventas'),

    // Get sale by ID
    getById: (id: number) => api.get<VentaResponse>(`/api/ventas/${id}`),

    // Create new sale
    create: (venta: VentaInput) => api.post<VentaResponse>('/api/ventas', venta),

    // Get sales by date range
    getByDateRange: (range: DateRange) => 
        api.get<VentaResponse[]>('/api/ventas/range', { params: range }),

    // Get total sales by date
    getTotalByDate: (date: string) => 
        api.get<ReporteVentas>('/api/ventas/total/date', { params: { date } })
}; 