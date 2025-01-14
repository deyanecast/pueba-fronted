import { useState, useEffect } from 'react';
import ComboService from '../services/ComboService';
import { ProductService } from '../services/ProductService';
import { Combo, Product } from '../services/ProductService';
import axios from 'axios';

export default function Combos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCombo, setSavingCombo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Cargando datos...');
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  
  const [formData, setFormData] = useState<Omit<Combo, 'comboId' | 'fechaCreacion'>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    productos: [],
    estaActivo: true
  });

  const [selectedProduct, setSelectedProduct] = useState<{
    productoId: number;
    cantidad: number;
  }>({
    productoId: 0,
    cantidad: 0
  });

  useEffect(() => {
    fetchCombos();
    fetchProducts();
  }, []);

  const fetchCombos = async () => {
    try {
      setError(null);
      setLoadingMessage('Cargando combos...');
      const response = await ComboService.getActive();
      setCombos(response.data);
    } catch (err) {
      console.error('Error al cargar combos:', err);
      setError('No se pudieron cargar los combos. Los datos se actualizarán automáticamente cuando el servidor responda.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingMessage('Cargando productos...');
      const response = await ProductService.getActive();
      setProducts(response.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Los datos se actualizarán automáticamente cuando el servidor responda.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' ? Number(value) : value
    }));
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productoId = Number(e.target.value);
    setSelectedProduct(prev => ({
      ...prev,
      productoId
    }));
  };

  const handleProductQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cantidad = Number(e.target.value);
    setSelectedProduct(prev => ({
      ...prev,
      cantidad
    }));
  };

  const validateComboStock = async (comboId: number) => {
    try {
      const response = await ComboService.validateStock(comboId);
      return response.data.hasStock;
    } catch (error) {
      console.error('Error al validar stock del combo:', error);
      return false;
    }
  };

  const calculateComboTotal = async (comboId: number) => {
    try {
      const response = await ComboService.calculateTotal(comboId);
      return response.data.total;
    } catch (error) {
      console.error('Error al calcular total del combo:', error);
      return 0;
    }
  };

  const addProductToCombo = async () => {
    if (selectedProduct.productoId && selectedProduct.cantidad > 0) {
      try {
        // Validar stock del producto
        const hasStock = await ProductService.validateStock(selectedProduct.productoId);
        if (!hasStock.data.hasStock) {
          setError('No hay suficiente stock disponible para este producto');
          return;
        }

        setFormData(prev => ({
          ...prev,
          productos: [...prev.productos, {
            productoId: selectedProduct.productoId,
            cantidad: selectedProduct.cantidad
          }]
        }));
        setSelectedProduct({ productoId: 0, cantidad: 0 });
        setError(null);
      } catch (error) {
        console.error('Error al validar stock:', error);
        setError('Error al validar el stock del producto');
      }
    }
  };

  const removeProductFromCombo = (productoId: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.productoId !== productoId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSavingCombo(true);
      
      const productosFormateados = formData.productos.map(item => ({
        productoId: Number(item.productoId),
        cantidad: Number(item.cantidad)
      }));

      const comboData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: Number(formData.precio),
        productos: productosFormateados,
        estaActivo: true
      };

      if (editingCombo?.comboId) {
        await ComboService.updateStatus(editingCombo.comboId);
      } else {
        await ComboService.create(comboData);
      }
      
      await fetchCombos();
      resetForm();
      setError(null);
    } catch (error) {
      console.error('Error al guardar combo:', error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Error al procesar la solicitud en el servidor';
        setError(`Error: ${errorMessage}`);
      } else {
        setError('Ocurrió un error al intentar guardar el combo. Por favor, verifique los datos e intente nuevamente.');
      }
    } finally {
      setSavingCombo(false);
    }
  };

  const handleEdit = (combo: Combo) => {
    setEditingCombo(combo);
    setFormData({
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      precio: combo.precio,
      productos: combo.productos,
      estaActivo: combo.estaActivo ?? true
    });
  };

  const handleToggleStatus = async (comboId: number) => {
    try {
      await ComboService.updateStatus(comboId);
      await fetchCombos();
    } catch (error) {
      console.error('Error al actualizar estado del combo:', error);
      setError('Error al actualizar el estado del combo');
    }
  };

  const resetForm = () => {
    setEditingCombo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      productos: [],
      estaActivo: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">{loadingMessage}</div>
          <div className="text-gray-500">
            El servidor puede tardar unos momentos en responder.
            <br />
            Por favor, espere mientras se cargan los datos.
          </div>
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
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Product Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Agregar Productos al Combo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Producto</label>
                <select
                  value={selectedProduct.productoId}
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
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad (Libras)</label>
                <input
                  type="number"
                  value={selectedProduct.cantidad}
                  onChange={handleProductQuantityChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addProductToCombo}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Agregar al Combo
                </button>
              </div>
            </div>
          </div>

          {/* Selected Products List */}
          {formData.productos.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Productos en el Combo</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {formData.productos.map(item => {
                  const product = products.find(p => p.productoId === item.productoId);
                  return product ? (
                    <div key={item.productoId} className="flex flex-wrap justify-between items-center py-2 gap-2">
                      <span className="text-sm">{product.nombre} - {item.cantidad} lb</span>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-sm text-gray-600">
                          ${(product.precioPorLibra * item.cantidad).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProductFromCombo(item.productoId)}
                          className="text-red-600 hover:text-red-800 focus:outline-none focus:underline text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : null;
                })}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-medium">
                    <span>Precio Total Calculado:</span>
                    <span>${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Precio Final del Combo</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
              required
            />
            {formData.precio < calculateTotalPrice() && (
              <p className="text-green-600 text-sm mt-1">
                ¡Ahorro de ${(calculateTotalPrice() - formData.precio).toFixed(2)}!
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={savingCombo}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                savingCombo ? 'opacity-50 cursor-not-allowed' : ''
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
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {combos.map(combo => (
                <tr key={combo.comboId} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{combo.nombre}</div>
                    <div className="sm:hidden text-sm text-gray-500 mt-1">${combo.precio.toFixed(2)}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <div className="text-sm text-gray-900">{combo.descripcion}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    {combo.productos.map(item => {
                      const product = products.find(p => p.productoId === item.productoId);
                      return product ? (
                        <div key={item.productoId} className="text-sm">
                          {product.nombre} ({item.cantidad} lb)
                        </div>
                      ) : null;
                    })}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">${combo.precio.toFixed(2)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(combo)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => ComboService.toggleState(combo.comboId!)}
                      className={`text-sm focus:outline-none focus:underline ${
                        combo.estaActivo 
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {combo.estaActivo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {combos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay combos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
} 