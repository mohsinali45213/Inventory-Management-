import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Package, Edit, Trash2 } from 'lucide-react';
import productService from '../functions/product';
import BrandService from '../functions/brand';
import CategoryService from '../functions/category';
import { Product, Brand, Category } from '../types';
import Button from '../components/common/Button';

const LowStock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'stock' | 'name' | 'lastSold'>('stock');
  const [restockMode, setRestockMode] = useState(false); // true = add to current stock

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const products = await productService.getAllProducts();
      const categories = await CategoryService.getAllCategories();
      const brands = await BrandService.getAllBrand();

      setProducts(products);
      setCategories(categories);
      setBrands(brands);

      const lowStockItems = products.flatMap(product =>
        product.variants
          .filter(variant => variant.stock_qty <= 10)
          .map(variant => ({
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            categoryId: product.categoryId,
            categoryName: getCategoryName(product.categoryId),
            brandId: product.brandId,
            brandName: getBrandName(product.brandId),
            size: variant.size,
            color: variant.color,
            stock: variant.stock_qty,
            price: variant.price,
            barcode: variant.barcode,
            lastSold: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }))
      );

      setProducts(products);
      setCategories(categories);
      setBrands(brands);
    } catch (error) {
      // Error loading data
    }
  };

  const getCategoryName = (id: string) => {
    return (categories || []).find((c : any) => c.id === id)?.name || 'Unknown';
  };

  const getBrandName = (id: string) => {
    return (brands || []).find((b : any) => b.id === id)?.name || 'Unknown';
  };

  const lowStockItems = products.flatMap(product =>
    product.variants
      .filter(variant => variant.stock_qty > 0 && variant.stock_qty <= 10)
      .map(variant => ({
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        categoryName: getCategoryName(product.categoryId),
        brandId: product.brandId,
        brandName: getBrandName(product.brandId),
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock: variant.stock_qty,
        barcode: variant.barcode,
        lastSold: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }))
  );

  const filteredItems = lowStockItems.filter(item => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ;

    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    const matchesBrand = brandFilter === 'all' || item.brandId === brandFilter;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'stock':
        return a.stock - b.stock;
      case 'name':
        return a.productName.localeCompare(b.productName);
      case 'lastSold':
        return new Date(b.lastSold).getTime() - new Date(a.lastSold).getTime();
      default:
        return 0;
    }
  });

  const getStockLevel = (stock: number) => {
    if (stock <= 3) return { level: 'critical', class: 'stock-critical' };
    if (stock <= 5) return { level: 'very-low', class: 'stock-very-low' };
    return { level: 'low', class: 'stock-low' };
  };

  const criticalCount = lowStockItems.filter(item => item.stock <= 3).length;
  const veryLowCount = lowStockItems.filter(item => item.stock <= 5 && item.stock > 3).length;
  const lowCount = lowStockItems.filter(item => item.stock <= 10 && item.stock > 5).length;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <AlertTriangle className="page-icon" />
          <div>
            <h1>Low Stock Alert</h1>
            <p>Monitor products with low inventory levels</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="stock-alert-summary">
          <div className="alert-card alert-critical">
            <div className="alert-icon"><AlertTriangle size={24} /></div>
            <div className="alert-content">
              <div className="alert-count">{criticalCount}</div>
              <div className="alert-label">Critical (≤3)</div>
            </div>
          </div>
          <div className="alert-card alert-very-low">
            <div className="alert-icon"><AlertTriangle size={24} /></div>
            <div className="alert-content">
              <div className="alert-count">{veryLowCount}</div>
              <div className="alert-label">Very Low (4-5)</div>
            </div>
          </div>
          <div className="alert-card alert-low">
            <div className="alert-icon"><Package size={24} /></div>
            <div className="alert-content">
              <div className="alert-count">{lowCount}</div>
              <div className="alert-label">Low (6-10)</div>
            </div>
          </div>
          <div className="alert-card alert-total">
            <div className="alert-icon"><Package size={24} /></div>
            <div className="alert-content">
              <div className="alert-count">{lowStockItems.length}</div>
              <div className="alert-label">Total Items</div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-filter">
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search products, categories, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select className="form-select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
                  <option value="all">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sort By</label>
                <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'stock' | 'name' | 'lastSold')}>
                  <option value="stock">Stock Level</option>
                  <option value="name">Product Name</option>
                  <option value="lastSold">Last Sold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Variant</th>
                <th>Current Stock</th>
                <th>Alert Level</th>
                <th>Price</th>
                <th>Last Sold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => {
                const stockLevel = getStockLevel(item.stock);
                return (
                  <tr key={`${item.productId}-${item.variantId}`} className="low-stock-row">
                    <td>
                      <div className="product-cell">
                        <div className="product-image-placeholder"><Package size={20} /></div>
                        <div className="product-info">
                          <div className="product-name">{item.productName}</div>
                          <div className="product-barcode">Barcode: {item.barcode}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-badge">{item.categoryName}</span></td>
                    <td><span className="brand-badge">{item.brandName}</span></td>
                    <td>
                      <div className="variant-info">
                        <span className="variant-size">{item.size}</span>
                        <span className="variant-color">{item.color}</span>
                      </div>
                    </td>
                    <td><span className={`stock-quantity ${stockLevel.class}`}>{item.stock}</span></td>
                    <td><span className={`alert-level ${stockLevel.class}`}><AlertTriangle size={16} /> {stockLevel.level}</span></td>
                    <td><span className="price">₹{item.price.toLocaleString()}</span></td>
                    <td><span className="last-sold">{item.lastSold.toLocaleDateString()}</span></td>
                    <td>
                      <div className="action-buttons">
                        <Button size="sm" variant="primary">Restock</Button>
                        <button className="action-btn action-btn-edit"><Edit size={16} /></button>
                        <button className="action-btn action-btn-delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {sortedItems.length === 0 && (
            <div className="empty-state">
              <Package size={48} />
              <h3>No Low Stock Items</h3>
              <p>All products have sufficient stock levels.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LowStock;





