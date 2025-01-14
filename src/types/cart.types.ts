import { Product } from '../services/ProductService';
import { Combo } from '../services/ProductService';

export interface CartItem {
    tipo: 'Producto' | 'Combo';
    item: Product | Combo;
    cantidad: number;
    subtotal: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
    cliente: string;
    observaciones?: string;
} 