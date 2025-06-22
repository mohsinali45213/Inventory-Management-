// import axios from 'axios';
import { Product, ProductVariant } from '../types/index';
import { API_URL } from '../config/config';


const createProductWithVariants = async (product: Product) => {
  try {
    // Construct payload for backend
    const payload = {
      name: product.name,
      brandId: product.brandId,
      categoryId: product.categoryId,
      subCategoryId: product.subcategoryId,
      // status: product.status,
      variants: product.variants.map((variant) => ({
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock_qty: variant.stock_qty // Convert frontend field to backend expected name
      })),
    };

    const response = await fetch(`${API_URL}/products/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create product');
    }

    return {
      success: true,
      message: result.message,
      product: result.product,
      variants: result.variants,
    };
  } catch (error: any) {
    console.error("❌ createProductWithVariants Error:", error);
    return {
      success: false,
      message: error.message || "Unknown error",
    };
  }
};
const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch products.");
    }

    return result.data; // ✅ This is the array of product objects
  } catch (error: any) {
    console.error("❌ Error fetching products:", error);
    throw new Error(error?.message || "Something went wrong");
  }
};

const getProductById = async (productId: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch product.");
    }

    return result.data; // ✅ Product with variants, brand, category, subcategory
  } catch (error: any) {
    console.error("❌ Error fetching product by ID:", error);
    throw new Error(error?.message || "Something went wrong");
  }
};

const updateProductWithVariants = async (
  productId: string,
  product: Product,
  variants: ProductVariant[]
): Promise<{ success: boolean; message: string }> => {
  try {
    // 🔧 Construct request body exactly how your backend expects it
    const payload = {
      name: product.name,
      subcategory: product.subcategoryId,
      categoryId: product.categoryId,
      brandId: product.brandId,
      variants: variants.map((variant) => ({
        id: variant.id || undefined, // undefined for new variants
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock: variant.stock_qty,
      })),
    };

    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update product.");
    }

    return { success: true, message: result.message };
  } catch (error: any) {
    console.error("❌ Error updating product with variants:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};

const updateVariant = async (
  // productId: string,
  variantId: string,
  variant: ProductVariant
): Promise<{ success: boolean; message: string }> => {
  try {
    // Prepare data matching the backend controller’s expected keys
    const payload = {
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock_qty: variant.stock_qty, // ✅ match backend key exactly
      barcode: variant.barcode,
      // slug: variant.slug,
    };

    const response = await fetch(
      `${API_URL}/products/variants/${variantId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update variant");
    }

    return { success: true, message: result.message };
  } catch (error: any) {
    console.error("Error updating product variant:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    };
  }
};

const deleteProductWithVariants = async (productId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete product");
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error: any) {
    console.error("Error deleting product with variants:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    };
  }
};

const deleteProductVariant = async (
  // productId: string,
  variantId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/products/variants/${variantId}`, {
      
      method: "DELETE",
    });
    console.log(response);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete variant");
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error: any) {
    console.error("Error deleting product variant:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    };
  }
};

const getAllVariants = async (): Promise<ProductVariant[]> => {
  try {
    const response = await fetch(`${API_URL}/product-variants`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch product variants.");
    }

    return result.data; // ✅ This is the array of product objects
  } catch (error: any) {
    console.error("❌ Error fetching product variants:", error);
    throw new Error(error?.message || "Something went wrong");
  }
};
const ProductService = {      
  createProductWithVariants,
  getAllProducts,
  getProductById,
  updateProductWithVariants,
  updateVariant,
  deleteProductWithVariants,
  deleteProductVariant,
  getAllVariants
};
export default ProductService;