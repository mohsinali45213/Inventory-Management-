import Category from "../models/category.models.js";
import slugify from "../utils/slugify.js";

// ✅ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    const errors = [];
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      errors.push("Name is required and should be at least 3 characters.");
    }
    if (status === undefined || typeof status !== "boolean") {
      errors.push("Status must be a boolean value.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const slug = slugify(name);
    const newCategory = await Category.create({ name, slug, status });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// ✅ Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// ✅ Get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

// ✅ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const errors = [];
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      errors.push("Name is required and should be at least 3 characters.");
    }
    if (status === undefined || typeof status !== "boolean") {
      errors.push("Status must be a boolean value.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const slug = slugify(name);
    await category.update({ name, slug, status });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// ✅ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
