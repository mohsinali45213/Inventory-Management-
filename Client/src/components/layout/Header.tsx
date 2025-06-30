import React, { useState } from "react";
import { Plus, ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { setTriggerAddModal } = useModal();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <h1>ClothingInv</h1>
          </div>
        </div>

        <div className="header-right">
          <div className="quick-add-dropdown">
            <button
              className="quick-add-btn"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
            >
              <Plus size={16} />
              <span>Quick Add</span>
              <ChevronDown size={16} />
            </button>

            {showQuickAdd && (
              <div className="dropdown-menu">
                <Link to="/products">
                  <button className="dropdown-item" onClick={() => {
                    setTriggerAddModal(true);
                  }}>
                    <Plus size={16} />
                    Add Product
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="user-menu">
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User size={20} />
              <span>{user?.name}</span>
              <ChevronDown size={16} />
            </button>

            {showUserMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item dropdown-item-info">
                  <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-phone">{user?.phone}</div>
                  </div>
                </div>
                <hr />
                <button className="dropdown-item" onClick={logout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
