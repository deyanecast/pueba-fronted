export interface ComboProduct {
    productoId: number;
    cantidad: number;
}

export interface Combo {
    comboId?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    productos: ComboProduct[];
    estaActivo?: boolean;
    fechaCreacion?: string;
}

export interface CreateComboDTO {
    nombre: string;
    descripcion: string;
    precio: number;
    productos: ComboProduct[];
} 