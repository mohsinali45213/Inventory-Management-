import React, { useState } from 'react';
import { Search, Filter, Edit, BarChart3, AlertTriangle, Package } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';

const StockManagement: React.FC = () => {
  const { state, dispatch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [newStock, setNewStock] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Flatten products with variants for stock management
  const stockItems = state.products.flatMap(product => 
    product.variants.map(variant => ({
      productId: product.id,
      productName: product.name,
      categoryName: state.categories.find(c => c.id === product.categoryId)?.name || 'Unknown',
      brandName: state.brands.find(b => b.id === product.brandId)?.name || 'Unknown',
      variantId: variant.id,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock: variant.stock,
      barcode: variant.barcode,
      sku: variant.sku
    }))
  );

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm);

    const matchesFilter = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.stock > 0 && item.stock <= 10) ||
      (stockFilter === 'out' && item.stock === 0);

    return matchesSearch && matchesFilter;
  });

  const handleUpdateStock = (item: any) => {
    setSelectedVariant(item);
    setNewStock(item.stock.toString());
    setIsUpdateModalOpen(true);
  };

  const handleSubmitStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVariant) return;

    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      setAlert({ type: 'error', message: 'Please enter a valid stock quantity' });
      return;
    }

    // Find and update the product
    const product = state.products.find(p => p.id === selectedVariant.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        variants: product.variants.map(v => 
          v.id === selectedVariant.variantId 
            ? { ...v, stock: stockValue }
            : v
        )
      };
      
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      setAlert({ type: 'success', message: 'Stock updated successfully' });
      setIsUpdateModalOpen(false);
      setSelectedVariant(null);
      setNewStock('');
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'Out of Stock', class: 'stock-out' };
    if (stock <= 5) return { status: 'Critical', class: 'stock-critical' };
    if (stock <= 10) return { status: 'Low Stock', class: 'stock-low' };
    return { status: 'In Stock', class: 'stock-normal' };
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <BarChart3 className="page-icon" />
          <div>
            <h1>Stock Management</h1>
            <p>Monitor and update inventory levels</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="filters-section">
          <div className="search-filter">
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search by product, category, brand, size, color, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <Button
                variant={stockFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStockFilter('all')}
              >
                All Items
              </Button>
              <Button
                variant={stockFilter === 'low' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStockFilter('low')}
              >
                <AlertTriangle size={16} />
                Low Stock
              </Button>
              <Button
                variant={stockFilter === 'out' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStockFilter('out')}
              >
                Out of Stock
              </Button>
            </div>
          </div>
        </div>

        <div className="stock-summary">
          <div className="summary-card">
            <div className="summary-icon summary-icon-blue">
              <Package size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">{stockItems.length}</div>
              <div className="summary-label">Total Items</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon summary-icon-orange">
              <AlertTriangle size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">
                {stockItems.filter(item => item.stock > 0 && item.stock <= 10).length}
              </div>
              <div className="summary-label">Low Stock</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon summary-icon-red">
              <AlertTriangle size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-value">
                {stockItems.filter(item => item.stock === 0).length}
              </div>
              <div className="summary-label">Out of Stock</div>
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
                <th>Status</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const stockStatus = getStockStatus(item.stock);
                return (
                  <tr key={`${item.productId}-${item.variantId}`}>
                    <td>
                      <div className="product-cell">
                        <div className="product-image-placeholder">
                          <Package size={20} />
                        </div>
                        <div className="product-info">
                          <div className="product-name">{item.productName}</div>
                          <div className="product-sku">SKU: {item.sku}</div>
                          <div className="product-barcode">Barcode: {item.barcode}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{item.categoryName}</span>
                    </td>
                    <td>
                      <span className="brand-badge">{item.brandName}</span>
                    </td>
                    <td>
                      <div className="variant-info">
                        <span className="variant-size">{item.size}</span>
                        <span className="variant-color">{item.color}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`stock-quantity ${stockStatus.class}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`stock-status ${stockStatus.class}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td>
                      <span className="price">₹{item.price.toLocaleString()}</span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStock(item)}
                      >
                        <Edit size={14} />
                        Update Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Stock Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedVariant(null);
          setNewStock('');
        }}
        title="Update Stock"
      >
        {selectedVariant && (
          <form onSubmit={handleSubmitStockUpdate} className="stock-update-form">
            <div className="product-details">
              <h4>{selectedVariant.productName}</h4>
              <p>Size: {selectedVariant.size} • Color: {selectedVariant.color}</p>
              <p>Current Stock: <strong>{selectedVariant.stock}</strong></p>
              <p>Price: ₹{selectedVariant.price.toLocaleString()}</p>
            </div>
            
            <Input
              label="New Stock Quantity"
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Enter new stock quantity"
              min="0"
              required
            />
            
            <div className="form-actions">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setSelectedVariant(null);
                  setNewStock('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Stock</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StockManagement;