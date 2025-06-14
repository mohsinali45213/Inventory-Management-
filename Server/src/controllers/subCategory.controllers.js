import SubCategory from "../models/subCategory.modules.js";
import Category from "../models/category.models.js";
import slugify from "../utils/slugify.js";

// ✅ Create SubCategory
export const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId, status } = req.body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name is required and must be at least 2 characters long",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const slug = slugify(name);

    const subCategory = await SubCategory.create({
      name,
      slug,
      categoryId,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create subcategory",
      error: error.message,
    });
  }
};

// ✅ Get All SubCategories
export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [{ model: Category, as: "category" }],
    });

    res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      data: subCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

// ✅ Get SubCategory By ID
export const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subcategory ID is required",
      });
    }

    const subCategory = await SubCategory.findByPk(id, {
      include: [{ model: Category, as: "category" }],
    });

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory fetched successfully",
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subcategory",
      error: error.message,
    });
  }
};

// ✅ Update SubCategory
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subcategory ID is required",
      });
    }

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
    }

    if (name && (typeof name !== "string" || name.trim().length < 2)) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    const updatedSlug = name ? slugify(name) : subCategory.slug;

    await subCategory.update({
      name: name || subCategory.name,
      slug: updatedSlug,
      categoryId: categoryId || subCategory.categoryId,
      status: status !== undefined ? status : subCategory.status,
    });

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update subcategory",
      error: error.message,
    });
  }
};

// ✅ Delete SubCategory
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subcategory ID is required",
      });
    }

    const subCategory = await SubCategory.findByPk(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    await subCategory.destroy();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete subcategory",
      error: error.message,
    });
  }
};