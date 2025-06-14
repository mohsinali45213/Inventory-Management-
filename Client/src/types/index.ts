export enum status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Product {
  id?: string;
  name: string;
  categoryId: string;
  brandId: string;
  subcategoryId?: string;
  status: status;
}

export interface ProductVariant {
  id?: string;
  productId: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  status: status;
}

export interface Category {
  id?: string;
  name: string;
  status: status;
}

export interface Brand {
  id?: string;
  name: string;
  status: status;
  slug: string;
  createdAt?: Date;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  customerName?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'cheque';
  createdAt: Date;
  status: 'paid' | 'pending' | 'cancelled';
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalSalesToday: number;
  totalInvoices: number;
  inventoryValue: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export interface ChartData {
  date: string;
  sales: number;
  revenue: number;
}

export type AlertType = 'success' | 'error' | 'warning' | 'info';