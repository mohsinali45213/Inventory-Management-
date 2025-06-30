import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import StockManagement from './pages/StockManagement';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Barcode from './pages/Barcode';
import SubCategories from './pages/SubCategories';
import Users from './pages/Users';
import PageNotFound from './pages/PageNotFound';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="sub-categories" element={<SubCategories/>} />
        <Route path="brands" element={<Brands />} />
        <Route path="stock" element={<StockManagement />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="reports" element={<Reports />} />
        <Route path="barcode" element={<Barcode />} />
        <Route path="users" element={<Users />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          <AppRoutes />
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
};

export default App;