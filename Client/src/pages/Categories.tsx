import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Folder } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import { Category } from '../types';

const Categories: React.FC = () => {
  const { state, dispatch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredCategories = state.categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Category name is required' });
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
    
    if (editingCategory) {
      const updatedCategory: Category = {
        ...editingCategory,
        name: formData.name.trim(),
        slug: slug
      };
      dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
      setAlert({ type: 'success', message: 'Category updated successfully' });
      setIsEditModalOpen(false);
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        slug: slug,
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      setAlert({ type: 'success', message: 'Category added successfully' });
      setIsAddModalOpen(false);
    }
    
    setFormData({ name: '', slug: '' });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setIsEditModalOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      setAlert({ type: 'success', message: 'Category deleted successfully' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '' });
    setEditingCategory(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Folder className="page-icon" />
          <div>
            <h1>Categories</h1>
            <p>Manage product categories</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          Add Category
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
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
                <th>Products Count</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => {
                const productCount = state.products.filter(p => p.categoryId === category.id).length;
                return (
                  <tr key={category.id}>
                    <td>
                      <div className="category-cell">
                        <Folder size={20} className="category-icon" />
                        <span className="category-name">{category.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-slug">{category.slug}</span>
                    </td>
                    <td>
                      <span className="product-count">{productCount} products</span>
                    </td>
                    <td>
                      <span className="created-date">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn action-btn-edit"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn action-btn-delete"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Category"
      >
        <form onSubmit={handleSubmit} className="category-form">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
          <Input
            label="Slug (Optional)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Auto-generated from name"
            helperText="Leave empty to auto-generate from category name"
          />
          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit Category"
      >
        <form onSubmit={handleSubmit} className="category-form">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="category-slug"
            required
          />
          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Update Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;