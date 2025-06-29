import { API_URL } from '../config/config';

// Types
export interface InvoiceDraftItem {
  variantId: string;
  quantity: number;
  total: number;
}

export interface InvoiceDraft {
  id?: string;
  draftNumber?: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode?: 'cash' | 'card' | 'upi' | 'cheque' | 'bank';
  status?: 'draft' | 'saved';
  items: InvoiceDraftItem[];
}

// Create Invoice Draft
export const createInvoiceDraft = async (draftData: InvoiceDraft): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/invoice-drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draftData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in createInvoiceDraft:', error);
    throw error;
  }
};

// Get All Invoice Drafts
export const getAllInvoiceDrafts = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/invoice-drafts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch invoice drafts');
    }
    
    return result; // Return the full response object with data property
  } catch (error: any) {
    console.error('Error fetching invoice drafts:', error);
    throw new Error(error?.message || 'Something went wrong');
  }
};

// Get Invoice Draft by ID
export const getInvoiceDraftById = async (id: string): Promise<any> => {
  const response = await fetch(`${API_URL}/invoice-drafts/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch invoice draft');
  }
  
  return response.json();
};

// Update Invoice Draft
export const updateInvoiceDraft = async (id: string, draftData: Partial<InvoiceDraft>): Promise<any> => {
  const response = await fetch(`${API_URL}/invoice-drafts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draftData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update invoice draft');
  }
  
  return response.json();
};

// Delete Invoice Draft
export const deleteInvoiceDraft = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/invoice-drafts/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete invoice draft');
  }
};

// Convert Draft to Final Invoice
export const convertDraftToInvoice = async (draftId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/invoices/convert-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draftId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in convertDraftToInvoice:', error);
    throw error;
  }
};

const invoiceDraftService = {
  createInvoiceDraft,
  getAllInvoiceDrafts,
  getInvoiceDraftById,
  updateInvoiceDraft,
  deleteInvoiceDraft,
  convertDraftToInvoice,
};

export default invoiceDraftService; 