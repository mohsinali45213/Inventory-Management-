import Brand from "../models/brand.models.js";
import slugify from "../utils/slugify.js";

// 🔐 Validation Helper
const validateBrandInput = (name, status) => {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Brand name is required and must be a non-empty string.");
  } else if (name.length < 2 || name.length > 100) {
    errors.push("Brand name must be between 2 and 100 characters.");
  }

  const allowedStatuses = ["active", "inactive"];
  if (!status || !allowedStatuses.includes(status.toLowerCase())) {
    errors.push("Status must be either 'active' or 'inactive'.");
  }

  return errors;
};

// ✅ Create a new brand
export const createBrand = async (req, res) => {
  try {
    const { name, status } = req.body;
    const errors = validateBrandInput(name, status);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const existingBrand = await Brand.findOne({ where: { name } });
    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand with this name already exists",
      });
    }

    const slug = slugify(name);
    const newBrand = await Brand.create({ name, slug, status });

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: newBrand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: error.message,
    });
  }
};

// ✅ Update brand by ID
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const errors = validateBrandInput(name, status);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Prevent duplicate brand names (excluding current brand)
    const duplicate = await Brand.findOne({ where: { name } });
    if (duplicate && duplicate.id !== parseInt(id)) {
      return res.status(409).json({
        success: false,
        message: "Another brand with this name already exists",
      });
    }

    const slug = slugify(name);
    await brand.update({ name, slug, status });

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error: error.message,
    });
  }
};

// ✅ Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      data: brands,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
};

// ✅ Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand fetched successfully",
      data: brand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
      error: error.message,
    });
  }
};

// ✅ Delete brand by ID
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    await brand.destroy();

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error: error.message,
    });
  }
};