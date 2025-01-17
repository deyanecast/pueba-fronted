import { useState, useEffect, useMemo } from 'react';
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

  // Inicializar fechas: última semana hasta hoy (en lugar de último mes)
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: formatDate(lastWeek),
    endDate: formatDate(today)
  });

  // Memoize groupedSales to prevent unnecessary recalculations
  const groupedSales = useMemo(() => {
    if (!Array.isArray(sales) || sales.length === 0) {
      return {};
    }

    return sales.reduce((acc: Record<string, SaleStats>, sale: VentaResponse) => {
      if (!sale.fechaVenta) return acc;

      const date = new Date(sale.fechaVenta);
      if (isNaN(date.getTime())) return acc;

      const key = timeFrame === 'day' 
        ? formatDate(date)
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 };
      }

      acc[key].total += sale.montoTotal || 0;
      acc[key].count += 1;

      return acc;
    }, {});
  }, [sales, timeFrame]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchSales = async () => {
      try {
        setError(null);
        setLoading(true);

        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);

        if (start > end) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }

        const response = await VentaService.getByDateRange({
          startDate: formatDate(start),
          endDate: formatDate(end)
        });

        if (isSubscribed && response?.data?.ventas) {
          setSales(response.data.ventas);
        }
      } catch (error) {
        if (isSubscribed) {
          console.error('Error al cargar las ventas:', error);
          setError(error instanceof Error ? error.message : 'Error al cargar los datos de ventas');
          setSales([]);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchSales();
    return () => { isSubscribed = false };
  }, [dateRange]);

  const renderSalesData = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-xl font-semibold">Cargando datos...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
          {error}
        </div>
      );
    }

    if (Object.keys(groupedSales).length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          No hay datos de ventas para el período seleccionado
        </div>
      );
    }

    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ventas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedSales)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, stats]) => (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stats.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${stats.total.toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Reportes de Ventas</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Desde:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Hasta:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTimeFrame('day')}
            className={`px-4 py-2 rounded ${
              timeFrame === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Por Día
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 rounded ${
              timeFrame === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Por Mes
          </button>
        </div>
      </div>

      {renderSalesData()}
    </div>
  );
} 