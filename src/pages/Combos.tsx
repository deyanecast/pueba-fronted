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

  // Estado para el producto que se está agregando al combo
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
      const response = await ComboService.getAll();
      setCombos(response.data);
    } catch (err) {
      console.error('Error fetching combos:', err);
      setError('No se pudieron cargar los combos. Los datos se actualizarán automáticamente cuando el servidor responda.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingMessage('Cargando productos...');
      const response = await ProductService.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
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

  const addProductToCombo = () => {
    if (selectedProduct.productoId && selectedProduct.cantidad > 0) {
      setFormData(prev => ({
        ...prev,
        productos: [...prev.productos, {
          productoId: selectedProduct.productoId,
          cantidad: selectedProduct.cantidad
        }]
      }));
      // Reset selected product
      setSelectedProduct({ productoId: 0, cantidad: 0 });
    }
  };

  const removeProductFromCombo = (productoId: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.productoId !== productoId)
    }));
  };

  const calculateTotalPrice = () => {
    return formData.productos.reduce((total, item) => {
      const product = products.find(p => p.productoId === item.productoId);
      if (product) {
        return total + (product.precioPorLibra * item.cantidad);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSavingCombo(true);
      
      // Asegurarnos que los productos tengan el formato correcto
      const productosFormateados = formData.productos.map(item => ({
        productoId: Number(item.productoId),
        cantidad: Number(item.cantidad)
      }));

      // Crear el objeto con el formato exacto que espera la API
      const comboData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: Number(formData.precio),
        productos: productosFormateados,
        estaActivo: true
      };

      console.log('Enviando combo:', JSON.stringify(comboData, null, 2));

      if (editingCombo?.comboId) {
        await ComboService.update(editingCombo.comboId, comboData);
      } else {
        const response = await ComboService.create(comboData);
        console.log('Respuesta del servidor:', response);
      }
      
      await fetchCombos();
      resetForm();
      setError(null);
    } catch (error) {
      console.error('Error saving combo:', error);
      if (axios.isAxiosError(error) && error.response) {
        // Mostrar el mensaje de error específico del servidor si está disponible
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
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Combos</h1>

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          {error}
        </div>
      )}

      {/* Combo Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
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
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Product Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Agregar Productos al Combo</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Producto</label>
                <select
                  value={selectedProduct.productoId}
                  onChange={handleProductSelect}
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addProductToCombo}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
              <div className="bg-gray-50 p-4 rounded-lg">
                {formData.productos.map(item => {
                  const product = products.find(p => p.productoId === item.productoId);
                  return product ? (
                    <div key={item.productoId} className="flex justify-between items-center py-2">
                      <span>{product.nombre} - {item.cantidad} lb</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          ${(product.precioPorLibra * item.cantidad).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProductFromCombo(item.productoId)}
                          className="text-red-600 hover:text-red-800"
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
              className="w-full p-2 border rounded"
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

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingCombo}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                savingCombo ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {savingCombo ? (
                'Guardando...'
              ) : (
                editingCombo ? 'Actualizar Combo' : 'Crear Combo'
              )}
            </button>
            {editingCombo && (
              <button
                type="button"
                onClick={resetForm}
                disabled={savingCombo}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Combos List */}
      {combos.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {combos.map(combo => (
                <tr key={combo.comboId}>
                  <td className="px-6 py-4">{combo.nombre}</td>
                  <td className="px-6 py-4">{combo.descripcion}</td>
                  <td className="px-6 py-4">
                    {combo.productos.map(item => {
                      const product = products.find(p => p.productoId === item.productoId);
                      return product ? (
                        <div key={item.productoId} className="text-sm">
                          {product.nombre} ({item.cantidad} lb)
                        </div>
                      ) : null;
                    })}
                  </td>
                  <td className="px-6 py-4">${combo.precio.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(combo)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => ComboService.toggleState(combo.comboId!)}
                      className={`${
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
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay combos disponibles</p>
        </div>
      )}
    </div>
  );
} 