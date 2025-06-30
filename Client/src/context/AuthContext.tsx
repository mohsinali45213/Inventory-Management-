import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { API_URL } from '../config/config';

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (name: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData: User = {
          id: data.data.admin.id,
          name: data.data.admin.name,
          phone: data.data.admin.phone,
          role: 'admin',
          status: data.data.admin.status,
        };
        
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, phone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ name, phone, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData: User = {
          id: data.data.id,
          name: data.data.name,
          phone: data.data.phone,
          role: 'admin',
          status: data.data.status,
        };
        
        localStorage.setItem('auth_token', 'mock_jwt_token');
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Registration failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};