import { Product } from '../services/ProductService';
import { Combo } from '../services/combo.types';

export interface CartItem {
    tipo: 'PRODUCTO' | 'COMBO';
    item: Product | Combo;
    cantidadLibras: number;
    subtotal: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
    cliente: string;
    observaciones?: string;
}     