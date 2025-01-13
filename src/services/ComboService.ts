import api from './api.config';
import { Combo } from './ProductService';

class ComboService {
    // Get all combos
    static getAll() {
        return api.get('/api/combos');
    }

    // Get combo by ID
    static getById(id: number) {
        return api.get(`/api/combos/${id}`);
    }

    // Create new combo
    static create(combo: Omit<Combo, 'comboId' | 'fechaCreacion'>) {
        return api.post('/api/combos', combo);
    }

    // Update combo
    static update(id: number, combo: Partial<Combo>) {
        return api.put(`/api/combos/${id}`, combo);
    }

    // Delete combo
    static delete(id: number) {
        return api.delete(`/api/combos/${id}`);
    }

    // Toggle combo state
    static toggleState(id: number) {
        return api.patch(`/api/combos/${id}/toggle-estado`);
    }

    // Get combo sales report
    static getVentasReporte(fechaInicio: string, fechaFin: string) {
        return api.get('/api/combos/reporte-ventas', { 
            params: { fechaInicio, fechaFin } 
        });
    }
}

export default ComboService; 