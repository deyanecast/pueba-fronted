import api from './api.config';
import { Combo, CreateComboDTO } from './combo.types';

class ComboService {
    // Get all combos
    static getAll() {
        return api.get<Combo[]>('/api/combos');
    }

    // Get combo by ID
    static getById(id: number) {
        return api.get<Combo>(`/api/combos/${id}`);
    }

    // Get active combos
    static getActive() {
        return api.get<Combo[]>('/api/combos/active');
    }

    // Create new combo
    static create(combo: CreateComboDTO) {
        return api.post<Combo>('/api/combos', combo);
    }

    // Update combo
    static update(id: number, combo: CreateComboDTO) {
        return api.put<Combo>(`/api/combos/${id}`, combo);
    }

    // Update combo status
    static updateStatus(id: number) {
        return api.patch<Combo>(`/api/combos/${id}/status`);
    }

    // Delete combo
    static delete(id: number) {
        return api.delete<void>(`/api/combos/${id}`);
    }

    // Validate combo stock
    static validateStock(id: number) {
        return api.get<{ hasStock: boolean }>(`/api/combos/${id}/validate-stock`);
    }

    // Calculate combo total
    static calculateTotal(id: number) {
        return api.get<{ total: number }>(`/api/combos/${id}/calculate-total`);
    }
}

export default ComboService; 