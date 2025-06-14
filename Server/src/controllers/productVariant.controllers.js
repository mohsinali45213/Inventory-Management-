import ProductVariant from "../models/productVariant.models.js";
import Product from "../models/products.models.js";
import slugify from "../utils/slugify.js";
import { generateBarcode } from "../utils/barcode.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// ✅ Create a new Product Variant
export const createProductVariant = async (req, res) => {
  try {
    const { productId, size, color, stock_qty, price, slug } = req.body;

    const productExists = await Product.findByPk(productId);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const result = await uploadOnCloudinary(req.file.path);
    const image_url = result.url;

    const variantExists = await ProductVariant.findOne({
      where: {
        productId,
        size,
        color,
      },
    });

    if (variantExists) {
      return res.status(400).json({
        success: false,
        message: "This product variant (size and color) already exists",
      });
    }

    const newVariant = await ProductVariant.create({
      productId,
      size,
      color,
      stock_qty,
      price,
      slug: slug || slugify(`${size}-${color}-${Date.now()}`).toLowerCase(),
      barcode: generateBarcode(),
      image_url,
    });

    res.status(201).json({
      success: true,
      message: "Product variant created successfully",
      data: newVariant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product variant",
      error: error.message,
    });
  }
};

// ✅ Get All Product Variants
export const getAllProductVariants = async (req, res) => {
  try {
    const variants = await ProductVariant.findAll({
      include: [{ model: Product, as: "product" }],
    });

    res.status(200).json({
      success: true,
      message: "Product variants fetched successfully",
      data: variants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product variants",
      error: error.message,
    });
  }
};

// ✅ Get Product Variant by ID
export const getProductVariantById = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await ProductVariant.findByPk(id, {
      include: [{ model: Product, as: "product" }],
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product variant fetched successfully",
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product variant",
      error: error.message,
    });
  }
};

// ✅ Update Product Variant
export const updateProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, size, color, stock_qty, price, slug, Image_url } =
      req.body;

    const variant = await ProductVariant.findByPk(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    const result = await uploadOnCloudinary(req.file.path);
    const image_url = result.url;

    // Optionally validate product existence
    if (productId) {
      const productExists = await Product.findByPk(productId);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    await variant.update({
      productId: productId || variant.productId,
      size: size || variant.size,
      color: color || variant.color,
      stock_qty: stock_qty ?? variant.stock_qty,
      price: price ?? variant.price,
      slug: slug || variant.slug,
      image_url: image_url || variant.image_url,
    });

    res.status(200).json({
      success: true,
      message: "Product variant updated successfully",
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product variant",
      error: error.message,
    });
  }
};

// ✅ Delete Product Variant
export const deleteProductVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await ProductVariant.findByPk(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    await variant.destroy();

    res.status(200).json({
      success: true,
      message: "Product variant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product variant",
      error: error.message,
    });
  }
};
