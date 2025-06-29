import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Tag, Folders } from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Alert from "../components/common/Alert";
import { SubCategory, Category } from "../types/index";
import SubCategoryService from "../functions/subCategory";
import CategoryService from "../functions/category";

const SubCategories: React.FC = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<
    SubCategory[] | any[]
  >([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<
    SubCategory | any
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    categoryId: "",
  });

  const resetForm = () => {
    setFormData({ name: "", status: "active", categoryId: "" });
    setEditingSubCategory(null);
  };

  const getAllSubCategories = async () => {
    try {
      const subCategories: any = await SubCategoryService.getAllSubCategories();
      setAllSubCategories(subCategories || []);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch subcategories." });
      setAllSubCategories([]); // Set empty array on error
    }
  };

  const getAllCategories = async () => {
    try {
      const categories: any = await CategoryService.getAllCategories();
      setAllCategories(categories.data || []);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch categories." });
      setAllCategories([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, status, categoryId } = formData;
    if (!name.trim()) {
      setAlert({ type: "error", message: "Subcategory name is required" });
      return;
    }

    try {
      if (editingSubCategory) {
        await SubCategoryService.updateSubCategory(
          editingSubCategory.id,
          name,
          status,
          categoryId
        );
        setAlert({
          type: "success",
          message: "Subcategory updated successfully",
        });
      } else {
        await SubCategoryService.createSubCategory(name, status, categoryId);
        setAlert({
          type: "success",
          message: "Subcategory added successfully",
        });
      }
      getAllSubCategories();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      setAlert({ type: "error", message: "Failed to save subcategory." });
    }
  };

  const handleEdit = (subcategory: SubCategory) => {
    setEditingSubCategory(subcategory);
    setFormData({
      name: subcategory.name,
      status: subcategory.status,
      categoryId: subcategory.categoryId,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string | any) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await SubCategoryService.deleteSubCategory(id);
        setAlert({
          type: "success",
          message: "Subcategory deleted successfully",
        });
        getAllSubCategories();
      } catch (error) {
        setAlert({ type: "error", message: "Failed to delete subcategory." });
      }
    }
  };

  useEffect(() => {
    getAllSubCategories();
    getAllCategories();
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
          {/* <Tag className="page-icon" /> */}
          <Folders className="page-icon" />
          <div>
            <h1>Sub Category</h1>
            <p>Manage product subcategories</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Sub Category
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
                <th>Sub Category</th>
                <th>Slug</th>
                <th>Category Name</th>
                <th>Status</th>
                <th>Create Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSubCategories
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
                      {" "}
                      <span className="brand-slug" style={{textTransform: 'capitalize',backgroundColor:'var(--primary-200)',padding: '5px 10px',borderRadius: '5px'}}>
                        {data.category.name}
                      </span>
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
        title={
          editingSubCategory ? "Edit Sub Category" : "Add New Sub Category"
        }
      >
        <form onSubmit={handleSubmit} className="category-form">
          <Input
            label="Sub Category Name"
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
          <label>Category</label>
          <select
            className="category-select"
            value={formData.categoryId} // ✅ bind value
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
          >
            {allCategories?.map((data) => (
              <option key={data.id} value={data.id}>
                {data.name}
              </option>
            ))}
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
              {editingSubCategory ? "Update" : "Add"} category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubCategories;
