import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, DollarSign, Package, Users, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/common/Button';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const Reports: React.FC = () => {
  const { state } = useInventory();
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Generate mock sales data for the selected date range
  const generateSalesData = () => {
    const data = [];
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        sales: Math.floor(Math.random() * 50000) + 10000,
        orders: Math.floor(Math.random() * 50) + 10,
        customers: Math.floor(Math.random() * 30) + 5
      });
    }
    return data;
  };

  const salesData = generateSalesData();

  // Calculate summary metrics
  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Product-wise revenue data
  const productRevenueData = state.products.slice(0, 10).map(product => {
    const revenue = Math.floor(Math.random() * 100000) + 10000;
    const unitsSold = Math.floor(Math.random() * 100) + 10;
    return {
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      revenue,
      unitsSold
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Payment mode distribution
  const paymentModeData = [
    { name: 'Cash', value: 35, color: '#2563eb' },
    { name: 'Card', value: 30, color: '#16a34a' },
    { name: 'UPI', value: 25, color: '#ea580c' },
    { name: 'Cheque', value: 10, color: '#dc2626' }
  ];

  // Category-wise sales
  const categorySalesData = state.categories.map(category => {
    const categoryProducts = state.products.filter(p => p.categoryId === category.id);
    const sales = Math.floor(Math.random() * 80000) + 20000;
    return {
      name: category.name,
      sales,
      products: categoryProducts.length
    };
  });

  const handleExportReport = () => {
    const reportData = {
      dateRange,
      summary: {
        totalSales,
        totalOrders,
        totalCustomers,
        avgOrderValue
      },
      salesData,
      productRevenueData,
      paymentModeData,
      categorySalesData
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <TrendingUp className="page-icon" />
          <div>
            <h1>Reports</h1>
            <p>Sales analytics and business insights</p>
          </div>
        </div>
        <Button onClick={handleExportReport}>
          <Download size={16} />
          Export Report
        </Button>
      </div>

      <div className="page-content">
        <div className="reports-controls">
          <div className="date-range-picker">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="report-type-selector">
            <Button
              variant={reportType === 'daily' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setReportType('daily')}
            >
              Daily
            </Button>
            <Button
              variant={reportType === 'weekly' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setReportType('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={reportType === 'monthly' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setReportType('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>

        <div className="reports-summary">
          <div className="summary-card">
            <div className="summary-icon summary-icon-green">
              <DollarSign size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">₹{totalSales.toLocaleString()}</div>
              <div className="summary-label">Total Sales</div>
              <div className="summary-change positive">+12.5% from last period</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-blue">
              <Package size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">{totalOrders}</div>
              <div className="summary-label">Total Orders</div>
              <div className="summary-change positive">+8.3% from last period</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-purple">
              <Users size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">{totalCustomers}</div>
              <div className="summary-label">Customers</div>
              <div className="summary-change positive">+15.2% from last period</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-orange">
              <TrendingUp size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">₹{Math.round(avgOrderValue).toLocaleString()}</div>
              <div className="summary-label">Avg Order Value</div>
              <div className="summary-change positive">+5.7% from last period</div>
            </div>
          </div>
        </div>

        <div className="reports-charts">
          <div className="chart-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Sales Trend</h3>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#2563eb' }}></div>
                    <span>Sales (₹)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#16a34a' }}></div>
                    <span>Orders</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis yAxisId="sales" orientation="left" />
                    <YAxis yAxisId="orders" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                      formatter={(value: any, name: string) => [
                        name === 'sales' ? `₹${value.toLocaleString()}` : value,
                        name === 'sales' ? 'Sales' : 'Orders'
                      ]}
                    />
                    <Line 
                      yAxisId="sales"
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="orders"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Products by Revenue</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={productRevenueData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip 
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="reports-sidebar">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Payment Mode Distribution</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentModeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentModeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {paymentModeData.map((entry, index) => (
                    <div key={index} className="legend-item">
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span>{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Category Performance</h3>
              </div>
              <div className="category-performance">
                {categorySalesData.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <div className="category-name">{category.name}</div>
                      <div className="category-products">{category.products} products</div>
                    </div>
                    <div className="category-sales">
                      ₹{category.sales.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-insights">
              <h3>Quick Insights</h3>
              <div className="insight-item">
                <div className="insight-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Best Selling Day</div>
                  <div className="insight-value">
                    {format(new Date(salesData.reduce((max, day) => day.sales > max.sales ? day : max).date), 'MMM dd')}
                  </div>
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon">
                  <Package size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Top Category</div>
                  <div className="insight-value">
                    {categorySalesData.reduce((max, cat) => cat.sales > max.sales ? cat : max).name}
                  </div>
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon">
                  <CreditCard size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Preferred Payment</div>
                  <div className="insight-value">
                    {paymentModeData.reduce((max, mode) => mode.value > max.value ? mode : max).name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;