import api from './api.config';
import { Product } from './ProductService';
import { Combo } from './combo.types';

export interface DetalleVenta {
    tipoItem: 'PRODUCTO' | 'COMBO';
    productoId?: number;
    comboId?: number;
    cantidadLibras: number;
}

export interface VentaInput {
    cliente: string;
    observaciones: string;
    tipoVenta: 'NORMAL';
    detalles: DetalleVenta[];
}

export interface VentaResponse {
    ventaId: number;
    cliente: string;
    observaciones: string;
    fechaVenta: string;
    montoTotal: number;
    tipoVenta: string;
    detalles: Array<{
        detalleVentaId: number;
        tipoItem: 'PRODUCTO' | 'COMBO';
        producto: Product | null;
        combo: Combo | null;
        cantidadLibras: number;
        precioUnitario: number;
        subtotal: number;
    }>;
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