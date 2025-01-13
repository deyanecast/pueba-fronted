import api from './api.config';
import { Venta, ReporteVentas } from './ProductService';

export const VentaService = {
    // Get all sales
    getAll: () => api.get('/api/ventas'),

    // Get sale by ID
    getById: (id: number) => api.get(`/api/ventas/${id}`),

    // Create new sale
    create: (venta: Omit<Venta, 'ventaId'>) => 
        api.post('/api/ventas', venta),

    // Get sales report by date range
    getReporte: (fechaInicio: string, fechaFin: string): Promise<ReporteVentas> => 
        api.get('/api/ventas/reporte', { 
            params: { fechaInicio, fechaFin } 
        }),

    // Get today's sales
    getVentasHoy: () => 
        api.get('/api/ventas/hoy'),

    // Get monthly sales
    getVentasMes: () => 
        api.get('/api/ventas/mes'),
        
    // Get sales by type (product or combo)
    getVentasPorTipo: (tipo: 'Producto' | 'Combo', fechaInicio: string, fechaFin: string) => 
        api.get('/api/ventas/por-tipo', { 
            params: { tipo, fechaInicio, fechaFin } 
        })
}; 