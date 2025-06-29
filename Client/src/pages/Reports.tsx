import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, DollarSign, Package, Users, CreditCard, AlertCircle, ShoppingCart, BarChart3, Target, Activity, PieChart as PieChartIcon, LineChart as LineChartIcon, Filter, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/common/Button';
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval, getDay, getMonth, getQuarter, getYear, differenceInDays } from 'date-fns';
import invoiceService from '../functions/invoice';
import productService from '../functions/product';
import categoryService from '../functions/category';
import brandService from '../functions/brand';
import { Invoice, Product, Category, Brand } from '../types';

interface ReportData {
  invoices: Invoice[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  customers: any[];
  loading: boolean;
  error: string | null;
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  customers: number;
  profit: number;
  margin: number;
}

interface ProductRevenueData {
  name: string;
  revenue: number;
  unitsSold: number;
  stockValue: number;
  profit: number;
  margin: number;
  turnoverRate: number;
}

interface CategorySalesData {
  name: string;
  sales: number;
  products: number;
  stockValue: number;
  profit: number;
  margin: number;
  turnoverRate: number;
}

interface BrandPerformanceData {
  name: string;
  sales: number;
  products: number;
  stockValue: number;
  profit: number;
  margin: number;
  turnoverRate: number;
}

interface PaymentModeData {
  name: string;
  value: number;
  color: string;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  avgCustomerValue: number;
  topCustomers: Array<{
    name: string;
    totalSpent: number;
    orders: number;
    lastOrder: string;
  }>;
}

interface InventoryMetrics {
  totalValue: number;
  outOfStock: number;
  lowStock: number;
  turnoverRate: number;
  avgStockAge: number;
  deadStock: number;
}

interface SeasonalData {
  month: string;
  sales: number;
  orders: number;
  avgOrderValue: number;
}

const Reports: React.FC = () => {
  const { state } = useInventory();
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['sales', 'profit', 'inventory']);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
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
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setReportData(prev => ({ ...prev, loading: true, error: null }));
        
        const [invoices, products, categories, brands, customers] = await Promise.all([
          invoiceService.getAllInvoices(),
          productService.getAllProducts(),
          categoryService.getAllCategories(),
          brandService.getAllBrand(),
          invoiceService.getAllCustomers()
        ]);

        setReportData({
          invoices,
          products,
          categories,
          brands,
          customers,
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

    fetchReportData();
  }, []);

  // Filter invoices by date range
  const filteredInvoices = (reportData.invoices || []).filter(invoice => {
    if (!invoice.createdAt) return false;
    const invoiceDate = parseISO(invoice.createdAt.toString());
    const start = parseISO(dateRange.startDate);
    const end = parseISO(dateRange.endDate);
    return isWithinInterval(invoiceDate, { start, end });
  });

  // Calculate profit margins (assuming 30% profit margin for demo)
  const calculateProfit = (revenue: number) => revenue * 0.3;
  const calculateMargin = (revenue: number, profit: number) => (profit / revenue) * 100;

  // Generate advanced sales data with profit calculations
  const generateSalesData = (): SalesData[] => {
    const data: SalesData[] = [];
    const start = parseISO(dateRange.startDate);
    const end = parseISO(dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayInvoices = filteredInvoices.filter(invoice => {
        if (!invoice.createdAt) return false;
        return format(parseISO(invoice.createdAt.toString()), 'yyyy-MM-dd') === dateStr;
      });

      const daySales = dayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const dayProfit = calculateProfit(daySales);
      const dayMargin = daySales > 0 ? calculateMargin(daySales, dayProfit) : 0;
      const dayOrders = dayInvoices.length;
      const dayCustomers = new Set(dayInvoices.map(invoice => invoice.customerPhone)).size;

      data.push({
        date: dateStr,
        sales: daySales,
        orders: dayOrders,
        customers: dayCustomers,
        profit: dayProfit,
        margin: dayMargin
      });
    }
    return data;
  };

  const salesData = generateSalesData();

  // Calculate summary metrics
  const totalSales = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalProfit = calculateProfit(totalSales);
  const totalMargin = totalSales > 0 ? calculateMargin(totalSales, totalProfit) : 0;
  const totalOrders = filteredInvoices.length;
  const totalCustomers = new Set(filteredInvoices.map(invoice => invoice.customerPhone)).size;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Advanced product analytics
  const productRevenueData: ProductRevenueData[] = (reportData.products || []).map(product => {
    const productInvoices = filteredInvoices.filter(invoice =>
      invoice.invoiceItems.some(item => item.productId === product.id)
    );
    
    const revenue = productInvoices.reduce((sum, invoice) => {
      const items = invoice.invoiceItems.filter(item => item.productId === product.id);
      return sum + items.reduce((itemSum, item) => itemSum + item.total, 0);
    }, 0);

    const unitsSold = productInvoices.reduce((sum, invoice) => {
      const items = invoice.invoiceItems.filter(item => item.productId === product.id);
      return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const stockValue = product.variants.reduce((sum, variant) => 
      sum + (variant.price * variant.stock_qty), 0
    );

    const profit = calculateProfit(revenue);
    const margin = revenue > 0 ? calculateMargin(revenue, profit) : 0;
    const turnoverRate = stockValue > 0 ? (revenue / stockValue) * 100 : 0;

    return {
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      revenue,
      unitsSold,
      stockValue,
      profit,
      margin,
      turnoverRate
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Payment mode distribution
  const paymentModeCounts = filteredInvoices.reduce((acc, invoice) => {
    acc[invoice.paymentMode] = (acc[invoice.paymentMode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalPayments = Object.values(paymentModeCounts).reduce((sum, count) => sum + count, 0);
  
  const paymentModeData: PaymentModeData[] = [
    { name: 'Cash', value: Math.round((paymentModeCounts.cash || 0) / totalPayments * 100), color: '#2563eb' },
    { name: 'Card', value: Math.round((paymentModeCounts.card || 0) / totalPayments * 100), color: '#16a34a' },
    { name: 'UPI', value: Math.round((paymentModeCounts.upi || 0) / totalPayments * 100), color: '#ea580c' },
    { name: 'Cheque', value: Math.round((paymentModeCounts.cheque || 0) / totalPayments * 100), color: '#dc2626' }
  ].filter(item => item.value > 0);

  // Advanced category analytics
  const categorySalesData: CategorySalesData[] = (reportData.categories || []).map(category => {
    const categoryProducts = (reportData.products || []).filter(p => p.categoryId === category.id);
    const categoryInvoices = filteredInvoices.filter(invoice =>
      invoice.invoiceItems.some(item => 
        categoryProducts.some(product => product.id === item.productId)
      )
    );
    
    const sales = categoryInvoices.reduce((sum, invoice) => {
      const items = invoice.invoiceItems.filter(item => 
        categoryProducts.some(product => product.id === item.productId)
      );
      return sum + items.reduce((itemSum, item) => itemSum + item.total, 0);
    }, 0);

    const stockValue = categoryProducts.reduce((sum, product) => 
      sum + product.variants.reduce((variantSum, variant) => 
        variantSum + (variant.price * variant.stock_qty), 0
      ), 0
    );

    const profit = calculateProfit(sales);
    const margin = sales > 0 ? calculateMargin(sales, profit) : 0;
    const turnoverRate = stockValue > 0 ? (sales / stockValue) * 100 : 0;

    return {
      name: category.name,
      sales,
      products: categoryProducts.length,
      stockValue,
      profit,
      margin,
      turnoverRate
    };
  }).sort((a, b) => b.sales - a.sales);

  // Advanced brand analytics
  const brandPerformanceData: BrandPerformanceData[] = (reportData.brands || []).map(brand => {
    const brandProducts = (reportData.products || []).filter(p => p.brandId === brand.id);
    const brandInvoices = filteredInvoices.filter(invoice =>
      invoice.invoiceItems.some(item => 
        brandProducts.some(product => product.id === item.productId)
      )
    );
    
    const sales = brandInvoices.reduce((sum, invoice) => {
      const items = invoice.invoiceItems.filter(item => 
        brandProducts.some(product => product.id === item.productId)
      );
      return sum + items.reduce((itemSum, item) => itemSum + item.total, 0);
    }, 0);

    const stockValue = brandProducts.reduce((sum, product) => 
      sum + product.variants.reduce((variantSum, variant) => 
        variantSum + (variant.price * variant.stock_qty), 0
      ), 0
    );

    const profit = calculateProfit(sales);
    const margin = sales > 0 ? calculateMargin(sales, profit) : 0;
    const turnoverRate = stockValue > 0 ? (sales / stockValue) * 100 : 0;

    return {
      name: brand.name,
      sales,
      products: brandProducts.length,
      stockValue,
      profit,
      margin,
      turnoverRate
    };
  }).sort((a, b) => b.sales - a.sales);

  // Customer analytics
  const customerAnalytics: CustomerAnalytics = (() => {
    const customerMap = new Map<string, { totalSpent: number; orders: number; lastOrder: string }>();
    
    filteredInvoices.forEach(invoice => {
      const phone = invoice.customerPhone || 'Unknown';
      const existing = customerMap.get(phone) || { totalSpent: 0, orders: 0, lastOrder: '' };
      
      customerMap.set(phone, {
        totalSpent: existing.totalSpent + invoice.total,
        orders: existing.orders + 1,
        lastOrder: invoice.createdAt ? format(parseISO(invoice.createdAt.toString()), 'MMM dd, yyyy') : ''
      });
    });

    const customers = Array.from(customerMap.entries()).map(([phone, data]) => ({
      name: phone,
      ...data
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    const totalCustomers = customerMap.size;
    const newCustomers = filteredInvoices.filter(invoice => {
      const phone = invoice.customerPhone || 'Unknown';
      const firstOrder = filteredInvoices
        .filter(inv => (inv.customerPhone || 'Unknown') === phone)
        .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime())[0];
      return firstOrder && firstOrder.createdAt && differenceInDays(new Date(), parseISO(firstOrder.createdAt.toString())) <= 30;
    }).length;

    const repeatCustomers = customers.filter(c => c.orders > 1).length;
    const avgCustomerValue = totalCustomers > 0 ? totalSales / totalCustomers : 0;

    return {
      totalCustomers,
      newCustomers,
      repeatCustomers,
      avgCustomerValue,
      topCustomers: customers.slice(0, 5)
    };
  })();

  // Inventory metrics
  const inventoryMetrics: InventoryMetrics = (() => {
    const products = reportData.products || [];
    const totalValue = products.reduce((sum, product) => 
      sum + product.variants.reduce((variantSum, variant) => 
        variantSum + (variant.price * variant.stock_qty), 0
      ), 0
    );

    const outOfStock = products.filter(product =>
      product.variants.every(variant => variant.stock_qty === 0)
    ).length;

    const lowStock = products.filter(product =>
      product.variants.some(variant => variant.stock_qty > 0 && variant.stock_qty <= 10)
    ).length;

    const turnoverRate = totalValue > 0 ? (totalSales / totalValue) * 100 : 0;
    
    // Calculate average stock age (simplified - assuming 30 days for demo)
    const avgStockAge = 30;
    
    // Dead stock (products with no sales in last 30 days)
    const deadStock = products.filter(product => {
      const productInvoices = filteredInvoices.filter(invoice =>
        invoice.invoiceItems.some(item => item.productId === product.id)
      );
      return productInvoices.length === 0;
    }).length;

    return {
      totalValue,
      outOfStock,
      lowStock,
      turnoverRate,
      avgStockAge,
      deadStock
    };
  })();

  // Seasonal analysis
  const seasonalData: SeasonalData[] = (() => {
    const monthlyData = new Map<string, { sales: number; orders: number; totalOrders: number }>();
    
    filteredInvoices.forEach(invoice => {
      if (!invoice.createdAt) return;
      const month = format(parseISO(invoice.createdAt.toString()), 'MMM yyyy');
      const existing = monthlyData.get(month) || { sales: 0, orders: 0, totalOrders: 0 };
      
      monthlyData.set(month, {
        sales: existing.sales + invoice.total,
        orders: existing.orders + 1,
        totalOrders: existing.totalOrders + 1
      });
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      sales: data.sales,
      orders: data.orders,
      avgOrderValue: data.orders > 0 ? data.sales / data.orders : 0
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  })();

  // Advanced KPI calculations
  const kpiMetrics = (() => {
    const daysInPeriod = differenceInDays(parseISO(dateRange.endDate), parseISO(dateRange.startDate)) + 1;
    const avgDailySales = totalSales / daysInPeriod;
    const avgDailyOrders = totalOrders / daysInPeriod;
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;
    const customerLifetimeValue = customerAnalytics.avgCustomerValue * 12; // Annual projection
    const inventoryEfficiency = inventoryMetrics.turnoverRate;
    const profitMargin = totalMargin;
    
    // Growth rate calculation (compared to previous period)
    const previousPeriodStart = format(subDays(parseISO(dateRange.startDate), daysInPeriod), 'yyyy-MM-dd');
    const previousPeriodEnd = format(subDays(parseISO(dateRange.startDate), 1), 'yyyy-MM-dd');
    
    const previousPeriodInvoices = (reportData.invoices || []).filter(invoice => {
      if (!invoice.createdAt) return false;
      const invoiceDate = parseISO(invoice.createdAt.toString());
      const start = parseISO(previousPeriodStart);
      const end = parseISO(previousPeriodEnd);
      return isWithinInterval(invoiceDate, { start, end });
    });
    
    const previousPeriodSales = previousPeriodInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const salesGrowthRate = previousPeriodSales > 0 ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 : 0;

    return {
      avgDailySales,
      avgDailyOrders,
      conversionRate,
      customerLifetimeValue,
      inventoryEfficiency,
      profitMargin,
      salesGrowthRate
    };
  })();

  // Predictive analytics (simplified forecasting)
  const predictiveAnalytics = (() => {
    const recentSales = salesData.slice(-7); // Last 7 days
    const avgRecentSales = recentSales.reduce((sum, day) => sum + day.sales, 0) / recentSales.length;
    const projectedMonthlySales = avgRecentSales * 30;
    const projectedMonthlyProfit = calculateProfit(projectedMonthlySales);
    
    // Trend analysis
    const salesTrend = recentSales.length > 1 ? 
      (recentSales[recentSales.length - 1].sales - recentSales[0].sales) / recentSales.length : 0;
    
    const trendDirection = salesTrend > 0 ? 'increasing' : salesTrend < 0 ? 'decreasing' : 'stable';
    const trendStrength = Math.abs(salesTrend) > avgRecentSales * 0.1 ? 'strong' : 'moderate';

    return {
      projectedMonthlySales,
      projectedMonthlyProfit,
      salesTrend,
      trendDirection,
      trendStrength
    };
  })();

  // Performance benchmarks
  const performanceBenchmarks = (() => {
    const industryAvgMargin = 25; // Industry average profit margin
    const industryAvgTurnover = 8; // Industry average inventory turnover
    const industryAvgConversion = 15; // Industry average conversion rate
    
    const marginPerformance = totalMargin > industryAvgMargin ? 'above' : 'below';
    const turnoverPerformance = inventoryMetrics.turnoverRate > industryAvgTurnover ? 'above' : 'below';
    const conversionPerformance = kpiMetrics.conversionRate > industryAvgConversion ? 'above' : 'below';
    
    return {
      marginPerformance,
      turnoverPerformance,
      conversionPerformance,
      industryAvgMargin,
      industryAvgTurnover,
      industryAvgConversion
    };
  })();

  // Risk assessment
  const riskAssessment = (() => {
    const outOfStockRisk = inventoryMetrics.outOfStock / (reportData.products || []).length * 100;
    const lowStockRisk = inventoryMetrics.lowStock / (reportData.products || []).length * 100;
    const deadStockRisk = inventoryMetrics.deadStock / (reportData.products || []).length * 100;
    
    const overallRisk = (outOfStockRisk + lowStockRisk + deadStockRisk) / 3;
    const riskLevel = overallRisk > 20 ? 'high' : overallRisk > 10 ? 'medium' : 'low';
    
    return {
      outOfStockRisk,
      lowStockRisk,
      deadStockRisk,
      overallRisk,
      riskLevel
    };
  })();

  const handleExportReport = () => {
    const reportData = {
      dateRange,
      summary: {
        totalSales,
        totalProfit,
        totalMargin,
        totalOrders,
        totalCustomers,
        avgOrderValue,
        inventoryMetrics,
        customerAnalytics
      },
      salesData,
      productRevenueData,
      paymentModeData,
      categorySalesData,
      brandPerformanceData,
      seasonalData,
      kpiMetrics,
      predictiveAnalytics,
      performanceBenchmarks,
      riskAssessment
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `advanced-inventory-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (reportData.loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">
            <TrendingUp className="page-icon" />
            <div>
              <h1>Advanced Reports</h1>
              <p>Loading comprehensive analytics...</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="loading-spinner">Loading advanced analytics...</div>
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
              <h1>Advanced Reports</h1>
              <p>Error loading reports</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="error-message">
            <AlertCircle size={24} />
            <p>{reportData.error}</p>
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
            <h1>Advanced Reports</h1>
            <p>Comprehensive business analytics and insights</p>
          </div>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download size={16} />
            Export Report
          </Button>
        </div>
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

          <div className="chart-type-selector">
            <Button
              variant={chartType === 'line' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon size={16} />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 size={16} />
            </Button>
            <Button
              variant={chartType === 'area' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <Activity size={16} />
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
                ₹{totalProfit.toLocaleString()} profit ({totalMargin.toFixed(1)}% margin)
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
                ₹{avgOrderValue.toLocaleString()} avg order
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-purple">
              <Users size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">{customerAnalytics.totalCustomers}</div>
              <div className="summary-label">Customers</div>
              <div className="summary-change positive">
                {customerAnalytics.newCustomers} new, {customerAnalytics.repeatCustomers} repeat
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon summary-icon-orange">
              <Target size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">₹{totalProfit.toLocaleString()}</div>
              <div className="summary-label">Total Profit</div>
              <div className="summary-change positive">
                {totalMargin.toFixed(1)}% margin
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-red">
              <ShoppingCart size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">₹{inventoryMetrics.totalValue.toLocaleString()}</div>
              <div className="summary-label">Inventory Value</div>
              <div className="summary-change neutral">
                {inventoryMetrics.turnoverRate.toFixed(1)}% turnover
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-yellow">
              <AlertCircle size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">{inventoryMetrics.outOfStock}</div>
              <div className="summary-label">Out of Stock</div>
              <div className="summary-change warning">
                {inventoryMetrics.lowStock} low stock, {inventoryMetrics.deadStock} dead stock
              </div>
            </div>
          </div>
        </div>

        <div className="reports-charts">
          <div className="chart-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Sales & Profit Trend</h3>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#2563eb' }}></div>
                    <span>Sales (₹)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#16a34a' }}></div>
                    <span>Profit (₹)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#ea580c' }}></div>
                    <span>Margin (%)</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis yAxisId="sales" orientation="left" />
                    <YAxis yAxisId="margin" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                      formatter={(value: any, name: string) => [
                        name === 'sales' ? `₹${value.toLocaleString()}` : 
                        name === 'profit' ? `₹${value.toLocaleString()}` : 
                        `${value.toFixed(1)}%`,
                        name === 'sales' ? 'Sales' : name === 'profit' ? 'Profit' : 'Margin'
                      ]}
                    />
                    <Area 
                      yAxisId="sales"
                      type="monotone" 
                      dataKey="sales" 
                      fill="#2563eb" 
                      stroke="#2563eb"
                      fillOpacity={0.3}
                    />
                    <Line 
                      yAxisId="sales"
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="margin"
                      type="monotone" 
                      dataKey="margin" 
                      stroke="#ea580c" 
                      strokeWidth={2}
                      dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Products Performance</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={productRevenueData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? `₹${value.toLocaleString()}` : 
                        name === 'profit' ? `₹${value.toLocaleString()}` : 
                        `${value.toFixed(1)}%`,
                        name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : 'Margin'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" />
                    <Bar dataKey="profit" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Seasonal Analysis</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'sales' ? `₹${value.toLocaleString()}` : 
                        name === 'avgOrderValue' ? `₹${value.toLocaleString()}` : value,
                        name === 'sales' ? 'Sales' : name === 'avgOrderValue' ? 'Avg Order' : 'Orders'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      fill="#2563eb" 
                      stroke="#2563eb"
                      fillOpacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgOrderValue" 
                      stroke="#ea580c" 
                      strokeWidth={2}
                      dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>KPI Performance Dashboard</h3>
              </div>
              <div className="kpi-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <TrendingUp size={20} />
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-value">₹{kpiMetrics.avgDailySales.toLocaleString()}</div>
                      <div className="kpi-label">Avg Daily Sales</div>
                      <div className="kpi-change positive">
                        {kpiMetrics.salesGrowthRate > 0 ? '+' : ''}{kpiMetrics.salesGrowthRate.toFixed(1)}% growth
                      </div>
                    </div>
                  </div>
                  
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <Target size={20} />
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-value">{kpiMetrics.conversionRate.toFixed(1)}%</div>
                      <div className="kpi-label">Conversion Rate</div>
                      <div className="kpi-change neutral">
                        vs {performanceBenchmarks.industryAvgConversion}% industry avg
                      </div>
                    </div>
                  </div>
                  
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <Users size={20} />
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-value">₹{kpiMetrics.customerLifetimeValue.toLocaleString()}</div>
                      <div className="kpi-label">Customer LTV</div>
                      <div className="kpi-change positive">
                        Annual projection
                      </div>
                    </div>
                  </div>
                  
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <Activity size={20} />
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-value">{kpiMetrics.inventoryEfficiency.toFixed(1)}%</div>
                      <div className="kpi-label">Inventory Turnover</div>
                      <div className="kpi-change neutral">
                        vs {performanceBenchmarks.industryAvgTurnover}% industry avg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Predictive Analytics</h3>
              </div>
              <div className="predictive-analytics">
                <div className="forecast-section">
                  <h4>Sales Forecast</h4>
                  <div className="forecast-metrics">
                    <div className="forecast-item">
                      <div className="forecast-label">Projected Monthly Sales</div>
                      <div className="forecast-value">₹{predictiveAnalytics.projectedMonthlySales.toLocaleString()}</div>
                    </div>
                    <div className="forecast-item">
                      <div className="forecast-label">Projected Monthly Profit</div>
                      <div className="forecast-value">₹{predictiveAnalytics.projectedMonthlyProfit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="trend-section">
                  <h4>Trend Analysis</h4>
                  <div className="trend-indicators">
                    <div className="trend-item">
                      <div className="trend-label">Direction</div>
                      <div className={`trend-value trend-${predictiveAnalytics.trendDirection}`}>
                        {predictiveAnalytics.trendDirection.charAt(0).toUpperCase() + predictiveAnalytics.trendDirection.slice(1)}
                      </div>
                    </div>
                    <div className="trend-item">
                      <div className="trend-label">Strength</div>
                      <div className={`trend-value trend-${predictiveAnalytics.trendStrength}`}>
                        {predictiveAnalytics.trendStrength.charAt(0).toUpperCase() + predictiveAnalytics.trendStrength.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reports-sidebar">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Payment Distribution</h3>
              </div>
              <div className="chart-container">
                {paymentModeData.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <div className="no-data">No payment data available</div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Customer Analytics</h3>
              </div>
              <div className="customer-analytics">
                <div className="analytics-summary">
                  <div className="analytics-item">
                    <div className="analytics-label">Total Customers</div>
                    <div className="analytics-value">{customerAnalytics.totalCustomers}</div>
                  </div>
                  <div className="analytics-item">
                    <div className="analytics-label">New Customers</div>
                    <div className="analytics-value">{customerAnalytics.newCustomers}</div>
                  </div>
                  <div className="analytics-item">
                    <div className="analytics-label">Repeat Customers</div>
                    <div className="analytics-value">{customerAnalytics.repeatCustomers}</div>
                  </div>
                  <div className="analytics-item">
                    <div className="analytics-label">Avg Customer Value</div>
                    <div className="analytics-value">₹{customerAnalytics.avgCustomerValue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="top-customers">
                  <h4>Top Customers</h4>
                  {customerAnalytics.topCustomers.map((customer, index) => (
                    <div key={index} className="customer-item">
                      <div className="customer-info">
                        <div className="customer-name">{customer.name}</div>
                        <div className="customer-orders">{customer.orders} orders</div>
                      </div>
                      <div className="customer-spent">
                        ₹{customer.totalSpent.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Inventory Metrics</h3>
              </div>
              <div className="inventory-metrics">
                <div className="metrics-item">
                  <div className="metrics-label">Total Value</div>
                  <div className="metrics-value">₹{inventoryMetrics.totalValue.toLocaleString()}</div>
                </div>
                <div className="metrics-item">
                  <div className="metrics-label">Turnover Rate</div>
                  <div className="metrics-value">{inventoryMetrics.turnoverRate.toFixed(1)}%</div>
                </div>
                <div className="metrics-item">
                  <div className="metrics-label">Avg Stock Age</div>
                  <div className="metrics-value">{inventoryMetrics.avgStockAge} days</div>
                </div>
                <div className="metrics-item">
                  <div className="metrics-label">Dead Stock</div>
                  <div className="metrics-value">{inventoryMetrics.deadStock} items</div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Risk Assessment</h3>
              </div>
              <div className="risk-assessment">
                <div className="risk-overview">
                  <div className={`risk-level risk-${riskAssessment.riskLevel}`}>
                    <div className="risk-label">Overall Risk Level</div>
                    <div className="risk-value">{riskAssessment.riskLevel.toUpperCase()}</div>
                    <div className="risk-score">{riskAssessment.overallRisk.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="risk-breakdown">
                  <div className="risk-item">
                    <div className="risk-item-label">Out of Stock Risk</div>
                    <div className="risk-item-value">{riskAssessment.outOfStockRisk.toFixed(1)}%</div>
                  </div>
                  <div className="risk-item">
                    <div className="risk-item-label">Low Stock Risk</div>
                    <div className="risk-item-value">{riskAssessment.lowStockRisk.toFixed(1)}%</div>
                  </div>
                  <div className="risk-item">
                    <div className="risk-item-label">Dead Stock Risk</div>
                    <div className="risk-item-value">{riskAssessment.deadStockRisk.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Performance Benchmarks</h3>
              </div>
              <div className="performance-benchmarks">
                <div className="benchmark-item">
                  <div className="benchmark-label">Profit Margin</div>
                  <div className="benchmark-comparison">
                    <div className="benchmark-value">{totalMargin.toFixed(1)}%</div>
                    <div className={`benchmark-status ${performanceBenchmarks.marginPerformance}`}>
                      {performanceBenchmarks.marginPerformance} industry avg ({performanceBenchmarks.industryAvgMargin}%)
                    </div>
                  </div>
                </div>
                <div className="benchmark-item">
                  <div className="benchmark-label">Inventory Turnover</div>
                  <div className="benchmark-comparison">
                    <div className="benchmark-value">{inventoryMetrics.turnoverRate.toFixed(1)}%</div>
                    <div className={`benchmark-status ${performanceBenchmarks.turnoverPerformance}`}>
                      {performanceBenchmarks.turnoverPerformance} industry avg ({performanceBenchmarks.industryAvgTurnover}%)
                    </div>
                  </div>
                </div>
                <div className="benchmark-item">
                  <div className="benchmark-label">Conversion Rate</div>
                  <div className="benchmark-comparison">
                    <div className="benchmark-value">{kpiMetrics.conversionRate.toFixed(1)}%</div>
                    <div className={`benchmark-status ${performanceBenchmarks.conversionPerformance}`}>
                      {performanceBenchmarks.conversionPerformance} industry avg ({performanceBenchmarks.industryAvgConversion}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-insights">
              <h3>Advanced Insights</h3>
              <div className="insight-item">
                <div className="insight-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Best Performing Day</div>
                  <div className="insight-value">
                    {salesData.length > 0 && salesData.reduce((max, day) => day.sales > max.sales ? day : max).sales > 0
                      ? format(new Date(salesData.reduce((max, day) => day.sales > max.sales ? day : max).date), 'MMM dd')
                      : 'No sales data'
                    }
                  </div>
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon">
                  <Target size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Highest Margin</div>
                  <div className="insight-value">
                    {categorySalesData.length > 0 ? `${categorySalesData[0].name} (${categorySalesData[0].margin.toFixed(1)}%)` : 'No data'}
                  </div>
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon">
                  <Activity size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Inventory Turnover</div>
                  <div className="insight-value">
                    {brandPerformanceData.length > 0 ? `${brandPerformanceData[0].name} (${brandPerformanceData[0].turnoverRate.toFixed(1)}%)` : 'No data'}
                  </div>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">
                  <Users size={20} />
                </div>
                <div className="insight-content">
                  <div className="insight-title">Customer Retention</div>
                  <div className="insight-value">
                    {customerAnalytics.totalCustomers > 0 ? `${((customerAnalytics.repeatCustomers / customerAnalytics.totalCustomers) * 100).toFixed(1)}%` : '0%'}
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