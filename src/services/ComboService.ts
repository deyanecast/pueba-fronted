import api from './api.config';

export interface ComboProduct {
    productoId: number;
    cantidad: number;
}

export interface Combo {
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    productos: ComboProduct[];
    estado?: boolean;
}

export const ComboService = {
    // Get all combos
    getAll: () => api.get('/api/combos'),

    // Get combo by ID
    getById: (id: number) => api.get(`/api/combos/${id}`),

    // Create new combo
    create: (combo: Combo) => api.post('/api/combos', combo),

    // Update combo
    update: (id: number, combo: Combo) => api.put(`/api/combos/${id}`, combo),

    // Delete combo
    delete: (id: number) => api.delete(`/api/combos/${id}`),

    // Toggle combo state
    toggleState: (id: number) => api.patch(`/api/combos/${id}/toggle-estado`)
}; 