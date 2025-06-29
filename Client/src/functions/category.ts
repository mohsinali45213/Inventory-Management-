import { API_URL } from "../config/config";
import { Category } from "../types/index";

const createCategory = async (
  name: string,
  status: string
): Promise<Category> => {
  const response = await fetch(`${API_URL}/category`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      status,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to create category");
  }
  return response.json();
};

const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/category`);
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch categories");
    }
    
    return result.data; // Return the actual categories array
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    throw new Error(error?.message || "Something went wrong");
  }
};

const getCategoryById = async (id: string): Promise<Category> => {
  const response = await fetch(`${API_URL}/category/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }
  return response.json();
};

const updateCategory = async (
  id: string,
  name: string,
  status: string
): Promise<Category> => {
  const response = await fetch(`${API_URL}/category/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      status,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to update category");
  }
  return response.json();
};

const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/category/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete category");
  }
};

const CategoryService = {
  createCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
};

export default CategoryService;
