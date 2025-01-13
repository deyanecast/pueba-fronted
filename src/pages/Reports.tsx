import { useState, useEffect } from 'react';
import { Sale } from '../types';
import { getSalesData } from '../services/api';

type TimeFrame = 'day' | 'month';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setError(null);
      const response = await getSalesData();
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Error al cargar los datos de ventas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const groupSalesByDate = (sales: Sale[]) => {
    return sales.reduce((acc, sale) => {
      const date = new Date(sale.sale_date);
      const key = timeFrame === 'day' 
        ? date.toISOString().split('T')[0]
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = {
          total: 0,
          count: 0
        };
      }
      
      acc[key].total += sale.total_amount;
      acc[key].count += sale.quantity;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);
  };

  const groupedSales = groupSalesByDate(sales);
  const sortedDates = Object.keys(groupedSales).sort().reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-500">Please wait while we fetch the sales data</div>
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
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeFrame('day')}
            className={`px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              timeFrame === 'day'
                ? 'bg-blue-600 text-white focus:ring-blue-500'
                : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              timeFrame === 'month'
                ? 'bg-blue-600 text-white focus:ring-blue-500'
                : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {timeFrame === 'day' ? 'Date' : 'Month'}
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sales
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Sold
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Sale
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
                          ? new Date(date).toLocaleDateString()
                          : new Date(date + '-01').toLocaleDateString(undefined, {
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
            <p className="text-gray-500">No sales data available</p>
          </div>
        )}
      </div>
    </div>
  );
} 