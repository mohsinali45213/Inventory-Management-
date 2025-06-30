import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  FileText, 
  Users, 
  Tag, 
  Folder,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import ProductService from '../functions/product';
import invoiceService from '../functions/invoice';
import CategoryService from '../functions/category';
import BrandService from '../functions/brand';
import SubCategoryService from '../functions/subCategory';
import { Product, Invoice, Category, Brand, SubCategory } from '../types';
import StatCard from '../components/dashboard/StatCard';
import Toast from '../components/common/Toast';

interface ReportData {
  products: Product[];
  invoices: Invoice[];
  categories: Category[];
  brands: Brand[];
  subCategories: SubCategory[];
  customers: any[];
  loading: boolean;
  error: string | null;
}

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

interface CategoryStats {
  name: string;
  productCount: number;
  totalValue: number;
}

interface BrandStats {
  name: string;
  productCount: number;
  totalValue: number;
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    products: [],
    invoices: [],
    categories: [],
    brands: [],
    subCategories: [],
    customers: [],
    loading: true,
    error: null
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Calculate statistics
  const totalProducts = reportData.products.length;
  const totalInvoices = reportData.invoices.length;
  const totalCategories = reportData.categories.length;
  const totalBrands = reportData.brands.length;
  const totalCustomers = reportData.customers.length;

  const totalRevenue = reportData.invoices.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);
  const totalInventoryValue = reportData.products.reduce((sum, product) => {
    return sum + product.variants.reduce((variantSum, variant) => {
      return variantSum + (variant.price * variant.stock_qty);
    }, 0);
  }, 0);

  const lowStockProducts = reportData.products.filter(product =>
    product.variants.some(variant => variant.stock_qty <= 10)
  ).length;

  const outOfStockProducts = reportData.products.filter(product =>
    product.variants.some(variant => variant.stock_qty === 0)
  ).length;

  // Calculate sales data for charts
  const getSalesData = (): SalesData[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayInvoices = reportData.invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt || '').toISOString().split('T')[0];
        return invoiceDate === date;
      });

      return {
        date,
        sales: dayInvoices.length,
        revenue: dayInvoices.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0)
      };
    });
  };

  // Calculate category statistics
  const getCategoryStats = (): CategoryStats[] => {
    return reportData.categories.map(category => {
      const categoryProducts = reportData.products.filter(product => product.categoryId === category.id);
      const totalValue = categoryProducts.reduce((sum, product) => {
        return sum + product.variants.reduce((variantSum, variant) => {
          return variantSum + (variant.price * variant.stock_qty);
        }, 0);
      }, 0);

      return {
        name: category.name,
        productCount: categoryProducts.length,
        totalValue
      };
    });
  };

  // Calculate brand statistics
  const getBrandStats = (): BrandStats[] => {
    return reportData.brands.map(brand => {
      const brandProducts = reportData.products.filter(product => product.brandId === brand.id);
      const totalValue = brandProducts.reduce((sum, product) => {
        return sum + product.variants.reduce((variantSum, variant) => {
          return variantSum + (variant.price * variant.stock_qty);
        }, 0);
      }, 0);

      return {
        name: brand.name,
        productCount: brandProducts.length,
        totalValue
      };
    });
  };

  // Fetch all data
  const fetchReportData = async () => {
    try {
      setReportData(prev => ({ ...prev, loading: true, error: null }));

      const [
        products,
        invoices,
        categories,
        brands,
        subCategories,
        customers
      ] = await Promise.all([
        ProductService.getAllProducts(),
        invoiceService.getAllInvoices(),
        CategoryService.getAllCategories(),
        BrandService.getAllBrand(),
        SubCategoryService.getAllSubCategories(),
        invoiceService.getAllCustomers()
      ]);

      setReportData({
        products,
        invoices,
        categories,
        brands,
        subCategories,
        customers,
        loading: false,
        error: null
      });

      setToastMessage('Reports data loaded successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      setReportData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      setToastMessage('Failed to load reports data');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Export data to CSV
  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  if (reportData.loading) {
    return (
      <div className="reports-container flex items-center justify-center h-screen">
        <div className="loading-animation rounded-full h-16 w-16 border-4 border-white border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (reportData.error) {
    return (
      <div className="reports-container flex items-center justify-center h-screen">
        <div className="error-message">
          <AlertTriangle className="mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
          <p>{reportData.error}</p>
          <button 
            onClick={fetchReportData}
            className="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const salesData = getSalesData();
  const categoryStats = getCategoryStats();
  const brandStats = getBrandStats();

  return (
    <div className="reports-container min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="page-header bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg border-0 p-4 md:p-6">
          <div className="page-title flex items-center gap-4">
            <div className="page-icon bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-blue-100 mt-1">Comprehensive overview of your inventory and sales data</p>
            </div>
          </div>
          
          <div className="reports-controls mt-4 md:mt-6">
            <div className="date-range-picker">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-selector bg-white bg-opacity-90 backdrop-blur-sm border-0 text-gray-800"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            
            <div className="header-actions">
              <button
                onClick={() => exportToCSV(reportData.invoices, 'invoices-report')}
                className="export-button flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid gap-4 md:gap-6">
          <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
            <div className="stat-card-content">
              <div className="stat-card-header">
                <div className="stat-card-icon bg-white bg-opacity-20 backdrop-blur-sm">
                  <Package size={20} className="text-white" />
                </div>
                <div className="stat-trend stat-trend-positive bg-white bg-opacity-20 backdrop-blur-sm">
                  <TrendingUp size={12} className="text-white" />
                  <span className="text-white">+12%</span>
                </div>
              </div>
              <div className="stat-value text-white">{totalProducts.toLocaleString()}</div>
              <div className="stat-title text-blue-100">Total Products</div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg">
            <div className="stat-card-content">
              <div className="stat-card-header">
                <div className="stat-card-icon bg-white bg-opacity-20 backdrop-blur-sm">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="stat-trend stat-trend-positive bg-white bg-opacity-20 backdrop-blur-sm">
                  <TrendingUp size={12} className="text-white" />
                  <span className="text-white">+8%</span>
                </div>
              </div>
              <div className="stat-value text-white">₹{totalRevenue.toLocaleString()}</div>
              <div className="stat-title text-green-100">Total Revenue</div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg">
            <div className="stat-card-content">
              <div className="stat-card-header">
                <div className="stat-card-icon bg-white bg-opacity-20 backdrop-blur-sm">
                  <FileText size={20} className="text-white" />
                </div>
                <div className="stat-trend stat-trend-positive bg-white bg-opacity-20 backdrop-blur-sm">
                  <TrendingUp size={12} className="text-white" />
                  <span className="text-white">+15%</span>
                </div>
              </div>
              <div className="stat-value text-white">{totalInvoices.toLocaleString()}</div>
              <div className="stat-title text-purple-100">Total Invoices</div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg">
            <div className="stat-card-content">
              <div className="stat-card-header">
                <div className="stat-card-icon bg-white bg-opacity-20 backdrop-blur-sm">
                  <ShoppingCart size={20} className="text-white" />
                </div>
                <div className="stat-trend stat-trend-positive bg-white bg-opacity-20 backdrop-blur-sm">
                  <TrendingUp size={12} className="text-white" />
                  <span className="text-white">+5%</span>
                </div>
              </div>
              <div className="stat-value text-white">₹{totalInventoryValue.toLocaleString()}</div>
              <div className="stat-title text-orange-100">Inventory Value</div>
            </div>
          </div>
        </div>

        <div className="reports-charts gap-6">
          <div className="chart-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <div className="chart-header bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h3 className="text-lg font-semibold text-white">Sales Trend</h3>
              <div className="chart-controls">
                <TrendingUp size={20} className="text-blue-200" />
              </div>
            </div>
            <div className="chart-container p-4 md:p-6">
              <div className="space-y-3">
                {salesData.map((data, index) => (
                  <div key={index} className="category-item p-3 md:p-4 bg-white bg-opacity-70 backdrop-blur-sm border-blue-300 shadow-sm hover:bg-white hover:bg-opacity-90 transition-all duration-200">
                    <div className="category-info">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="category-name text-blue-900 font-semibold">{data.date}</span>
                      </div>
                      <div className="category-products text-blue-600 font-medium">{data.sales} sales</div>
                    </div>
                    <div className="category-sales text-blue-900 font-bold text-lg">
                      ₹{Number(data.revenue || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <div className="chart-header bg-gradient-to-r from-green-600 to-green-700 text-white">
              <h3 className="text-lg font-semibold text-white">Category Performance</h3>
              <div className="chart-controls">
                <Folder size={20} className="text-green-200" />
              </div>
            </div>
            <div className="chart-container p-4 md:p-6">
              <div className="space-y-3">
                {categoryStats.map((category, index) => (
                  <div key={index} className="category-item p-3 md:p-4 bg-white bg-opacity-70 backdrop-blur-sm border-green-300 shadow-sm hover:bg-white hover:bg-opacity-90 transition-all duration-200">
                    <div className="category-info">
                      <div className="category-name text-green-900 font-semibold">{category.name}</div>
                      <div className="category-products text-green-600 font-medium">{category.productCount} products</div>
                    </div>
                    <div className="category-sales text-green-900 font-bold text-lg">
                      ₹{category.totalValue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
          <div className="chart-header bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <h3 className="text-lg font-semibold text-white">Brand Performance</h3>
            <div className="chart-controls">
              <Tag size={20} className="text-purple-200" />
            </div>
          </div>
          <div className="chart-container p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandStats.map((brand, index) => (
                <div key={index} className="insight-item p-3 md:p-4 bg-white bg-opacity-70 backdrop-blur-sm border-purple-300 shadow-sm hover:bg-white hover:bg-opacity-90 transition-all duration-200">
                  <div className="insight-icon bg-gradient-to-br from-purple-500 to-purple-600 border-0">
                    <Tag size={16} className="text-white" />
                  </div>
                  <div className="insight-content">
                    <div className="insight-title text-purple-800 font-semibold">{brand.name}</div>
                    <div className="insight-value text-purple-900 font-bold text-lg">
                      ₹{brand.totalValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-600 font-medium">{brand.productCount} products</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="chart-card bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
            <div className="chart-header bg-gradient-to-r from-red-600 to-red-700 text-white">
              <h3 className="text-lg font-semibold text-white">Stock Alerts</h3>
              <div className="chart-controls">
                <AlertTriangle size={20} className="text-red-200" />
              </div>
            </div>
            <div className="chart-container p-4 md:p-6">
              <div className="space-y-3">
                <div className="alert-card alert-critical p-4 bg-white bg-opacity-70 backdrop-blur-sm border-red-300 shadow-sm">
                  <div className="alert-icon bg-gradient-to-br from-red-500 to-red-600 border-0">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div className="alert-content">
                    <div className="alert-count text-red-900 font-bold text-2xl">{outOfStockProducts}</div>
                    <div className="alert-label text-red-700 font-semibold">Out of Stock</div>
                  </div>
                </div>
                <div className="alert-card alert-very-low p-4 bg-white bg-opacity-70 backdrop-blur-sm border-orange-300 shadow-sm">
                  <div className="alert-icon bg-gradient-to-br from-orange-500 to-orange-600 border-0">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div className="alert-content">
                    <div className="alert-count text-orange-900 font-bold text-2xl">{lowStockProducts}</div>
                    <div className="alert-label text-orange-700 font-semibold">Low Stock (≤10)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
            <div className="chart-header bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <h3 className="text-lg font-semibold text-white">Customer Summary</h3>
              <div className="chart-controls">
                <Users size={20} className="text-indigo-200" />
              </div>
            </div>
            <div className="chart-container p-4 md:p-6">
              <div className="space-y-3">
                <div className="insight-item p-4 bg-white bg-opacity-70 backdrop-blur-sm border-indigo-300 shadow-sm">
                  <div className="insight-icon bg-gradient-to-br from-indigo-500 to-indigo-600 border-0">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="insight-content">
                    <div className="insight-title text-indigo-800 font-semibold">Total Customers</div>
                    <div className="insight-value text-indigo-900 font-bold text-xl">{totalCustomers}</div>
                  </div>
                </div>
                <div className="insight-item p-4 bg-white bg-opacity-70 backdrop-blur-sm border-indigo-300 shadow-sm">
                  <div className="insight-icon bg-gradient-to-br from-indigo-500 to-indigo-600 border-0">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div className="insight-content">
                    <div className="insight-title text-indigo-800 font-semibold">Active Orders</div>
                    <div className="insight-value text-indigo-900 font-bold text-xl">{totalInvoices}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card w-full bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg">
          <div className="chart-header bg-gradient-to-r from-gray-600 to-gray-700 text-white">
            <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
            <div className="chart-controls">
              <FileText size={20} className="text-gray-200" />
            </div>
          </div>
          <div className="chart-container p-4 md:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.invoices.slice(0, 10).map((invoice, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber || `INV-${index + 1}`}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.customerName || 'N/A'}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ₹{Number(invoice.total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge ${
                          (invoice.status || 'pending') === 'paid' ? 'status-paid' :
                          (invoice.status || 'pending') === 'pending' ? 'status-pending' :
                          'status-cancelled'
                        }`}>
                          {invoice.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          text={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Reports; 