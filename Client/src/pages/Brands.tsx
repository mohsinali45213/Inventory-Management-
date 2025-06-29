// Updated React page with all brand CRUD functionalities fully integrated

import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Alert from "../components/common/Alert";
import { Brand } from "../types";
import BrandService from "../functions/brand";

const Brands: React.FC = () => {
  const [allBrand, setAllBrand] = useState<Brand[] | any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({ name: "", status: "active" });

  const resetForm = () => {
    setFormData({ name: "", status: "active" });
    setEditingBrand(null);
  };

  const getAllBrands = async () => {
    try {
      const brands: any = await BrandService.getAllBrand();
      setAllBrand(brands || []);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch brands." });
      setAllBrand([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, status } = formData;
    if (!name.trim()) {
      setAlert({ type: "error", message: "Brand name is required" });
      return;
    }

    try {
      if (editingBrand) {
        await BrandService.updateBrand(editingBrand.id, name, status);
        setAlert({ type: "success", message: "Brand updated successfully" });
      } else {
        await BrandService.createBrand(name, status);
        setAlert({ type: "success", message: "Brand added successfully" });
      }
      getAllBrands();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      setAlert({ type: "error", message: "Failed to save brand." });
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, status: brand.status });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string | any) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await BrandService.deleteBrand(id);
        setAlert({ type: "success", message: "Brand deleted successfully" });
        getAllBrands();
      } catch (error) {
        setAlert({ type: "error", message: "Failed to delete brand." });
      }
    }
  };

  useEffect(() => {
    getAllBrands();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer); // Clean up
    }
  }, [alert]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Tag className="page-icon" />
          <div>
            <h1>Brands</h1>
            <p>Manage product brands</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Brand
        </Button>
      </div>

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="filters-section">
          <div className="search-filter">
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search brands..."
                className="search-input"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Create Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allBrand
                .filter((data) =>
                  data.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((data) => (
                  <tr key={data.id}>
                    <td>
                      <div className="brand-cell">
                        <Tag size={20} className="brand-icon" />
                        <span className="brand-name">{data.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="brand-slug">{data.slug}</span>
                    </td>
                    <td>
                      <span
                        className={`brand-status ${
                          data.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {data.status}
                      </span>
                    </td>
                    <td>
                      <span>
                        {new Date(data.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => handleEdit(data)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleDelete(data.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={editingBrand ? "Edit Brand" : "Add New Brand"}
      >
        <form onSubmit={handleSubmit} className="brand-form">
          <Input
            label="Brand Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter brand name"
            required
          />
          <label>Status</label>
          <select
            className="brand-select"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingBrand ? "Update" : "Add"} Brand
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Brands;
