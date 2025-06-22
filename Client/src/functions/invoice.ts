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
    throw new Error('Failed to fetch invoice');
  }
  return response.json();
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




const invoiceService = {
  createInvoice,      
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};

export default invoiceService;
