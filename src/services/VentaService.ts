import api from './api.config';
import { Product } from './ProductService';
import { Combo } from './combo.types';

export interface DetalleVentaProducto {
    tipoItem: 'PRODUCTO';
    productoId: number;
    cantidadLibras: number;
}

export interface DetalleVentaCombo {
    tipoItem: 'COMBO';
    comboId: number;
    cantidadLibras: number;
}

export type DetalleVenta = DetalleVentaProducto | DetalleVentaCombo;

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

export interface VentasRangeResponse {
    ventas: VentaResponse[];
    startDate: string;
    endDate: string;
}

export interface DashboardData {
    totalVentasHoy: number;
    ventasRecientes: VentaResponse[];
    productosStockBajo: Product[];
}

export const VentaService = {
    // Get all sales with optional date filter
    getAll: (date?: string) => api.get<VentaResponse[]>('/api/ventas', {
        params: date ? { date } : undefined
    }),

    // Get sale by ID
    getById: (id: number) => api.get<VentaResponse>(`/api/ventas/${id}`),

    // Create new sale
    create: (venta: VentaInput) => api.post<VentaResponse>('/api/ventas', venta),

    // Get sales by date range
    getByDateRange: (range: DateRange) => 
        api.get<VentasRangeResponse>('/api/ventas/range', { 
            params: range 
        }),

    // Get total sales by date
    getTotalByDate: (date: string) => 
        api.get<{ total: number }>('/api/ventas/total/date', { 
            params: { date }
        }),

    // Get dashboard data
    getDashboardData: () => api.get<DashboardData>('/api/ventas/dashboard')
}; 