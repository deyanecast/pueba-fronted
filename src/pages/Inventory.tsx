import { useState, useEffect } from 'react';
import { ProductService } from '../services/ProductService';
import { Product } from '../services/ProductService';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [updatingStock, setUpdatingStock] = useState<number | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [formData, setFormData] = useState<Omit<Product, 'productoId' | 'ultimaActualizacion' | 'valorTotal'>>({
    nombre: '',
    cantidadLibras: 0,
    precioPorLibra: 0,
    tipoEmpaque: 'Caja',
    estaActivo: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await ProductService.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos. Por favor, intente nuevamente.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidadLibras' || name === 'precioPorLibra' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingProduct?.productoId) {
        await ProductService.update(editingProduct.productoId, formData);
      } else {
        await ProductService.create(formData);
      }
      await fetchProducts();
      resetForm();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError('Error al guardar el producto. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      cantidadLibras: product.cantidadLibras,
      precioPorLibra: product.precioPorLibra,
      tipoEmpaque: product.tipoEmpaque,
      estaActivo: product.estaActivo ?? true
    });
  };

  const handleUpdateStock = async (productId: number) => {
    if (newStock < 0) {
      setError('La cantidad no puede ser negativa');
      return;
    }

    try {
      setError(null);
      await ProductService.updateStock(productId, newStock);
      await fetchProducts();
      setUpdatingStock(null);
      setNewStock(0);
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      setError('Error al actualizar el stock. Por favor, intente nuevamente.');
    }
  };

  const handleToggleStatus = async (productId: number) => {
    try {
      setError(null);
      await ProductService.updateStatus(productId);
      await fetchProducts();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Error al actualizar el estado del producto. Por favor, intente nuevamente.');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      cantidadLibras: 0,
      precioPorLibra: 0,
      tipoEmpaque: 'Caja',
      estaActivo: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Cargando...</div>
          <div className="text-gray-500">Por favor espere mientras se cargan los productos</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Inventario</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Product Form */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad (Libras)</label>
              <input
                type="number"
                name="cantidadLibras"
                value={formData.cantidadLibras}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio por Libra</label>
              <input
                type="number"
                name="precioPorLibra"
                value={formData.precioPorLibra}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Empaque</label>
            <input
              type="text"
              name="tipoEmpaque"
              value={formData.tipoEmpaque}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Ej: Caja, Bolsa, etc."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio/Libra</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empaque</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.productoId} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {updatingStock === product.productoId ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(Number(e.target.value))}
                          className="w-20 p-1 text-sm border rounded"
                          min="0"
                          step="0.01"
                        />
                        <button
                          onClick={() => handleUpdateStock(product.productoId!)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setUpdatingStock(null);
                            setNewStock(0);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {product.cantidadLibras} lb
                        <button
                          onClick={() => {
                            setUpdatingStock(product.productoId!);
                            setNewStock(product.cantidadLibras);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-900"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.precioPorLibra.toFixed(2)}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.tipoEmpaque}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(product.productoId!)}
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        product.estaActivo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.estaActivo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline mr-3"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay productos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
} 