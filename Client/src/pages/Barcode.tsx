import React, { useEffect, useState } from 'react';
import { Search, Filter, Printer, Package } from 'lucide-react';
import Button from '../components/common/Button';
import { generateBarcodeDataURL, printBarcode } from '../utils/barcode';

import BrandService from '../functions/brand';
import CategoryService from '../functions/category';
import SubCategoryService from '../functions/subCategory';
import ProductService from '../functions/product';

const Barcode: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [variants, setVariants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const variantRes = await ProductService.getAllVariants();
      setVariants(variantRes || []);
    } catch (error) {
      // Failed to fetch data
    }
  };

  const fetchInitialData = async () => {
    try {
      const variantRes = await ProductService.getAllVariants();
      setVariants(variantRes || []);
    } catch (error) {
      // Failed to fetch data
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredItems = variants.filter(item => {
    if (!item?.product) return false;
    
    const matchesSearch =
      (item.product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.product.category?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.product.subCategory?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.product.brand?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item?.size?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item?.color?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item?.barcode || '').includes(searchTerm);

    const matchesCategory = categoryFilter === 'all' || item.product.category?.name === categoryFilter;
    const matchesBrand = brandFilter === 'all' || item.product.brand?.name === brandFilter;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleSelectItem = (itemKey: string) => {
    const newSelected = new Set(selectedItems);
    newSelected.has(itemKey) ? newSelected.delete(itemKey) : newSelected.add(itemKey);
    setSelectedItems(newSelected);
  };

  const allSelected = filteredItems.length > 0 && 
    filteredItems.every(item => selectedItems.has(`${item.productId}-${item.id}`));

  useEffect(() => {
    const currentItemKeys = new Set(filteredItems.map(item => `${item.productId}-${item.id}`));
    const cleanedSelectedItems = new Set(
      Array.from(selectedItems).filter(key => currentItemKeys.has(key))
    );
    
    if (cleanedSelectedItems.size !== selectedItems.size) {
      setSelectedItems(cleanedSelectedItems);
    }
  }, [filteredItems, selectedItems]);

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      const allItemKeys = filteredItems.map(item => `${item.productId}-${item.id}`);
      setSelectedItems(new Set(allItemKeys));
    }
  };

  const handlePrintSelected = () => {
    const selectedItemsData = filteredItems.filter(item =>
      selectedItems.has(`${item.productId}-${item.id}`)
    );

    if (selectedItemsData.length === 0) {
      alert('Please select items to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelsHtml = selectedItemsData.map(item => {
      const barcodeDataURL = generateBarcodeDataURL(item.barcode || '');
      return `
        <div class="label">
          <div class="shop-name">CLOTHING STORE</div>
          <div class="product-name">${item.product?.name || 'Unknown Product'}</div>
          <div class="product-variant">${item.size || 'N/A'} • ${item.color || 'N/A'}</div>
          <div class="price">₹${(item.price || 0).toLocaleString()}</div>
          <img src="${barcodeDataURL}" alt="Barcode" class="barcode-img" />
        </div>
      `;
    }).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode Labels</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .labels-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            max-width: 800px;
          }
          .label {
            border: 2px solid #000;
            padding: 15px;
            text-align: center;
            width: 220px;
            background: white;
            page-break-inside: avoid;
          }
          .shop-name {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
          }
          .product-name {
            font-size: 11px;
            margin-bottom: 4px;
            font-weight: 600;
          }
          .product-variant {
            font-size: 9px;
            margin-bottom: 8px;
            color: #666;
          }
          .price {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .barcode-img {
            margin: 8px 0;
            max-width: 100%;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .labels-container { gap: 10px; }
            .label { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="labels-container">
          ${labelsHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Printer className="page-icon" />
          <div>
            <h1>Print Barcode</h1>
            <p>Generate and print barcode labels</p>
          </div>
        </div>
        <div className="header-actions">
          <Button onClick={handlePrintSelected} disabled={selectedItems.size === 0}>
            <Printer size={16} />
            Print Selected ({selectedItems.size})
          </Button>
        </div>
      </div>

      <div className="page-content">
        <div className="filters-section">
          <div className="search-filter">
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search products, categories, brands, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {Array.isArray(categories) &&
                    categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select 
                  className="form-select"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                >
                  <option value="all">All Brands</option>
                  {Array.isArray(brands) &&
                    brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="barcode-actions">
          <Button variant="outline" onClick={handleToggleSelectAll} disabled={filteredItems.length === 0}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
          <span className="selection-count">
            {selectedItems.size} of {filteredItems.length} items selected
          </span>
        </div>

        <div className="barcode-grid">
          {filteredItems.map(item => {
            const itemKey = `${item.productId}-${item.id}`;
            const isSelected = selectedItems.has(itemKey);
            const barcodeDataURL = generateBarcodeDataURL(item.barcode);

            // Add null check for item.product
            if (!item.product) {
              return null; // Skip rendering this item if product is null
            }

            return (
              <div key={itemKey} className={`barcode-card ${isSelected ? 'selected' : ''}`}>
                <div className="barcode-card-header">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(itemKey)}
                    className="barcode-checkbox"
                  />
                  <div className="product-info">
                    <div className="product-name">{item.product.name || 'Unknown Product'}</div>
                    <div className="product-variant">{item.size || 'N/A'} • {item.color || 'N/A'}</div>
                    <div className="product-details">
                      
                      <span className="category-badge">{item.product.category?.name || 'Unknown Category'}</span>
                      <span className="brand-badge">{item.product.subCategory?.name || 'Unknown SubCategory'}</span>
                      <span className="brand-badge">{item.product.brand?.name || 'Unknown Brand'}</span>
                    </div>
                  </div>
                </div>
                <div className="barcode-preview">
                  <div className="label-preview">
                    <div className="label-shop-name">CLOTHING STORE</div>
                    <div className="label-product-name">{item.product.name || 'Unknown Product'}</div>
                    <div className="label-variant">{item.size || 'N/A'} • {item.color || 'N/A'}</div>
                    <div className="label-price">₹{(item.price || 0).toLocaleString()}</div>
                    <img src={barcodeDataURL} alt="Barcode" className="label-barcode" />
                  </div>
                </div>
                <div className="barcode-card-footer">
                  <div className="barcode-info">
                    <div className="barcode-number">Barcode: {item.barcode || 'N/A'}</div>
                    <div className="stock-info">Stock: {item.stock_qty || 0}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      printBarcode(
                        item.barcode || '',
                        `${item.product.name || 'Unknown Product'} (${item.size || 'N/A'} • ${item.color || 'N/A'})`,
                        item.price || 0
                      )
                    }
                  >
                    <Printer size={14} />
                    Print
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>No Products Found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Barcode;
