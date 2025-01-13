import { useEffect, useState } from 'react';
import { Product, Sale } from '../types';
import { getAllProducts, getSalesData } from '../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, salesRes] = await Promise.all([
          getAllProducts(),
          getSalesData()
        ]);
        
        setProducts(productsRes.data);
        setSales(salesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const lowStockProducts = products.filter(product => product.stock < 10);
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  });

  const totalSalesToday = todaySales.reduce((acc, sale) => acc + sale.total_amount, 0);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Sales Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Today's Sales</h2>
          <p className="text-3xl font-bold">${totalSalesToday.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{todaySales.length} transactions</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product.id} className="flex justify-between items-center">
                <span>{product.name}</span>
                <span className="text-red-500 font-medium">{product.stock} units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Inventory Summary</h2>
          <p className="text-3xl font-bold">{products.length}</p>
          <p className="text-sm text-gray-500">Total Products</p>
        </div>
      </div>
    </div>
  );
} 