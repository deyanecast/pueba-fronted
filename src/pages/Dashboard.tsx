import { useEffect, useState } from 'react';
import { Product } from '../services/ProductService';
import { ProductService } from '../services/ProductService';
import { VentaService, ReporteVentas } from '../services/VentaService';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ReporteVentas>({ totalVentas: 0, montoTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obtener productos activos y ventas del día actual
        const today = new Date().toISOString().split('T')[0];
        const [productsRes, ventasRes] = await Promise.all([
          ProductService.getActive(),
          VentaService.getTotalByDate(today)
        ]);
        
        setProducts(productsRes.data);
        setStats(ventasRes.data);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const lowStockProducts = products.filter(product => ProductService.esBajoStock(product.cantidadLibras));

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
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Ventas del Día */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Ventas del Día</h2>
          <p className="text-2xl sm:text-3xl font-bold">
            ${stats.montoTotal.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalVentas} transacciones
          </p>
        </div>

        {/* Alertas de Stock Bajo */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Alertas de Stock Bajo</h2>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.productoId} className="flex justify-between items-center text-sm sm:text-base">
                  <span className="truncate mr-2">{product.nombre}</span>
                  <span className="text-red-500 font-medium whitespace-nowrap">
                    {product.cantidadLibras} lb
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No hay productos con stock bajo</p>
            )}
          </div>
        </div>

        {/* Resumen de Inventario */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-2">Resumen de Inventario</h2>
          <p className="text-2xl sm:text-3xl font-bold">{products.length}</p>
          <p className="text-sm text-gray-500 mt-1">Productos Activos</p>
        </div>
      </div>
    </div>
  );
} 