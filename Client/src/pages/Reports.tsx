import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, DollarSign, Package, Users, CreditCard, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/common/Button';
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
import invoiceService from '../functions/invoice';
import ProductService from '../functions/product';
import CategoryService from '../functions/category';
import BrandService from '../functions/brand';

interface ReportData {
  invoices: any[];
  products: any[];
  categories: any[];
  brands: any[];
  customers: any[];
  loading: boolean;
  error: string | null;
}

const Reports: React.FC = () => {
  const { state } = useInventory();
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<ReportData>({
    invoices: [],
    products: [],
    categories: [],
    brands: [],
    customers: [],
    loading: true,
    error: null
  });

  // Fetch all data from APIs
  const fetchReportData = async () => {
    setReportData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [
        invoicesResponse,
        productsResponse,
        categoriesResponse,
        brandsResponse,
        customersResponse
      ] = await Promise.all([
        invoiceService.getAllInvoices(),
        ProductService.getAllProducts(),
        CategoryService.getAllCategories(),
        BrandService.getAllBrand(),
        invoiceService.getAllCustomers()
      ]);

      // Handle different response structures
      const extractData = (response: any) => {
        if (response && response.data) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return response;
      };

      setReportData({
        invoices: extractData(invoicesResponse),
        products: extractData(productsResponse),
        categories: extractData(categoriesResponse),
        brands: extractData(brandsResponse),
        customers: extractData(customersResponse),
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      setReportData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch report data'
      }));
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Filter invoices by date range
  const filteredInvoices = reportData.invoices.filter(invoice => {
    const invoiceDate = parseISO(invoice.createdAt);
    const start = parseISO(dateRange.startDate);
    const end = parseISO(dateRange.endDate);
    return isWithinInterval(invoiceDate, { start, end });
  });

  // Generate sales data for the selected date range
  const generateSalesData = () => {
    const data = [];
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Find invoices for this date
      const dayInvoices = filteredInvoices.filter(invoice => 
        format(parseISO(invoice.createdAt), 'yyyy-MM-dd') === dateStr
      );
      
      const daySales = dayInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      const dayOrders = dayInvoices.length;
      const dayCustomers = new Set(dayInvoices.map(invoice => 
        invoice.customer?.name || invoice.customerName || 'Unknown Customer'
      )).size;
      
      data.push({
        date: dateStr,
        sales: daySales,
        orders: dayOrders,
        customers: dayCustomers
      });
    }
    return data;
  };

  const salesData = generateSalesData();

  // Calculate summary metrics
  const totalSales = filteredInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const totalOrders = filteredInvoices.length;
  const totalCustomers = new Set(filteredInvoices.map(invoice => 
    invoice.customer?.name || invoice.customerName || 'Unknown Customer'
  )).size;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Customer analytics
  const customerAnalytics = () => {
    const customerStats: { [key: string]: { name: string; phone: string; orders: number; totalSpent: number } } = {};
    
    filteredInvoices.forEach(invoice => {
      const customerName = invoice.customer?.name || invoice.customerName || 'Unknown Customer';
      const customerPhone = invoice.customer?.phoneNumber || 'N/A';
      const orderTotal = invoice.total || 0;
      
      if (customerStats[customerName]) {
        customerStats[customerName].orders += 1;
        customerStats[customerName].totalSpent += orderTotal;
      } else {
        customerStats[customerName] = {
          name: customerName,
          phone: customerPhone,
          orders: 1,
          totalSpent: orderTotal
        };
      }
    });
    
    return Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  };

  // Product-wise revenue data (from invoice items)
  const productRevenueData = () => {
    const productSales: { [key: string]: { revenue: number; unitsSold: number; name: string } } = {};
    
    filteredInvoices.forEach(invoice => {
      if (invoice.invoiceItems) {
        invoice.invoiceItems.forEach((item: any) => {
          const productName = item.variant?.product?.name || item.productName || 'Unknown Product';
          const revenue = item.total || 0;
          const units = item.quantity || 0;
          
          if (productSales[productName]) {
            productSales[productName].revenue += revenue;
            productSales[productName].unitsSold += units;
          } else {
            productSales[productName] = {
              name: productName.length > 15 ? productName.substring(0, 15) + '...' : productName,
              revenue,
              unitsSold: units
            };
          }
        });
      }
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // Payment mode distribution
  const paymentModeData = () => {
    const paymentModes: { [key: string]: number } = {};
    let totalInvoices = 0;
    
    filteredInvoices.forEach(invoice => {
      const mode = invoice.paymentMode || 'Unknown';
      paymentModes[mode] = (paymentModes[mode] || 0) + 1;
      totalInvoices++;
    });
    
    const colors = ['#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#0891b2'];
    let colorIndex = 0;
    
    return Object.entries(paymentModes).map(([mode, count]) => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1),
      value: Math.round((count / totalInvoices) * 100),
      color: colors[colorIndex++ % colors.length]
    }));
  };

  // Category-wise sales
  const categorySalesData = () => {
    const categorySales: { [key: string]: { sales: number; products: number; name: string } } = {};
    
    // Initialize with all categories
    reportData.categories.forEach(category => {
      categorySales[category.name] = {
        name: category.name,
        sales: 0,
        products: reportData.products.filter(p => p.categoryId === category.id).length
      };
    });
    
    // Calculate sales from invoices
    filteredInvoices.forEach(invoice => {
      if (invoice.invoiceItems) {
        invoice.invoiceItems.forEach((item: any) => {
          const categoryName = item.variant?.product?.category?.name;
          if (categoryName && categorySales[categoryName]) {
            categorySales[categoryName].sales += item.total || 0;
          }
        });
      }
    });
    
    return Object.values(categorySales).filter(cat => cat.sales > 0);
  };

  // Brand performance
  const brandPerformanceData = () => {
    const brandSales: { [key: string]: { sales: number; products: number; name: string } } = {};
    
    // Initialize with all brands
    reportData.brands.forEach(brand => {
      brandSales[brand.name] = {
        name: brand.name,
        sales: 0,
        products: reportData.products.filter(p => p.brandId === brand.id).length
      };
    });
    
    // Calculate sales from invoices
    filteredInvoices.forEach(invoice => {
      if (invoice.invoiceItems) {
        invoice.invoiceItems.forEach((item: any) => {
          const brandName = item.variant?.product?.brand?.name;
          if (brandName && brandSales[brandName]) {
            brandSales[brandName].sales += item.total || 0;
          }
        });
      }
    });
    
    return Object.values(brandSales).filter(brand => brand.sales > 0);
  };

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
      productRevenueData: productRevenueData(),
      paymentModeData: paymentModeData(),
      categorySalesData: categorySalesData(),
      brandPerformanceData: brandPerformanceData(),
      customerAnalytics: customerAnalytics(),
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (reportData.loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">
            <TrendingUp className="page-icon" />
            <div>
              <h1>Reports</h1>
              <p>Loading report data...</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Fetching data from all APIs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (reportData.error) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">
            <TrendingUp className="page-icon" />
            <div>
              <h1>Reports</h1>
              <p>Error loading reports</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="error-state">
            <AlertCircle size={48} className="error-icon" />
            <h3>Failed to load report data</h3>
            <p>{reportData.error}</p>
            <Button onClick={fetchReportData}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <TrendingUp className="page-icon" />
          <div>
            <h1>Reports</h1>
            <p>Real-time analytics using all APIs</p>
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
              <div className="summary-change positive">
                {filteredInvoices.length > 0 ? `${filteredInvoices.length} orders` : 'No orders'}
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-blue">
              <Package size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">{totalOrders}</div>
              <div className="summary-label">Total Orders</div>
              <div className="summary-change positive">
                {reportData.products.length} products available
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-purple">
              <Users size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">{totalCustomers}</div>
              <div className="summary-label">Unique Customers</div>
              <div className="summary-change positive">
                {reportData.customers.length} total customers in database
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-orange">
              <TrendingUp size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">₹{Math.round(avgOrderValue).toLocaleString()}</div>
              <div className="summary-label">Avg Order Value</div>
              <div className="summary-change positive">
                {totalCustomers > 0 ? 
                  `₹${Math.round(totalSales / totalCustomers).toLocaleString()} avg per customer` :
                  `${reportData.categories.length} categories`
                }
              </div>
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
                  <BarChart data={productRevenueData()} layout="horizontal">
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
                      data={paymentModeData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentModeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {paymentModeData().map((entry, index) => (
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
                {categorySalesData().map((category, index) => (
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

            <div className="chart-card">
              <div className="chart-header">
                <h3>Brand Performance</h3>
              </div>
              <div className="brand-performance">
                {brandPerformanceData().map((brand, index) => (
                  <div key={index} className="brand-item">
                    <div className="brand-info">
                      <div className="brand-name">{brand.name}</div>
                      <div className="brand-products">{brand.products} products</div>
                    </div>
                    <div className="brand-sales">
                      ₹{brand.sales.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Customers</h3>
              </div>
              <div className="customer-performance">
                {customerAnalytics().map((customer, index) => (
                  <div key={index} className="customer-item">
                    <div className="customer-info">
                      <div className="customer-name">{customer.name}</div>
                      <div className="customer-phone">{customer.phone}</div>
                      <div className="customer-orders">{customer.orders} orders</div>
                    </div>
                    <div className="customer-spent">
                      ₹{customer.totalSpent.toLocaleString()}
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
                    {salesData.length > 0 ? 
                      format(new Date(salesData.reduce((max, day) => day.sales > max.sales ? day : max).date), 'MMM dd') :
                      'No data'
                    }
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
                    {categorySalesData().length > 0 ? 
                      categorySalesData().reduce((max, cat) => cat.sales > max.sales ? cat : max).name :
                      'No data'
                    }
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
                    {paymentModeData().length > 0 ? 
                      paymentModeData().reduce((max, mode) => mode.value > max.value ? mode : max).name :
                      'No data'
                    }
                  </div>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">
                  <Users size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Top Brand</div>
                  <div className="insight-value">
                    {brandPerformanceData().length > 0 ? 
                      brandPerformanceData().reduce((max, brand) => brand.sales > max.sales ? brand : max).name :
                      'No data'
                    }
                  </div>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">
                  <Users size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Top Customer</div>
                  <div className="insight-value">
                    {customerAnalytics().length > 0 ? 
                      customerAnalytics()[0].name :
                      'No data'
                    }
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