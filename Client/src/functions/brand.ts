import { API_URL } from "../config/config";
import { Brand } from "../types/index";

const createBrand = async (name: string, status: string): Promise<Brand> => {
  const response = await fetch(`${API_URL}/brands`, {
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
    throw new Error("Failed to create brand");
  }
  return response.json();
};

const getAllBrand = async (): Promise<Brand[]> => {
  try {
    const response = await fetch(`${API_URL}/brands`);
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch brands");
    }
    
    return result.data; // Return the actual brands array
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    throw new Error(error?.message || "Something went wrong");
  }
};

const getBrandById = async (id: string): Promise<Brand> => {
  const response = await fetch(`${API_URL}/brands/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch brand");
  }
  return response.json();
};

const updateBrand = async (
  id: string,
  name: string,
  status: string
): Promise<Brand> => {
  const response = await fetch(`${API_URL}/brands/${id}`, {
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
    throw new Error("Failed to update brand");
  }
  return response.json();
};

const deleteBrand = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/brands/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete brand");
  }
};

const BrandService = {
  createBrand,
  getAllBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
};

export default BrandService;
