import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from "lucide-react";
// import { useInventory } from "../context/InventoryContext";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProductService from "../functions/product";
import { Brand, Category, Product, ProductVariant } from "../types/index";
import CategoryService from "../functions/category";
import BrandService from "../functions/brand";
import SubCategoryService from "../functions/subCategory";
import Alert from "../components/common/Alert";
import { useModal } from "../context/ModalContext";
// import deleteProductWithVariants  from "../functions/product"; // Adjust the import path as necessary

// interface ProductsProps {
//   triggerAddModal: boolean;
//   setTriggerAddModal: React.Dispatch<React.SetStateAction<boolean>>;
// }

const Products: React.FC = () => {
  // const { state } = useInventory();

  const { triggerAddModal, setTriggerAddModal } = useModal();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  const [isVariantEditMode, setIsVariantEditMode] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]); // ✅ correct
  const [categories, setAllCategories] = useState<Category[] | any[]>([]);
  const [subcategories, setSubcategories] = useState<Category[] | any[]>([]);
  const [allBrand, setAllBrand] = useState<Brand[] | any[]>([]);
  const [productName, setProductName] = useState("");
  // const [subcategory, setSubcategory] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // State for filter modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (triggerAddModal) {
      setIsAddModalOpen(true);
      if (setTriggerAddModal) setTriggerAddModal(false); // reset
    }
  }, [triggerAddModal]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer); // Clean up
    }
  }, [alert]);

  type Variants = {
    id?: string;
    size: string;
    color: string;
    price: any;
    stock_qty: any;
  };
  const [variants, setVariants] = useState<Variants[]>([
    { id: "", size: "", color: "", price: "", stock_qty: "" },
  ]);

  // const [products, setProducts] = useState<any[]>([]);

  const fetchAllProducts = async () => {
    try {
      const result = await ProductService.getAllProducts();
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

  const getAllSubCategories = async () => {
    try {
      const subCategories: any = await SubCategoryService.getAllSubCategories();
      setSubcategories(subCategories.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
    getAllBrands();
    getAllSubCategories();
  }, []);

  // Filter products based on search term and selected filters
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const productPrices = product.variants.map((v: any) => v.price);
        const lowest = Math.min(...productPrices);
        const highest = Math.max(...productPrices);

        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.subcategoryId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          categories
            .find((c) => c.id === product.categoryId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          allBrand
            .find((b) => b.id === product.brandId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory
          ? product.categoryId.toString() === selectedCategory
          : true;

        const matchesBrand = selectedBrand
          ? product.brandId.toString() === selectedBrand
          : true;

        const matchesMinPrice = minPrice
          ? lowest >= parseFloat(minPrice)
          : true;
        const matchesMaxPrice = maxPrice
          ? highest <= parseFloat(maxPrice)
          : true;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesBrand &&
          matchesMinPrice &&
          matchesMaxPrice
        );
      })
    : [];

  // Toggle product expansion
  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    newExpanded.has(productId)
      ? newExpanded.delete(productId)
      : newExpanded.add(productId);
    setExpandedProducts(newExpanded);
  };

  // These functions can be used in the table to display stock and price information
  // Helper functions to calculate total stock and lowest price
  // They are not used in the current code but can be useful for future enhancements
  const getTotalStock = (variants: any[]) => {
    return variants.reduce((sum, variant) => sum + variant.stock_qty, 0);
  };

  const getLowestPrice = (variants: any[]) => {
    return Math.min(...variants.map((v) => v.price));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: "", size: "", color: "", price: "", stock_qty: "" },
    ]);
  };

  const handleVariantChange = (
    index: number,
    key: keyof ProductVariant,
    value: any
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product and all its variants?"
    );
    if (!confirmDelete) return;

    const result = await ProductService.deleteProductWithVariants(productId);

    if (result.success) {
      setAlert({ type: "success", message: "Product deleted successfully." });
      // ✅ Optionally update local state or refetch list
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setAlert({
        type: "error",
        message: `Failed to delete product: ${result.message}`,
      });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this variant?"
    );
    if (!confirmDelete) return;

    const result = await ProductService.deleteProductVariant(variantId);

    if (result.success) {
      // Optionally refresh the list or update state
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      setAlert({ type: "success", message: "Variant deleted successfully." });
    } else {
      setAlert({
        type: "error",
        message: `Failed to delete variant: ${result.message}`,
      });
    }
    fetchAllProducts(); // Refresh products after deletion
  };

  // ✅ Handle form submission for both create and update
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: "",
      name: productName,
      subcategoryId: selectedSubcategory,
      brandId: selectedBrand,
      categoryId: selectedCategory,
      variants: variants.map((v) => ({
        id: v.id, // include only for update
        size: v.size,
        color: v.color,
        price: Number(v.price),
        stock_qty: Number(v.stock_qty),
      })),
    };
    try {
      let response: any;

      if (isEditMode && editingProductId) {
        // ✅ Update product
        response = await ProductService.updateProductWithVariants(
          editingProductId,
          payload,
          payload.variants // ✅ Consistent argument type
        );
      } else {
        // ✅ Create product
        response = await ProductService.createProductWithVariants(payload);
      }

      if (response.success) {
        setAlert({
          type: "success",
          message: isEditMode ? "✅ Product updated!" : "✅ Product added!",
        });

        // Reset form fields
        resetForm(); // ✅ Reset form state
        fetchAllProducts(); // ✅ Refresh product list
      } else {
        setAlert({ type: "error", message: "❌ " + response.message });
      }
    } catch (err) {
      console.error("❌ Failed to submit product:", err);
      setAlert({ type: "error", message: "❌ Error submitting product" });
    }
  };

  const resetForm = () => {
    setProductName("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setVariants([{ id: "", size: "", color: "", price: 0, stock_qty: 0 }]);

    // Reset edit states
    setIsEditMode(false);
    setEditingProductId(null);

    // ✅ Also reset variant edit state
    setIsVariantEditMode(false);
    setEditingVariantIndex(null);
    setSelectedProduct(null);

    // Optionally close the modal
    setIsAddModalOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    // 1. Set values into input fields
    setProductName(product.name);
    setSelectedCategory(product.categoryId);
    setSelectedSubcategory(product.subcategoryId);
    setSelectedBrand(product.brandId);

    // 2. Format and set variant fields
    const formattedVariants = product.variants.map((variant: any) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock_qty: variant.stock_qty,
    }));

    setVariants(formattedVariants);

    // 3. Set mode + ID
    setEditingProductId(product.id);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  // Handle update variant
  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVariantIndex === null) return;

    const variant = variants[editingVariantIndex];
    try {
      const response = await ProductService.updateVariant(variant.id!, variant);
      if (response.success) {
        setAlert({ type: "success", message: "✅ Variant updated!" });
        setIsVariantEditMode(false);
        setEditingVariantIndex(null);
        fetchAllProducts();
        setAlert({
          type: "success",
          message: "✅ Variant updated successfully!",
        });
        resetForm(); // Reset
      } else {
        setAlert({ type: "error", message: "❌ " + response.message });
      }
    } catch (err) {
      console.error("❌ Failed to update variant:", err);
      setAlert({ type: "error", message: "❌ Error updating variant" });
    }
  };

  const variantList =
    isVariantEditMode &&
    editingVariantIndex !== null &&
    variants[editingVariantIndex] !== undefined
      ? [variants[editingVariantIndex]]
      : variants;

  const handleEditVariant = (product: Product, variantId: number) => {
    setProductName(product.name);
    setSelectedCategory(product.categoryId);
    setSelectedSubcategory(product.subcategoryId);
    setSelectedBrand(product.brandId);
    setVariants(product.variants);
    setEditingVariantIndex(variantId); // Set the index of the variant being edited
    setIsVariantEditMode(true);
    setIsAddModalOpen(true);
  };

  return (
    <div className="page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="page-header">
        <div className="page-title">
          <Package className="page-icon" />
          <div>
            <h1>Products</h1>
            <p>Manage your product inventory</p>
          </div>
        </div>
        <Button
          onClick={() => {
            // setIsEditMode(false);
            setIsAddModalOpen(true);
            // resetForm();
          }}
        >
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

            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={16} />
              Filters
            </Button>
          </div>

          {isFilterOpen && (
            <div className="filter-dropdown-container">
              <div className="filter-select-group">
                <select
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <option value="">All Brands</option>
                  {allBrand.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="filter-select"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />

                <input
                  type="number"
                  className="filter-select"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          )}
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
                          {product.subcategoryId && (
                            <div className="product-subcategory">
                              {product.subcategoryId}
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
                        {allBrand.find((brand) => brand.id === product.brandId)
                          ?.name || "Unknown"}
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
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => handleEditProduct(product)}
                        >
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
                                  <button
                                    className="variant-action-btn variant-action-edit"
                                    onClick={() => {
                                      const variantIndex =
                                        product.variants.findIndex(
                                          (v) => v.id === variant.id
                                        );

                                      setSelectedProduct(product); // Set the current product
                                      setVariants(product.variants); // Populate all variants
                                      setEditingVariantIndex(variantIndex); // ✅ Set correct index
                                      handleEditVariant(product, variantIndex); // ✅ Pass index, not id

                                      setIsVariantEditMode(true); // Enable variant edit mode
                                      setIsAddModalOpen(true); // Open the modal
                                    }}
                                  >
                                    <Edit size={14} />
                                  </button>

                                  <button
                                    className="variant-action-btn variant-action-delete"
                                    onClick={() =>
                                      handleDeleteVariant(variant.id)
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

      {/* Custom Product Modal */}
      {(isEditMode || isAddModalOpen || isVariantEditMode) && (
        <Modal
          isOpen={isEditMode || isAddModalOpen || isVariantEditMode}
          onClose={() => {
            setIsEditMode(false);
            setIsAddModalOpen(false);
            setIsVariantEditMode(false);
            resetForm(); // Reset form state
          }}
          title={
            isVariantEditMode
              ? "Edit Variant"
              : isEditMode
              ? "Edit Product"
              : "Add New Product"
          }
          size="lg"
        >
          <form
            className="product-form"
            onSubmit={isVariantEditMode ? handleUpdateVariant : handleAddProduct}
          >
            <div className="form-row">
              <Input
                label="Product Name"
                placeholder="Enter product name"
                required
                disabled={isVariantEditMode}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <div className="form-subcategory">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  required
                  disabled={isVariantEditMode}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sub Category *</label>
                <select
                  className="form-select"
                  required
                  disabled={isVariantEditMode}
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                >
                  <option value="" disabled>
                    Select Subcategory
                  </option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Brand *</label>
                <select
                  className="form-select"
                  required
                  disabled={isVariantEditMode}
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <option value="" disabled>
                    Select Brand
                  </option>
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

              {variantList.map((variant, index) => {
                const isEditable = isVariantEditMode ? index === 0 : true; // Only first variant editable when in editVariant mode

                return (
                  <div
                    key={index}
                    className="variant-form border p-3 rounded-md shadow mb-4"
                  >
                    <div className="form-row">
                      <Input
                        label="Size"
                        value={variant.size}
                        required
                        placeholder="Enter size"
                        onChange={(e) =>
                          handleVariantChange(
                            isVariantEditMode ? editingVariantIndex! : index,
                            "size",
                            e.target.value
                          )
                        }
                        disabled={!isEditable}
                      />
                      <Input
                        label="Color"
                        value={variant.color}
                        required
                        placeholder="Enter color"
                        onChange={(e) =>
                          handleVariantChange(
                            isVariantEditMode ? editingVariantIndex! : index,
                            "color",
                            e.target.value
                          )
                        }
                        disabled={!isEditable}
                      />
                      <Input
                        label="Price"
                        type="number"
                        required
                        placeholder="Enter price"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            isVariantEditMode ? editingVariantIndex! : index,
                            "price",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        disabled={!isEditable}
                      />
                      <Input
                        label="Stock"
                        type="number"
                        required
                        placeholder="Enter stock quantity"
                        value={variant.stock_qty === "" ? "" : variant.stock_qty}
                        onChange={(e) =>
                          handleVariantChange(
                            isVariantEditMode ? editingVariantIndex! : index,
                            "stock_qty",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        disabled={!isEditable}
                      />

                      {!isVariantEditMode && variants.length > 1 && (
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
                  </div>
                );
              })}

              {!isVariantEditMode && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVariant}
                  >
                    Add Variant
                  </Button>
                </>
              )}
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                  setIsAddModalOpen(false);
                  setIsVariantEditMode(false);
                  setEditingVariantIndex(null);
                  resetForm(); // Reset form state
                }}
              >
                Cancel
              </Button>

              <Button type="submit">
                {/* {isEditMode ? "Update Product" : "Add Product"} */}

                {isVariantEditMode
                  ? "Update Variant"
                  : isEditMode
                  ? "Update Product"
                  : "Add Product"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Products;
