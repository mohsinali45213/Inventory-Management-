import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Folder, 
  Tag, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { useInventory } from '../context/InventoryContext';
import StatCard from '../components/dashboard/StatCard';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { state } = useInventory();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock chart data
  const salesData = [
    { date: '2024-01-01', sales: 1200, revenue: 45000 },
    { date: '2024-01-02', sales: 1900, revenue: 67000 },
    { date: '2024-01-03', sales: 800, revenue: 32000 },
    { date: '2024-01-04', sales: 2200, revenue: 78000 },
    { date: '2024-01-05', sales: 1500, revenue: 55000 },
    { date: '2024-01-06', sales: 2800, revenue: 89000 },
    { date: '2024-01-07', sales: 2400, revenue: 72000 }
  ];

  const stockByCategory = state.categories.map(category => ({
    name: category.name,
    stock: state.products
      .filter(p => p.categoryId === category.id)
      .reduce((sum, p) => sum + p.variants.reduce((vSum, v) => vSum + v.stock_qty, 0), 0)
  }));

  const lowStockProducts = state.products
    .flatMap(product => 
      product.variants
        .filter(variant => variant.stock_qty > 0 && variant.stock_qty <= 10)
        .map(variant => ({
          productName: product.name,
          size: variant.size,
          color: variant.color,
          stock: variant.stock_qty ,
          price: variant.price
        }))
    )
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your inventory today.</p>
        </div>
        <div className="current-time">
          <div className="time-display">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="time-display time-large">
            {format(currentTime, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={state.stats.totalProducts}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Total Categories"
          value={state.stats.totalCategories}
          icon={Folder}
          color="green"
        />
        <StatCard
          title="Total Brands"
          value={state.stats.totalBrands}
          icon={Tag}
          color="purple"
        />
        <StatCard
          title="Sales Today"
          value={`₹${state.stats.totalSalesToday.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Total Invoices"
          value={state.stats.totalInvoices}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Inventory Value"
          value={`₹${state.stats.inventoryValue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Out of Stock"
          value={state.stats.outOfStockCount}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Low Stock Alert"
          value={state.stats.lowStockCount}
          icon={AlertTriangle}
          trend={{ value: 15, isPositive: false }}
          color="orange"
        />
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Sales Overview</h3>
              <div className="chart-controls">
                <button className="chart-control-btn active">Daily</button>
                <button className="chart-control-btn">Weekly</button>
                <button className="chart-control-btn">Monthly</button>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM dd')} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    formatter={(value: any, name: string) => [
                      name === 'sales' ? value : `₹${value.toLocaleString()}`,
                      name === 'sales' ? 'Sales' : 'Revenue'
                    ]}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Stock by Category</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Low Stock Alert</h3>
              <Eye size={20} />
            </div>
            <div className="low-stock-list">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((item, index) => (
                  <div key={index} className="low-stock-item">
                    <div className="low-stock-info">
                      <div className="product-name">{item.productName}</div>
                      <div className="product-variant">{item.size} • {item.color}</div>
                      <div className="product-price">₹{item.price.toLocaleString()}</div>
                    </div>
                    <div className={`stock-badge ${item.stock <= 5 ? 'stock-critical' : 'stock-low'}`}>
                      {item.stock} left
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-low-stock">No low stock items</div>
              )}
            </div>
            <button className="view-all-btn">View All Low Stock</button>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="quick-action-buttons">
              <button className="quick-action-btn">
                <Package size={20} />
                Add Product
              </button>
              <button className="quick-action-btn">
                <FileText size={20} />
                Create Invoice
              </button>
              <button className="quick-action-btn">
                <TrendingUp size={20} />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;