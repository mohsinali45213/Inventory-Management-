// import React, { useState } from 'react';
// import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from 'lucide-react';
// import { useInventory } from '../context/InventoryContext';
// import Modal from '../components/common/Modal';
// import Button from '../components/common/Button';
// import Input from '../components/common/Input';

// const Products: React.FC = () => {
//   const { state } = useInventory();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

//   // 🟩 State for New Product Form
//   const [productName, setProductName] = useState('');
//   const [subcategory, setSubcategory] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedBrand, setSelectedBrand] = useState('');
//   const [variants, setVariants] = useState([
//     { size: '', color: '', price: '', stock: '' }
//   ]);

//   const filteredProducts = state.products.filter(product =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     state.categories.find(c => c.id === product.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     state.brands.find(b => b.id === product.brandId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const toggleProductExpansion = (productId: string) => {
//     const newExpanded = new Set(expandedProducts);
//     newExpanded.has(productId) ? newExpanded.delete(productId) : newExpanded.add(productId);
//     setExpandedProducts(newExpanded);
//   };

//   const getCategoryName = (categoryId: string) => {
//     return state.categories.find(c => c.id === categoryId)?.name || 'Unknown';
//   };

//   const getBrandName = (brandId: string) => {
//     return state.brands.find(b => b.id === brandId)?.name || 'Unknown';
//   };

//   const getTotalStock = (variants: any[]) => {
//     return variants.reduce((sum, variant) => sum + variant.stock, 0);
//   };

//   const getLowestPrice = (variants: any[]) => {
//     return Math.min(...variants.map(v => v.price));
//   };

//   const handleAddVariant = () => {
//     setVariants([...variants, { size: '', color: '', price: '', stock: '' }]);
//   };

//   const handleVariantChange = (index: number, field: string, value: string | number) => {
//     const updated = [...variants];
//     updated[index][field] = value;
//     setVariants(updated);
//   };

//   const handleRemoveVariant = (index: number) => {
//     const updated = variants.filter((_, i) => i !== index);
//     setVariants(updated);
//   };

//   return (
//     <div className="page">
//       <div className="page-header">
//         <div className="page-title">
//           <Package className="page-icon" />
//           <div>
//             <h1>Products</h1>
//             <p>Manage your product inventory</p>
//           </div>
//         </div>
//         <Button onClick={() => setIsAddModalOpen(true)}>
//           <Plus size={16} />
//           Add Product
//         </Button>
//       </div>

//       <div className="page-content">
//         <div className="filters-section">
//           <div className="search-filter">
//             <div className="search-input-container">
//               <Search className="search-input-icon" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search products, categories, brands..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="search-input"
//               />
//             </div>
//             <Button variant="outline">
//               <Filter size={16} />
//               Filters
//             </Button>
//           </div>
//         </div>

//         <div className="table-container">
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Product Details</th>
//                 <th>Category</th>
//                 <th>Brand</th>
//                 <th>Total Stock</th>
//                 <th>Price Range</th>
//                 <th>Variants</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredProducts.map((product) => (
//                 <React.Fragment key={product.id}>
//                   <tr className="product-row">
//                     <td>
//                       <div className="product-cell">
//                         <div className="product-image-placeholder">
//                           <Package size={24} />
//                         </div>
//                         <div className="product-info">
//                           <div className="product-name">{product.name}</div>
//                           {product.subcategory && (
//                             <div className="product-subcategory">{product.subcategory}</div>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td><span className="category-badge">{getCategoryName(product.categoryId)}</span></td>
//                     <td><span className="brand-badge">{getBrandName(product.brandId)}</span></td>
//                     <td>
//                       <span className={`stock-indicator ${getTotalStock(product.variants) <= 10 ? 'stock-low' : 'stock-normal'}`}>
//                         {getTotalStock(product.variants)}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="price-range">
//                         ₹{getLowestPrice(product.variants).toLocaleString()}
//                         {product.variants.length > 1 && ' - ₹' + Math.max(...product.variants.map(v => v.price)).toLocaleString()}
//                       </span>
//                     </td>
//                     <td>
//                       <button className="variant-toggle" onClick={() => toggleProductExpansion(product.id)}>
//                         <Eye size={16} />
//                         {product.variants.length} variants
//                       </button>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button className="action-btn action-btn-edit"><Edit size={16} /></button>
//                         <button className="action-btn action-btn-delete"><Trash2 size={16} /></button>
//                       </div>
//                     </td>
//                   </tr>

//                   {expandedProducts.has(product.id) && (
//                     <tr className="variants-row">
//                       <td colSpan={7}>
//                         <div className="variants-container">
//                           <h4>Product Variants</h4>
//                           <div className="variants-grid">
//                             {product.variants.map((variant) => (
//                               <div key={variant.id} className="variant-card">
//                                 <div className="variant-info">
//                                   <div className="variant-details">
//                                     <span className="variant-size">{variant.size}</span>
//                                     <span className="variant-color">{variant.color}</span>
//                                   </div>
//                                   <div className="variant-price">₹{variant.price.toLocaleString()}</div>
//                                   <div className={`variant-stock ${variant.stock <= 5 ? 'stock-critical' : variant.stock <= 10 ? 'stock-low' : 'stock-normal'}`}>
//                                     Stock: {variant.stock}
//                                   </div>
//                                   <div className="variant-barcode">{variant.barcode}</div>
//                                 </div>
//                                 <div className="variant-actions">
//                                   <button className="variant-action-btn"><Edit size={14} /></button>
//                                   <button className="variant-action-btn variant-action-delete"><Trash2 size={14} /></button>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* 🟨 Add Product Modal */}
//       <Modal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//         title="Add New Product"
//         size="lg"
//       >
//         <form className="product-form">
//           <div className="form-row">
//             <Input
//               label="Product Name"
//               placeholder="Enter product name"
//               required
//               value={productName}
//               onChange={(e) => setProductName(e.target.value)}
//             />
//             <Input
//               label="Subcategory"
//               placeholder="Enter subcategory (optional)"
//               value={subcategory}
//               onChange={(e) => setSubcategory(e.target.value)}
//             />
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label className="form-label">Category *</label>
//               <select
//                 className="form-select"
//                 required
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//               >
//                 <option value="">Select Category</option>
//                 {state.categories.map(category => (
//                   <option key={category.id} value={category.id}>{category.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Brand *</label>
//               <select
//                 className="form-select"
//                 required
//                 value={selectedBrand}
//                 onChange={(e) => setSelectedBrand(e.target.value)}
//               >
//                 <option value="">Select Brand</option>
//                 {state.brands.map(brand => (
//                   <option key={brand.id} value={brand.id}>{brand.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* 🟥 Variant Inputs */}
//           <div className="variants-section">
//             <h4>Product Variants</h4>
//             {variants.map((variant, index) => (
//               <div key={index} className="variant-form border p-3 rounded-md shadow mb-4">
//                 <div className="form-row">
//                   <Input
//                     label="Size"
//                     placeholder="e.g., M, L, XL"
//                     value={variant.size}
//                     onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
//                   />
//                   <Input
//                     label="Color"
//                     placeholder="e.g., Black, White"
//                     value={variant.color}
//                     onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
//                   />
//                   <Input
//                     label="Price"
//                     type="number"
//                     placeholder="0"
//                     value={variant.price}
//                     onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
//                   />
//                   <Input
//                     label="Stock"
//                     type="number"
//                     placeholder="0"
//                     value={variant.stock}
//                     onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
//                   />
//                 </div>
//                 {variants.length > 1 && (
//                   <div className="text-right mt-2">
//                     <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveVariant(index)}>
//                       Remove Variant
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             ))}

//             <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
//               Add Variant
//             </Button>
//           </div>

//           <div className="form-actions">
//             <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
//               Cancel
//             </Button>
//             <Button type="submit">Add Product</Button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// };

// export default Products;

import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import productService from "../functions/product";
import { Brand, Category } from "../types/index";
import CategoryService from "../functions/category";
import BrandService from "../functions/brand";

const Products: React.FC = () => {
  const { state } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [categories, setAllCategories] = useState<Category[] | any[]>([]);
  const [allBrand, setAllBrand] = useState<Brand[] | any[]>([]);
  const [productName, setProductName] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  type Variants = {
    size: string;
    color: string;
    price: number;
    stock: number;
  };
  const [variants, setVariants] = useState<Variants[]>([
    { size: "", color: "", price: 0, stock: 0 },
  ]);

  const [products, setProducts] = useState<any[]>([]);

  const fetchAllProducts = async () => {
    try {
      const result = await productService.getAllProducts();
      setProducts(result);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories: any = await CategoryService.getAllCategories();
      console.log(categories.data);

      setAllCategories(categories.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

   const getAllBrands = async () => {
    try {
      const brands: any = await BrandService.getAllBrand();
      setAllBrand(brands.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
    getAllBrands();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.categories
        .find((c) => c.id === product.categoryId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      state.brands
        .find((b) => b.id === product.brandId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    newExpanded.has(productId)
      ? newExpanded.delete(productId)
      : newExpanded.add(productId);
    setExpandedProducts(newExpanded);
  };

  // const getCategoryName = (categoryId: string) => {
  //   return state.categories.find((c) => c.id === categoryId)?.name || "Unknown";
  // };

  const getBrandName = (brandId: string) => {
    return state.brands.find((b) => b.id === brandId)?.name || "Unknown";
  };

  const getTotalStock = (variants: any[]) => {
    return variants.reduce((sum, variant) => sum + variant.stock_qty, 0);
  };

  const getLowestPrice = (variants: any[]) => {
    return Math.min(...variants.map((v) => v.price));
  };

  const handleAddVariant = () => {
    setVariants([...variants, { size: "", color: "", price: 0, stock: 0 }]);
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variants,
    value: string | number
  ) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const result = await productService.deleteProductWithVariants(productId);
      if (result.success) {
        alert("Product deleted");
        fetchAllProducts();
      } else {
        alert(result.message);
      }
    }
  };

  const handleDeleteVariant = async (productId: string, variantId: string) => {
    if (confirm("Delete this variant?")) {
      const result = await productService.deleteProductVariant(
        productId,
        variantId
      );
      if (result.success) {
        alert("Variant deleted");
        fetchAllProducts();
      } else {
        alert(result.message);
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: productName,
      subcategory,
      brandId: selectedBrand,
      categoryId: selectedCategory,
      // status: 'active',
      variants: variants.map((v) => ({
        size: v.size,
        color: v.color,
        price: Number(v.price),
        stock_qty: Number(v.stock),
      })),
    };
    const result = await productService.createProductWithVariants(payload);
    if (result.success) {
      alert("Product added successfully");
      setIsAddModalOpen(false);
      fetchAllProducts();
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Package className="page-icon" />
          <div>
            <h1>Products</h1>
            <p>Manage your product inventory</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      <div className="page-content">
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
            <Button variant="outline">
              <Filter size={16} />
              Filters
            </Button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Total Stock</th>
                <th>Price Range</th>
                <th>Variants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className="product-row">
                    <td>
                      <div className="product-cell">
                        <div className="product-image-placeholder">
                          <Package size={24} />
                        </div>
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          {product.subcategory && (
                            <div className="product-subcategory">
                              {product.subcategory}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {categories.find(
                          (category) => category.id === product.categoryId
                        )?.name || "Unknown"}
                      </span>
                    </td>
                    <td>
                       <span className="category-badge">
                        {allBrand.find(
                          (brand) => brand.id === product.brandId
                        )?.name || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`stock-indicator ${
                          getTotalStock(product.variants) <= 10
                            ? "stock-low"
                            : "stock-normal"
                        }`}
                      >
                        {getTotalStock(product.variants)}
                      </span>
                    </td>
                    <td>
                      <span className="price-range">
                        ₹{getLowestPrice(product.variants).toLocaleString()}
                        {product.variants.length > 1 &&
                          " - ₹" +
                            Math.max(
                              ...product.variants.map((v: any) => v.price)
                            ).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <button
                        className="variant-toggle"
                        onClick={() => toggleProductExpansion(product.id)}
                      >
                        <Eye size={16} />
                        {product.variants.length} variants
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn action-btn-edit">
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedProducts.has(product.id) && (
                    <tr className="variants-row">
                      <td colSpan={7}>
                        <div className="variants-container">
                          <h4>Product Variants</h4>
                          <div className="variants-grid">
                            {product.variants.map((variant: any) => (
                              <div key={variant.id} className="variant-card">
                                <div className="variant-info">
                                  <div className="variant-details">
                                    <span className="variant-size">
                                      {variant.size}
                                    </span>
                                    <span className="variant-color">
                                      {variant.color}
                                    </span>
                                  </div>
                                  <div className="variant-price">
                                    ₹{variant.price.toLocaleString()}
                                  </div>
                                  <div
                                    className={`variant-stock ${
                                      variant.stock_qty <= 5
                                        ? "stock-critical"
                                        : variant.stock_qty <= 10
                                        ? "stock-low"
                                        : "stock-normal"
                                    }`}
                                  >
                                    Stock: {variant.stock_qty}
                                  </div>
                                  <div className="variant-barcode">
                                    {variant.barcode}
                                  </div>
                                </div>
                                <div className="variant-actions">
                                  <button className="variant-action-btn">
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="variant-action-btn variant-action-delete"
                                    onClick={() =>
                                      handleDeleteVariant(
                                        product.id,
                                        variant.id
                                      )
                                    }
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
        size="lg"
      >
        <form className="product-form" onSubmit={handleAddProduct}>
          <div className="form-row">
            <Input
              label="Product Name"
              placeholder="Enter product name"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <Input
              label="Subcategory"
              placeholder="Enter subcategory (optional)"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              {/* <select
                className="form-select"
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {state.categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select> */}
              <select
                className="form-select"
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand *</label>
              <select
                className="form-select"
                required
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">Select Brand</option>
                {allBrand.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="variants-section">
            <h4>Product Variants</h4>
            {variants.map((variant, index) => (
              <div
                key={index}
                className="variant-form border p-3 rounded-md shadow mb-4"
              >
                <div className="form-row">
                  <Input
                    label="Size"
                    placeholder="e.g., M, L, XL"
                    value={variant.size}
                    onChange={(e) =>
                      handleVariantChange(index, "size", e.target.value)
                    }
                  />
                  <Input
                    label="Color"
                    placeholder="e.g., Black, White"
                    value={variant.color}
                    onChange={(e) =>
                      handleVariantChange(index, "color", e.target.value)
                    }
                  />
                  <Input
                    label="Price"
                    type="number"
                    placeholder="0"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "price",
                        Number(e.target.value)
                      )
                    }
                  />
                  <Input
                    label="Stock"
                    type="number"
                    placeholder="0"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "stock",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                {variants.length > 1 && (
                  <div className="text-right mt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      Remove Variant
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
            >
              Add Variant
            </Button>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
