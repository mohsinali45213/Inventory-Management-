import Product from "../models/products.models.js";
import Category from "../models/category.models.js";
import SubCategory from "../models/subCategory.modules.js";
import Brand from "../models/brand.models.js";
import ProductVariant from "../models/productVariant.models.js";
import slugify from "../utils/slugify.js";

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, brandId, categoryId, subCategoryId, status } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name and Category are required.",
      });
    }

    const slug = slugify(name);

    const product = await Product.create({
      name,
      slug,
      brandId,
      categoryId,
      subCategoryId,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product.",
      error: error.message,
    });
  }
};

// ✅ Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: "category" },
        { model: SubCategory, as: "subCategory" },
        { model: Brand, as: "brand" },
        { model: ProductVariant, as: "variants" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
      error: error.message,
    });
  }
};

// ✅ Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: SubCategory, as: "subCategory" },
        { model: Brand, as: "brand" },
        { model: ProductVariant, as: "variants" },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
      error: error.message,
    });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brandId, categoryId, subCategoryId, status } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const slug = name ? slugify(name) : product.slug;

    await product.update({
      name: name || product.name,
      slug,
      brandId: brandId ?? product.brandId,
      categoryId: categoryId ?? product.categoryId,
      subCategoryId: subCategoryId ?? product.subCategoryId,
      status: status || product.status,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product.",
      error: error.message,
    });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
      error: error.message,
    });
  }
};
