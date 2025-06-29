import { API_URL } from '../config/config';
import { Invoice } from '../types/index';;

const createInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const response = await fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoice),
  });
  if (!response.ok) {
    throw new Error('Failed to create invoice');
  }
  return response.json();
};

const createInvoiceWithItems = async (invoiceData: any): Promise<any> => {
  const response = await fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  
  return response.json();
};

const getAllInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch(`${API_URL}/invoices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();
};

const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await fetch(`${API_URL}/invoices/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch invoice");
  }

  const json = await response.json();

  // Check if the structure is as expected
  if (!json.success || !json.data) {
    throw new Error(json.message || "Unexpected response structure");
  }

  return json.data; // ✅ Only return the actual invoice data
};


const updateInvoice = async (id: string, invoice: Invoice): Promise<Invoice> => {
  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoice),
  });
  if (!response.ok) {
    throw new Error('Failed to update invoice');
  }
  return response.json();
};

const deleteInvoice = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete invoice');
  }
};


export const getItemByBarcode = async (barcode: string) => {
  const response = await fetch(`${API_URL}/invoices/barcode/${barcode}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product by barcode");
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Product not found");
  }

  return result.data; // should contain productId, variantId, productName, size, color, price, stock_qty
};

export const getAllCustomers = async () => {
  const response = await fetch(`${API_URL}/customers`);
  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }
  return response.json();
};





const invoiceService = {
  getAllCustomers,
  createInvoice,
  createInvoiceWithItems,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getItemByBarcode,
};

export default invoiceService;
