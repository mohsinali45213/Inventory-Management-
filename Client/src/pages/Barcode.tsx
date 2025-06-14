import React, { useState } from 'react';
import { Search, Filter, Printer, Package, Download } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/common/Button';
import { generateBarcodeDataURL, printBarcode } from '../utils/barcode';

const Barcode: React.FC = () => {
  const { state } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Flatten products with variants for barcode generation
  const barcodeItems = state.products.flatMap(product => 
    product.variants.map(variant => ({
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      categoryName: state.categories.find(c => c.id === product.categoryId)?.name || 'Unknown',
      brandId: product.brandId,
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

  const filteredItems = barcodeItems.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm) ||
      item.sku?.includes(searchTerm);

    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    const matchesBrand = brandFilter === 'all' || item.brandId === brandFilter;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleSelectItem = (itemKey: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
    } else {
      newSelected.add(itemKey);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => `${item.productId}-${item.variantId}`)));
    }
  };

  const handlePrintSelected = () => {
    const selectedItemsData = filteredItems.filter(item => 
      selectedItems.has(`${item.productId}-${item.variantId}`)
    );

    if (selectedItemsData.length === 0) {
      alert('Please select items to print');
      return;
    }

    // Create a print window with multiple labels
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelsHtml = selectedItemsData.map(item => {
      const barcodeDataURL = generateBarcodeDataURL(item.barcode);
      return `
        <div class="label">
          <div class="shop-name">CLOTHING STORE</div>
          <div class="product-name">${item.productName}</div>
          <div class="product-variant">${item.size} • ${item.color}</div>
          <div class="price">₹${item.price.toLocaleString()}</div>
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
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
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
            word-wrap: break-word;
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
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintSingle = (item: any) => {
    printBarcode(item.barcode, `${item.productName} (${item.size} • ${item.color})`, item.price);
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
          <Button 
            onClick={handlePrintSelected}
            disabled={selectedItems.size === 0}
          >
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
                placeholder="Search products, categories, brands, SKU, or barcode..."
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
                  {state.categories.map(category => (
                    <option key={category.id} value={category.id}>
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
                  {state.brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="barcode-actions">
          <Button variant="outline" onClick={handleSelectAll}>
            {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
          </Button>
          <span className="selection-count">
            {selectedItems.size} of {filteredItems.length} items selected
          </span>
        </div>

        <div className="barcode-grid">
          {filteredItems.map((item) => {
            const itemKey = `${item.productId}-${item.variantId}`;
            const isSelected = selectedItems.has(itemKey);
            const barcodeDataURL = generateBarcodeDataURL(item.barcode);

            return (
              <div 
                key={itemKey} 
                className={`barcode-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="barcode-card-header">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(itemKey)}
                    className="barcode-checkbox"
                  />
                  <div className="product-info">
                    <div className="product-name">{item.productName}</div>
                    <div className="product-variant">{item.size} • {item.color}</div>
                    <div className="product-details">
                      <span className="category-badge">{item.categoryName}</span>
                      <span className="brand-badge">{item.brandName}</span>
                    </div>
                  </div>
                </div>

                <div className="barcode-preview">
                  <div className="label-preview">
                    <div className="label-shop-name">CLOTHING STORE</div>
                    <div className="label-product-name">{item.productName}</div>
                    <div className="label-variant">{item.size} • {item.color}</div>
                    <div className="label-price">₹{item.price.toLocaleString()}</div>
                    {barcodeDataURL && (
                      <img src={barcodeDataURL} alt="Barcode" className="label-barcode" />
                    )}
                  </div>
                </div>

                <div className="barcode-card-footer">
                  <div className="barcode-info">
                    <div className="barcode-number">{item.barcode}</div>
                    <div className="sku-number">SKU: {item.sku}</div>
                    <div className="stock-info">Stock: {item.stock}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintSingle(item)}
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