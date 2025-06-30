import Product from "../models/products.models.js";
import Category from "../models/category.models.js";
import SubCategory from "../models/subCategory.modules.js";
import Brand from "../models/brand.models.js";
import ProductVariant from "../models/productVariant.models.js";
import slugify from "../utils/slugify.js";
import { generateBarcode } from "../utils/barcode.js";
import sequelize from "../db/db.js"; // Adjust path based on your structure


export const createProductWithVariants = async (req, res) => {
  const {
    name,
    brandId,
    categoryId,
    subCategoryId,
    status = "active",
    variants,
  } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({ error: "Missing required product fields." });
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({ error: "At least one variant is required." });
  }

  try {
    const product = await Product.create({
      name,
      brandId,
      categoryId,
      subCategoryId,
      slug: slugify(name).toLowerCase(),
      status,
    });

    const variantRecords = variants.map((v) => {
      const { size, color, stock_qty, price } = v;

      if (!size || !color || !price) {
        throw new Error("Missing required variant fields.");
      }

      return {
        size,
        color,
        stock_qty: stock_qty || 0,
        price,
        slug: slugify(`${size}-${color}-${Date.now()}`).toLowerCase(),
        barcode: generateBarcode(),
        productId: product.id,
      };
    });

    const createdVariants = await ProductVariant.bulkCreate(variantRecords);

    return res.status(201).json({
      message: "Product and variants created successfully.",
      product,
      variants: createdVariants,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};

// ✅ Update Product with Variants
export const updateProductWithVariants = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, subCategoryId, categoryId, brandId, variants = [] } = req.body;

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update(
      {
        name,
        slug: slugify(name).toLowerCase(),
        subCategoryId,
        categoryId,
        brandId,
      },
      { transaction }
    );

    const existingVariants = await ProductVariant.findAll({
      where: { productId: id },
      transaction,
    });

    const existingVariantIds = existingVariants.map((v) => v.id);
    const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id);

    const variantsToDelete = existingVariantIds.filter(
      (vid) => !incomingVariantIds.includes(vid)
    );

    if (variantsToDelete.length > 0) {
      await ProductVariant.destroy({
        where: { id: variantsToDelete },
        transaction,
      });
    }

    for (const variant of variants) {
      if (variant.id && existingVariantIds.includes(variant.id)) {
        const updateData = {
          size: variant.size,
          slug: slugify(`${variant.size}-${variant.color}-${Date.now()}`).toLowerCase(),
          barcode: generateBarcode(),
          color: variant.color,
          price: variant.price,
          stock_qty: variant.stock_qty,
        };
        await ProductVariant.update(
          updateData,
          {
            where: { id: variant.id },
            transaction,
          }
        );
      } else {
        const createData = {
          productId: id,
          size: variant.size,
          slug: slugify(`${variant.size}-${variant.color}-${Date.now()}`).toLowerCase(),
          barcode: generateBarcode(),
          color: variant.color,
          price: variant.price,
          stock_qty: variant.stock_qty,
        };
        await ProductVariant.create(
          createData,
          { transaction }
        );
      }
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Product and variants updated successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Failed to update product", error });
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

export const deleteProductWithVariants = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Product and its variants deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const deleteProductVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await ProductVariant.findByPk(id);

    if (!variant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    await variant.destroy();

    return res.status(200).json({ message: "Product variant deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product variant",
      error: error.message,
    });
  }
};

// ✅ Update Product Variant
export const updateProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, color, price, stock_qty, barcode, slug } = req.body;

    const variant = await ProductVariant.findByPk(id);

    if (!variant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    variant.size = size ?? variant.size;
    variant.color = color ?? variant.color;
    variant.price = price ?? variant.price;
    variant.stock_qty = stock_qty ?? variant.stock_qty;
    variant.barcode = barcode ?? variant.barcode;
    variant.slug = slug ?? variant.slug;

    await variant.save();

    return res.status(200).json({
      message: "Product variant updated successfully",
      variant,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update product variant",
      error: error.message,
    });
  }
};