import React, { useState, useEffect } from 'react';
import ComboService from '../services/ComboService';
import { ProductService } from '../services/ProductService';
import { Combo } from '../services/combo.types';
import axios from 'axios';

interface Product {
  productoId: number;
  nombre: string;
  precio: number;
  cantidadLibras: number;
  precioPorLibra: number;
  tipoEmpaque: string;
  estaActivo: boolean;
}

interface ComboProduct {
  productoId: number;
  cantidadLibras: number;
}

interface ComboFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  productos: ComboProduct[];
}

const initialFormData: ComboFormData = {
  nombre: '',
  descripcion: '',
  precio: 0,
  productos: []
};

export default function Combos() {
  const [formData, setFormData] = useState<ComboFormData>(initialFormData);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savingCombo, setSavingCombo] = useState(false);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCalculado, setTotalCalculado] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    fetchCombos();
    fetchProducts();
  }, []);

  const fetchCombos = async () => {
    try {
      const response = await ComboService.getAll();
      setCombos(response.data);
      setError('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.message);
      } else {
        setError('Error al cargar los combos');
      }
      console.error('Error fetching combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getActive();
      setProducts(response.data);
      setError('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.message);
      } else {
        setError('Error al cargar los productos');
      }
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (savingCombo) return;
    if (formData.productos.length === 0) {
      setError('Debe agregar al menos un producto al combo');
      return;
    }
    
    setSavingCombo(true);
    
    try {
      const comboData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: Number(formData.precio),
        productos: formData.productos.map(p => ({
          productoId: p.productoId,
          cantidadLibras: p.cantidadLibras
        }))
      };

      if (editingCombo) {
        await ComboService.update(editingCombo.comboId!, comboData);
      } else {
        await ComboService.create(comboData);
      }
      
      await fetchCombos();
      resetForm();
      setError('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error al guardar el combo');
      } else {
        setError('Error al guardar el combo');
      }
      console.error('Error saving combo:', error);
    } finally {
      setSavingCombo(false);
    }
  };

  const calculateTotal = (selectedProducts: ComboProduct[]) => {
    const total = selectedProducts.reduce((sum, product) => {
      const foundProduct = products.find(p => p.productoId === product.productoId);
      return sum + (foundProduct?.precioPorLibra || 0) * product.cantidadLibras;
    }, 0);
    setTotalCalculado(total);
    return total;
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProductId = parseInt(e.target.value);
    const product = products.find(p => p.productoId === selectedProductId);
    
    if (product) {
      setSelectedProduct(product);
      setSelectedQuantity(1);
    } else {
      setSelectedProduct(null);
      setSelectedQuantity(1);
    }
  };

  const handleAddProduct = () => {
    if (selectedProduct && !formData.productos.some(p => p.productoId === selectedProduct.productoId)) {
      const newProduct: ComboProduct = {
        productoId: selectedProduct.productoId,
        cantidadLibras: selectedQuantity
      };
      const updatedProducts = [...formData.productos, newProduct];
      setFormData({
        ...formData,
        productos: updatedProducts
      });
      calculateTotal(updatedProducts);
      setSelectedProduct(null);
      setSelectedQuantity(1);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    const updatedProducts = formData.productos.filter(p => p.productoId !== productId);
    setFormData({
      ...formData,
      productos: updatedProducts
    });
    calculateTotal(updatedProducts);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCombo(null);
    setError('');
    setTotalCalculado(0);
    setSelectedProduct(null);
  };

  const handleEdit = (combo: Combo) => {
    setEditingCombo(combo);
    setFormData({
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      precio: combo.precio,
      productos: combo.productos
    });
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Combos</h1>

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          {error}
        </div>
      )}

      {/* Combo Form */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {editingCombo ? 'Editar Combo' : 'Crear Nuevo Combo'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Combo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Agregar Productos al Combo</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Producto</label>
                <select
                  value={selectedProduct?.productoId || ''}
                  onChange={handleProductSelect}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un producto</option>
                  {products.map(product => (
                    <option key={product.productoId} value={product.productoId}>
                      {product.nombre} - ${product.precioPorLibra}/lb
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Cantidad (Libras)</label>
                <input
                  type="number"
                  value={selectedQuantity}
                  onChange={e => {
                    const cantidad = parseFloat(e.target.value);
                    if (cantidad > 0) {
                      setSelectedQuantity(cantidad);
                    }
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0.5"
                  step="0.5"
                  disabled={!selectedProduct}
                />
              </div>
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={!selectedProduct}
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Selected Products List */}
          {formData.productos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Productos en el Combo</h3>
              <div className="space-y-2">
                {formData.productos.map(item => {
                  const product = products.find(p => p.productoId === item.productoId);
                  return product ? (
                    <div key={item.productoId} className="flex justify-between items-center py-2 border-b">
                      <span>{product.nombre} - {item.cantidadLibras} lb</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          ${(product.precioPorLibra * item.cantidadLibras).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.productoId)}
                          className="text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : null;
                })}
                <div className="flex justify-between font-medium pt-2">
                  <span>Precio Total:</span>
                  <span>${totalCalculado.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Precio Final del Combo</label>
            <input
              type="number"
              value={formData.precio}
              onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
              required
            />
            {formData.precio > 0 && totalCalculado > 0 && (
              <p className="text-green-600 text-sm mt-1">
                {formData.precio < totalCalculado 
                  ? `¡Ahorro de $${(totalCalculado - formData.precio).toFixed(2)}!`
                  : 'El precio del combo debe ser menor al total para generar ahorro'}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingCombo || formData.productos.length === 0}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                (savingCombo || formData.productos.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {savingCombo ? 'Guardando...' : (editingCombo ? 'Actualizar Combo' : 'Crear Combo')}
            </button>
            {editingCombo && (
              <button
                type="button"
                onClick={resetForm}
                disabled={savingCombo}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Combos List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {combos.map(combo => (
                <tr key={combo.comboId} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{combo.nombre}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{combo.descripcion}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {combo.productos.map(item => {
                        const product = products.find(p => p.productoId === item.productoId);
                        return product ? (
                          <div key={item.productoId} className="text-sm text-gray-600">
                            {product.nombre} ({item.cantidadLibras} lb)
                          </div>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">${combo.precio.toFixed(2)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <button
                      onClick={() => handleEdit(combo)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline text-sm"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {combos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay combos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}