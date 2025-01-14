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

    // Get active combos
    static getActive() {
        return api.get('/api/combos/active');
    }

    // Create new combo
    static create(combo: Omit<Combo, 'comboId' | 'fechaCreacion'>) {
        return api.post('/api/combos', combo);
    }

    // Update combo status
    static updateStatus(id: number) {
        return api.patch(`/api/combos/${id}/status`);
    }

    // Validate combo stock
    static validateStock(id: number) {
        return api.get(`/api/combos/${id}/validate-stock`);
    }

    // Calculate combo total
    static calculateTotal(id: number) {
        return api.get(`/api/combos/${id}/calculate-total`);
    }
}

export default ComboService; 