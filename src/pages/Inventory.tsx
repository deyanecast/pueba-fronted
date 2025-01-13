import { useState, useEffect } from 'react';
import { ProductService } from '../services/ProductService';
import { Product } from '../services/ProductService';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
      const productsData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response.data.data) ? response.data.data : [];
      
      const validProducts = productsData.filter((product: unknown): product is Product => 
        product !== null &&
        typeof product === 'object' &&
        'nombre' in product &&
        'cantidadLibras' in product &&
        'precioPorLibra' in product &&
        'tipoEmpaque' in product
      );
      
      setProducts(validProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
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
      console.error('Error saving product:', err);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Cargando...</div>
          <div className="text-gray-500">Por favor espere mientras se cargan los productos</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-red-600">Error</div>
          <div className="text-gray-700 mb-4">{error}</div>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      {/* Product Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad (Libras)</label>
              <input
                type="number"
                name="cantidadLibras"
                value={formData.cantidadLibras}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              required
              placeholder="Ej: Caja, Bolsa, etc."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products List */}
      {products.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad (Libras)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio/Libra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Empaque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.productoId}>
                  <td className="px-6 py-4">{product.nombre}</td>
                  <td className="px-6 py-4">{product.cantidadLibras}</td>
                  <td className="px-6 py-4">${product.precioPorLibra.toFixed(2)}</td>
                  <td className="px-6 py-4">{product.tipoEmpaque}</td>
                  <td className="px-6 py-4">${(product.valorTotal || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
} 