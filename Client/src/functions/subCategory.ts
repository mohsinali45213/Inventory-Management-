import { API_URL } from "../config/config";
import { SubCategory } from "../types/index";

const createSubCategory = async (
  name: string,
  status: string,
  categoryId: string
): Promise<SubCategory> => {
  const response = await fetch(`${API_URL}/subcategory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      status,
      categoryId
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to create subcategories");
  }
  return response.json();
};

const getAllSubCategories = async (): Promise<SubCategory[]> => {
  try {
    const response = await fetch(`${API_URL}/subcategory`);
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch subcategories");
    }
    
    return result.data; // Return the actual subcategories array
  } catch (error: any) {
    console.error("Error fetching subcategories:", error);
    throw new Error(error?.message || "Something went wrong");
  }
};

const getSubCategoryById = async (id: string): Promise<SubCategory> => {
  const response = await fetch(`${API_URL}/subcategory/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch subcategory");
  }
  return response.json();
};

const updateSubCategory = async (
  id: string,
  name: string,
  status: string,
  categoryId: string
): Promise<SubCategory> => {
  const response = await fetch(`${API_URL}/subcategory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      status,
      categoryId
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to update subcategory");
  }
  return response.json();
};

const deleteSubCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/subcategory/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete subcategory");
  }
};

const SubCategoryService = {
  createSubCategory,
  updateSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  deleteSubCategory,
};

export default SubCategoryService;
