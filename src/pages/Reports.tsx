import { useState, useEffect } from 'react';
import { Sale } from '../types';
import { getSalesData } from '../services/api';

type TimeFrame = 'day' | 'month';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await getSalesData();
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <div className="space-x-2">
          <button
            onClick={() => setTimeFrame('day')}
            className={`px-4 py-2 rounded ${
              timeFrame === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 rounded ${
              timeFrame === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {timeFrame === 'day' ? 'Date' : 'Month'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Sales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Items Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Average Sale
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedDates.map(date => {
              const data = groupedSales[date];
              return (
                <tr key={date}>
                  <td className="px-6 py-4">
                    {timeFrame === 'day'
                      ? new Date(date).toLocaleDateString()
                      : new Date(date + '-01').toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long'
                        })}
                  </td>
                  <td className="px-6 py-4">${data.total.toFixed(2)}</td>
                  <td className="px-6 py-4">{data.count}</td>
                  <td className="px-6 py-4">
                    ${(data.total / data.count).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 