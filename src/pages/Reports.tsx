import { useState, useEffect } from 'react';
import { VentaService, VentaResponse, DateRange } from '../services/VentaService';

type TimeFrame = 'day' | 'month';

interface SaleStats {
  total: number;
  count: number;
}

export default function Reports() {
  const [sales, setSales] = useState<VentaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSales();
  }, [timeFrame, dateRange]);

  const fetchSales = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await VentaService.getByDateRange(dateRange);
      setSales(response.data);
    } catch (error) {
      console.error('Error al cargar las ventas:', error);
      setError('Error al cargar los datos de ventas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const groupSalesByDate = (sales: VentaResponse[]) => {
    return sales.reduce((acc, sale) => {
      const date = new Date(sale.fechaVenta);
      const key = timeFrame === 'day' 
        ? date.toISOString().split('T')[0]
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = {
          total: 0,
          count: 0
        };
      }
      
      acc[key].total += sale.montoTotal;
      acc[key].count += sale.detalles.reduce((sum: number, item) => sum + item.cantidadLibras, 0);
      return acc;
    }, {} as Record<string, SaleStats>);
  };

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
    const today = new Date();
    let startDate: Date;

    if (newTimeFrame === 'day') {
      startDate = new Date(today.setMonth(today.getMonth() - 1));
    } else {
      startDate = new Date(today.setMonth(today.getMonth() - 12));
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  const groupedSales = groupSalesByDate(sales);
  const sortedDates = Object.keys(groupedSales).sort().reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Cargando...</div>
          <div className="text-gray-500">Por favor espere mientras cargamos los datos de ventas</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-red-600">Error</div>
          <div className="text-gray-700 mb-4">{error}</div>
          <button
            onClick={fetchSales}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Reporte de Ventas</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleTimeFrameChange('day')}
            className={`px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              timeFrame === 'day'
                ? 'bg-blue-600 text-white focus:ring-blue-500'
                : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500'
            }`}
          >
            Diario
          </button>
          <button
            onClick={() => handleTimeFrameChange('month')}
            className={`px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              timeFrame === 'month'
                ? 'bg-blue-600 text-white focus:ring-blue-500'
                : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500'
            }`}
          >
            Mensual
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {timeFrame === 'day' ? 'Fecha' : 'Mes'}
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Ventas
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Vendidos
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio por Venta
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDates.map(date => {
                const data = groupedSales[date];
                return (
                  <tr key={date} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {timeFrame === 'day'
                          ? new Date(date).toLocaleDateString('es-ES')
                          : new Date(date + '-01').toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long'
                            })}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${data.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{data.count}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(data.total / data.count).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedDates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay datos de ventas disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
} 