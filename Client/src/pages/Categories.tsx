import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Tag, Folder } from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Alert from "../components/common/Alert";
import { Category } from "../types/index";
import CategoryService from "../functions/category";

const Categories: React.FC = () => {
  const [allCategories, setAllCategories] = useState<Category[] | any[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({ name: "", status: "active" });

  const resetForm = () => {
    setFormData({ name: "", status: "active" });
    setEditingCategory(null);
  };

  const getAllCategory = async () => {
    try {
      const categories: any = await CategoryService.getAllCategories();
      setAllCategories(categories || []);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch category." });
      setAllCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, status } = formData;
    if (!name.trim()) {
      setAlert({ type: "error", message: "Category name is required" });
      return;
    }

    try {
      if (editingCategory) {
        await CategoryService.updateCategory(editingCategory.id, name, status);
        setAlert({ type: "success", message: "Category updated successfully" });
      } else {
        await CategoryService.createCategory(name, status);
        setAlert({ type: "success", message: "Category added successfully" });
      }
      getAllCategory();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      setAlert({ type: "error", message: "Failed to save category." });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, status: category.status });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string | any) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await CategoryService.deleteCategory(id);
        setAlert({ type: "success", message: "Category deleted successfully" });
        getAllCategory();
      } catch (error) {
        setAlert({ type: "error", message: "Failed to delete category." });
      }
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Folder className="page-icon" />
          <div>
            <h1>Category</h1>
            <p>Manage product category</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Category
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
                placeholder="Search category..."
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
                <th>Category Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Create Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allCategories
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
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="category-form">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
          <label>Status</label>
          <select
            className="category-select"
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
              {editingCategory ? "Update" : "Add"} category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;