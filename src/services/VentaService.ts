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
}

export interface VentaResponse {
    ventaId: number;
    cliente: string;
    items: ItemVentaResponse[];
    observaciones: string;
    total: number;
    fechaVenta: string;
}

export interface ReporteVentas {
    totalVentas: number;
    montoTotal: number;
    ventas: VentaResponse[];
}

export const VentaService = {
    // Get all sales
    getAll: () => api.get<VentaResponse[]>('/api/ventas'),

    // Get sale by ID
    getById: (id: number) => api.get<VentaResponse>(`/api/ventas/${id}`),

    // Create new sale
    create: (venta: VentaInput) => api.post<VentaResponse>('/api/ventas', venta),

    // Get sales report
    getReporte: () => api.get<ReporteVentas>('/api/ventas/reporte')
}; 