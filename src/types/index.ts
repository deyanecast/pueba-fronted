export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  sale_date: string;
}

export interface DashboardSummary {
  totalSales: number;
  lowStockProducts: Product[];
  todaysSales: Sale[];
} 