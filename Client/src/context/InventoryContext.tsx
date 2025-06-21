import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, Category, Brand, Invoice, DashboardStats } from '../types';
import { generateMockData } from '../utils/mockData';

interface InventoryState {
  products: Product[];
  categories: Category[];
  subcategories: Category[]; // Assuming subcategories are also categories
  brands: Brand[];
  invoices: Invoice[];
  stats: DashboardStats;
}

type InventoryAction = 
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_BRANDS'; payload: Brand[] }
  | { type: 'ADD_BRAND'; payload: Brand }
  | { type: 'UPDATE_BRAND'; payload: Brand }
  | { type: 'DELETE_BRAND'; payload: string }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_STATS'; payload: DashboardStats };

const initialState: InventoryState = {
  products: [],
  categories: [],
  subcategories: [],
  brands: [],
  invoices: [],
  stats: {
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalSalesToday: 0,
    totalInvoices: 0,
    inventoryValue: 0,
    outOfStockCount: 0,
    lowStockCount: 0
  }
};

const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };
    case 'SET_BRANDS':
      return { ...state, brands: action.payload };
    case 'ADD_BRAND':
      return { ...state, brands: [...state.brands, action.payload] };
    case 'UPDATE_BRAND':
      return {
        ...state,
        brands: state.brands.map(b => b.id === action.payload.id ? action.payload : b)
      };
    case 'DELETE_BRAND':
      return {
        ...state,
        brands: state.brands.filter(b => b.id !== action.payload)
      };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
};

interface InventoryContextType {
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  calculateStats: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  useEffect(() => {
    const mockData = generateMockData();
    dispatch({ type: 'SET_PRODUCTS', payload: mockData.products });
    dispatch({ type: 'SET_CATEGORIES', payload: mockData.categories });
    dispatch({ type: 'SET_BRANDS', payload: mockData.brands });
    dispatch({ type: 'SET_INVOICES', payload: mockData.invoices });
  }, []);

  const calculateStats = () => {
    const totalProducts = state.products.length;
    const totalCategories = state.categories.length;
    const totalBrands = state.brands.length;
    const totalInvoices = state.invoices.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayInvoices = state.invoices.filter(invoice => 
      new Date(invoice.createdAt) >= today
    );
    const totalSalesToday = todayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    const inventoryValue = state.products.reduce((sum, product) => {
      return sum + product.variants.reduce((variantSum, variant) => 
        variantSum + (variant.price * variant.stock_qty), 0
      );
    }, 0);
    
    const outOfStockCount = state.products.reduce((count, product) => {
      return count + product.variants.filter(variant => variant.stock_qty === 0).length;
    }, 0);
    
    const lowStockCount = state.products.reduce((count, product) => {
      return count + product.variants.filter(variant => variant.stock_qty > 0 && variant.stock_qty <= 10).length;
    }, 0);

    const stats: DashboardStats = {
      totalProducts,
      totalCategories,
      totalBrands,
      totalSalesToday,
      totalInvoices,
      inventoryValue,
      outOfStockCount,
      lowStockCount
    };

    dispatch({ type: 'UPDATE_STATS', payload: stats });
  };

  useEffect(() => {
    calculateStats();
  }, [state.products, state.categories, state.brands, state.invoices]);

  return (
    <InventoryContext.Provider value={{ state, dispatch, calculateStats }}>
      {children}
    </InventoryContext.Provider>
  );
};