import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter, UserCircle, CheckCircle, XCircle } from "lucide-react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Alert from "../components/common/Alert";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/config";

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
  createdAt?: string;
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    status: "active" as "active" | "inactive",
  });

  const [formError, setFormError] = useState('');

  const phoneRegex = /^(\+91[- ]?)?[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const validateForm = (isEdit = false) => {
    if (!phoneRegex.test(formData.phone)) {
      setFormError('Phone number must be 10 digits, may start with +91, and can include spaces or dashes.');
      return false;
    }
    if (!isEdit || formData.password) {
      if (!passwordRegex.test(formData.password)) {
        setFormError('Password must be at least 8 characters, include at least one letter, one number, and one special character.');
        return false;
      }
    }
    setFormError('');
    return true;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ name: "", phone: "", password: "", status: "active" });
        setSuccess("User added successfully");
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to add user");
      }
    } catch (err) {
      setError("An error occurred while adding user");
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/admin/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ name: "", phone: "", password: "", status: "active" });
        setSuccess("User updated successfully");
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update user");
      }
    } catch (err) {
      setError("An error occurred while updating user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/admin/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        setSuccess("User deleted successfully");
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete user");
      }
    } catch (err) {
      setError("An error occurred while deleting user");
    }
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      phone: user.phone,
      password: "",
      status: user.status,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="page users-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <UserCircle className="page-icon" />
          <div>
            <h1>Admin Users</h1>
            <p>Manage admin accounts, permissions, and access</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add User
        </Button>
      </div>

      <div className="page-content">
        {/* Controls Card */}
        <div className="filters-section">
          <div className="search-filter">
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search users by name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="form-group" style={{marginBottom:0, display:'flex', alignItems:'center', gap:8}}>
              <Filter className="filter-icon" size={18} style={{color:'var(--secondary-400)'}} />
              <label className="form-label" htmlFor="statusFilter" style={{marginBottom:0}}>Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="form-select"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Users Table Card */}
        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="users-avatar-name">
                      <div className="users-avatar">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : <UserCircle size={24} />}
                      </div>
                      <span className="users-name">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`status-badge users-status-badge status-${user.status}`}>
                      {user.status === 'active' ? <CheckCircle size={14} style={{marginRight:4, color:'var(--success-600)'}} /> : <XCircle size={14} style={{marginRight:4, color:'var(--error-600)'}} />}
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn action-btn-edit"
                        onClick={() => openEditModal(user)}
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn action-btn-delete"
                        onClick={() => openDeleteModal(user)}
                        title="Delete User"
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="empty-state users-empty-state">
              <UserCircle size={48} style={{opacity:0.2, marginBottom:8}} />
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setFormError(''); }}
        title="Add New User"
      >
        <form onSubmit={handleAddUser} className="user-form users-modal-form">
          {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
          <div className="form-group">
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter user name"
              required
            />
          </div>
          <div className="form-group">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="form-actions">
            <Button type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="primary">
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setFormError(''); }}
        title="Edit User"
      >
        <form onSubmit={handleEditUser} className="user-form users-modal-form">
          {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
          <div className="form-group">
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter user name"
              required
            />
          </div>
          <div className="form-group">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <Input
              label="Password (leave blank to keep current)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter new password"
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="form-actions">
            <Button type="button" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="primary">
              Update User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="delete-confirmation users-delete-confirmation">
          <XCircle size={40} style={{color:'var(--error-500)', marginBottom:8}} />
          <p>Are you sure you want to delete the user "{selectedUser?.name}"?</p>
          <p>This action cannot be undone.</p>
          <div className="form-actions">
            <Button type="button" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDeleteUser} className="danger">
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
