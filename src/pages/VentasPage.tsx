import React, { useState, useEffect } from 'react';
import { Product, ProductService } from '../services/ProductService';
import { Combo } from '../services/ProductService';
import ComboService from '../services/ComboService';
import { VentaService, VentaInput } from '../services/VentaService';
import { Cart, CartItem } from '../types/cart.types';

const VentasPage = () => {
    const [activeTab, setActiveTab] = useState<'productos' | 'combos'>('productos');
    const [productos, setProductos] = useState<Product[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [cart, setCart] = useState<Cart>({
        items: [],
        total: 0,
        cliente: '',
        observaciones: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProductos();
        loadCombos();
    }, []);

    const loadProductos = async () => {
        try {
            const response = await ProductService.getActive();
            setProductos(response.data);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setError('Error al cargar productos');
        }
    };

    const loadCombos = async () => {
        try {
            const response = await ComboService.getActive();
            setCombos(response.data);
        } catch (error) {
            console.error('Error al cargar combos:', error);
            setError('Error al cargar combos');
        } finally {
            setLoading(false);
        }
    };

    const validateStock = async (item: Product | Combo, tipo: 'Producto' | 'Combo', cantidad: number) => {
        try {
            const id = tipo === 'Producto' ? (item as Product).productoId : (item as Combo).comboId;
            if (!id) return false;

            const response = tipo === 'Producto' 
                ? await ProductService.validateStock(id)
                : await ComboService.validateStock(id);

            return response.data.hasStock;
        } catch (error) {
            console.error('Error al validar stock:', error);
            return false;
        }
    };

    const addToCart = async (item: Product | Combo, tipo: 'Producto' | 'Combo') => {
        const hasStock = await validateStock(item, tipo, 1);
        if (!hasStock) {
            alert('No hay suficiente stock disponible');
            return;
        }

        const newItem: CartItem = {
            tipo,
            item,
            cantidad: 1,
            subtotal: tipo === 'Producto' 
                ? (item as Product).precioPorLibra * 1
                : (item as Combo).precio * 1
        };

        setCart(prevCart => {
            const existingItemIndex = prevCart.items.findIndex(
                i => i.tipo === tipo && 
                    ((tipo === 'Producto' && (i.item as Product).productoId === (item as Product).productoId) ||
                     (tipo === 'Combo' && (i.item as Combo).comboId === (item as Combo).comboId))
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...prevCart.items];
                updatedItems[existingItemIndex].cantidad += 1;
                updatedItems[existingItemIndex].subtotal = 
                    updatedItems[existingItemIndex].cantidad * 
                    (tipo === 'Producto' 
                        ? (item as Product).precioPorLibra 
                        : (item as Combo).precio);

                return {
                    ...prevCart,
                    items: updatedItems,
                    total: calculateTotal(updatedItems)
                };
            }

            return {
                ...prevCart,
                items: [...prevCart.items, newItem],
                total: calculateTotal([...prevCart.items, newItem])
            };
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prevCart => {
            const updatedItems = prevCart.items.filter((_, i) => i !== index);
            return {
                ...prevCart,
                items: updatedItems,
                total: calculateTotal(updatedItems)
            };
        });
    };

    const calculateTotal = (items: CartItem[]): number => {
        return Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    };

    const handleCheckout = async () => {
        if (!cart.cliente || cart.items.length === 0) {
            alert('Por favor ingrese el nombre del cliente y agregue items al carrito');
            return;
        }

        // Validar stock de todos los items antes de procesar
        for (const item of cart.items) {
            const hasStock = await validateStock(item.item, item.tipo, item.cantidad);
            if (!hasStock) {
                alert(`No hay suficiente stock para ${item.item.nombre}`);
                return;
            }
        }

        const ventaInput: VentaInput = {
            cliente: cart.cliente,
            items: cart.items.map(item => ({
                tipoItem: item.tipo,
                itemId: item.tipo === 'Producto' 
                    ? (item.item as Product).productoId! 
                    : (item.item as Combo).comboId!,
                cantidad: item.cantidad
            })),
            observaciones: cart.observaciones,
            total: cart.total
        };

        try {
            await VentaService.create(ventaInput);
            setCart({
                items: [],
                total: 0,
                cliente: '',
                observaciones: ''
            });
            alert('Venta realizada con éxito');
            // Recargar productos y combos para actualizar stock
            loadProductos();
            loadCombos();
        } catch (error) {
            console.error('Error al procesar la venta:', error);
            alert('Error al procesar la venta');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="text-xl font-semibold">Cargando...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center text-red-600">
                    <div className="text-xl font-semibold">{error}</div>
                    <button 
                        onClick={() => {
                            setError(null);
                            loadProductos();
                            loadCombos();
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lista de Productos/Combos */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex space-x-4 mb-6">
                            <button
                                className={`px-4 py-2 rounded-lg ${
                                    activeTab === 'productos'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                onClick={() => setActiveTab('productos')}
                            >
                                Productos
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg ${
                                    activeTab === 'combos'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                onClick={() => setActiveTab('combos')}
                            >
                                Combos
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activeTab === 'productos' ? (
                                productos.map(producto => (
                                    <div key={producto.productoId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium">{producto.nombre}</h3>
                                            <p className="text-sm text-gray-600">
                                                Precio: ${producto.precioPorLibra}/lb - Stock: {producto.cantidadLibras}lb
                                            </p>
                                        </div>
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                                            onClick={() => addToCart(producto, 'Producto')}
                                            disabled={producto.cantidadLibras <= 0}
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                ))
                            ) : (
                                combos.map(combo => (
                                    <div key={combo.comboId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium">{combo.nombre}</h3>
                                            <p className="text-sm text-gray-600">Precio: ${combo.precio}</p>
                                        </div>
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            onClick={() => addToCart(combo, 'Combo')}
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Carrito */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Carrito de Compras</h2>
                        <input
                            type="text"
                            placeholder="Nombre del Cliente"
                            className="w-full p-2 border rounded-lg mb-4"
                            value={cart.cliente}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCart({...cart, cliente: e.target.value})}
                        />
                        
                        <div className="space-y-4 mb-4">
                            {cart.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.item.nombre}</p>
                                        <p className="text-sm text-gray-600">
                                            Cantidad: {item.cantidad} - Subtotal: ${item.subtotal}
                                        </p>
                                    </div>
                                    <button
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => removeFromCart(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <textarea
                            placeholder="Observaciones"
                            className="w-full p-2 border rounded-lg mb-4"
                            value={cart.observaciones}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCart({...cart, observaciones: e.target.value})}
                            rows={2}
                        />

                        <div className="border-t pt-4">
                            <p className="text-xl font-bold mb-4">Total: ${cart.total}</p>
                            <button
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                                onClick={handleCheckout}
                                disabled={cart.items.length === 0}
                            >
                                Procesar Venta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VentasPage; 