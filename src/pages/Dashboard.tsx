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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Sales Summary */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Today's Sales</h2>
          <p className="text-2xl sm:text-3xl font-bold">${totalSalesToday.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{todaySales.length} transactions</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center text-sm sm:text-base">
                  <span className="truncate mr-2">{product.name}</span>
                  <span className="text-red-500 font-medium whitespace-nowrap">{product.stock} units</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No products with low stock</p>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-2">Inventory Summary</h2>
          <p className="text-2xl sm:text-3xl font-bold">{products.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Products</p>
        </div>
      </div>
    </div>
  );
} 