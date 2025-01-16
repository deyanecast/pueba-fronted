import { useEffect, useState } from 'react';
import { VentaService, DashboardData } from '../services/VentaService';

const defaultDashboardData: DashboardData = {
  totalVentasHoy: 0,
  ventasRecientes: [],
  productosStockBajo: []
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await VentaService.getDashboardData();
        // Verificar que la respuesta tenga la estructura esperada
        if (response.data && typeof response.data === 'object') {
          setDashboardData({
            totalVentasHoy: Number(response.data.totalVentasHoy || 0),
            ventasRecientes: Array.isArray(response.data.ventasRecientes) ? response.data.ventasRecientes : [],
            productosStockBajo: Array.isArray(response.data.productosStockBajo) ? response.data.productosStockBajo : []
          });
        } else {
          setError('La respuesta del servidor no tiene el formato esperado');
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    try {
      return `$${amount.toFixed(2)}`;
    } catch (e) {
      return '$0.00';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Ventas del Día */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Ventas del Día</h2>
          <p className="text-2xl sm:text-3xl font-bold">
            {formatCurrency(dashboardData.totalVentasHoy)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Actualizado: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Alertas de Stock Bajo */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Alertas de Stock Bajo</h2>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {dashboardData.productosStockBajo.length > 0 ? (
              dashboardData.productosStockBajo.map(product => (
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
          <p className="text-2xl sm:text-3xl font-bold">{dashboardData.productosStockBajo.length}</p>
          <p className="text-sm text-gray-500 mt-1">Productos con Stock Bajo</p>
        </div>
      </div>
    </div>
  );
} 