import React, { useEffect, useState } from "react";
import {
  Package,
  Folder,
  Tag,
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle,
  Eye,
  Shirt,
  Plus,
  ShoppingBag,
  Minus,
  Trash,
  Save,
  Printer,
  Scan,
  X,
  Download,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { useInventory } from "../context/InventoryContext";
import StatCard from "../components/dashboard/StatCard";
import { format } from "date-fns";
import invoiceService from "../functions/invoice";
import invoiceDraftService from "../functions/invoiceDraft";
import CategoryService from "../functions/category";
import ProductService from "../functions/product";
import { API_URL } from "../config/config";
import Toast from '../components/common/Toast';
import '../styles/Modal.css';
import '../styles/Dashboard.css';

interface BillingItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
  barcode: string;
  stock_qty: number;
}

interface InvoiceDraft {
  id: string;
  draftNumber: string;
  customerName: string;
  customerPhone: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: string;
  status: 'draft' | 'saved';
  createdAt: string;
  items?: any[];
}

const Dashboard: React.FC = () => {
  const { state } = useInventory();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchBarcode, setSearchBarcode] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [allCustomers, setAllCustomers] = useState<any>([]);
  const [customerToggle, setCustomerToggle] = useState<any>(false)
  const [customerSearch, setCustomerSearch] = useState<any>("")
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string, details?: any } | null>(null);
  
  // Billing state
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    gst: false,
    discountPercentage: 0,
  });
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: '',
    subtotal: 0,
    discount: 0,
    gst: 0,
    total: 0,
  });

  // Drafts state
  const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<InvoiceDraft | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate totals whenever billing items or customer info changes
  useEffect(() => {
    calculateTotals();
  }, [billingItems, customerInfo]);

  const calculateTotals = () => {
    const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
    const discount = (subtotal * customerInfo.discountPercentage) / 100;
    const gst = customerInfo.gst ? ((subtotal - discount) * 18) / 100 : 0;
    const total = subtotal - discount + gst;
    
    setPaymentDetails(prev => ({
      ...prev,
      subtotal,
      discount,
      gst,
      total,
    }));
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string, details?: any) => {
    setMessage({ type, text, details });
    setTimeout(() => setMessage(null), 5000); // Show for 5 seconds
  };

  const getAllDrafts = async () => {
    try {
      console.log('Fetching drafts...');
      const response = await invoiceDraftService.getAllInvoiceDrafts();
      console.log('Drafts response:', response);
      console.log('Drafts data structure:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('First draft structure:', response.data[0]);
        console.log('First draft total type:', typeof response.data[0].total);
        console.log('First draft total value:', response.data[0].total);
      }
      setInvoiceDrafts(response.data || []);
      console.log('Drafts set to:', response.data || []);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  const handleDraftsButtonClick = () => {
    console.log('Drafts button clicked');
    console.log('Current showDraftsModal state:', showDraftsModal);
    console.log('Current invoiceDrafts:', invoiceDrafts);
    setShowDraftsModal(true);
  };

  const handleSaveDraft = async () => {
    if (billingItems.length === 0) {
      showMessage('error', 'No items in billing to save');
      return;
    }

    if (!paymentDetails.paymentMethod) {
      showMessage('error', 'Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const draftData: any = {
        subtotal: Number(paymentDetails.subtotal),
        discount: Number(paymentDetails.discount),
        tax: Number(paymentDetails.gst),
        total: Number(paymentDetails.total),
        paymentMode: paymentDetails.paymentMethod.toLowerCase() as 'cash' | 'card' | 'upi' | 'cheque' | 'bank',
        status: 'draft' as 'draft' | 'saved',
        items: billingItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          total: item.total,
        })),
      };

      // Only add customer information if both name and phone are provided
      if (customerInfo.name && customerInfo.name.trim() && customerInfo.phone && customerInfo.phone.trim()) {
        draftData.customerName = customerInfo.name.trim();
        draftData.customerPhone = customerInfo.phone.trim();
      }

      console.log('Saving draft with data:', JSON.stringify(draftData, null, 2));
      console.log('Billing items:', billingItems);
      console.log('Payment details:', paymentDetails);
      
      const response = await invoiceDraftService.createInvoiceDraft(draftData);
      console.log('Draft saved successfully:', response);
      
      showMessage('success', 'Invoice saved as draft successfully!', {
        draftNumber: response.data?.draft?.draftNumber || 'Draft-' + response.data?.draft?.id?.slice(0, 8),
        customerName: customerInfo.name || 'No Customer',
        total: paymentDetails.total,
        itemsCount: billingItems.length,
        paymentMode: paymentDetails.paymentMethod
      });
      handleNewInvoice();
      getAllDrafts();
    } catch (error: any) {
      console.error('Error saving draft:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showMessage('error', error.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAndSave = async () => {
    if (billingItems.length === 0) {
      showMessage('error', 'No items in billing to save');
      return;
    }

    if (!paymentDetails.paymentMethod) {
      showMessage('error', 'Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const invoiceData: any = {
        subtotal: Number(paymentDetails.subtotal),
        discount: Number(paymentDetails.discount),
        tax: Number(paymentDetails.gst),
        total: Number(paymentDetails.total),
        paymentMode: paymentDetails.paymentMethod.toLowerCase() as 'cash' | 'card' | 'upi' | 'cheque' | 'bank',
        status: 'paid' as 'pending' | 'paid' | 'cancelled',
        items: billingItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          total: item.total,
        })),
      };

      // Only add customer information if both name and phone are provided
      if (customerInfo.name && customerInfo.name.trim() && customerInfo.phone && customerInfo.phone.trim()) {
        invoiceData.customerName = customerInfo.name.trim();
        invoiceData.customerPhone = customerInfo.phone.trim();
      }

      console.log('Creating final invoice with data:', JSON.stringify(invoiceData, null, 2));
      
      const response = await invoiceService.createInvoiceWithItems(invoiceData);
      console.log('Invoice created successfully:', response);
      
      // Create invoice object for printing
      const createdInvoice = {
        id: response.data?.invoice?.id,
        invoiceNumber: response.data?.invoice?.invoiceNumber || 'INV-' + response.data?.invoice?.id?.slice(0, 8),
        customerName: customerInfo.name || 'Walk-in Customer',
        customerPhone: customerInfo.phone || '',
        createdAt: new Date().toISOString(),
        subtotal: paymentDetails.subtotal,
        discount: paymentDetails.discount,
        tax: paymentDetails.gst,
        total: paymentDetails.total,
        paymentMode: paymentDetails.paymentMethod,
        status: 'paid',
        invoiceItems: billingItems.map(item => ({
          id: item.variantId,
          productName: item.productName,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      };
      
      // Print the invoice
      printInvoice(createdInvoice);
      
      showMessage('success', 'Invoice created and printed successfully!', {
        invoiceNumber: createdInvoice.invoiceNumber,
        customerName: customerInfo.name || 'No Customer',
        total: paymentDetails.total,
        itemsCount: billingItems.length,
        paymentMode: paymentDetails.paymentMethod
      });
      handleNewInvoice();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      showMessage('error', error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = (invoice: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showMessage('error', 'Please allow popups to print the invoice');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .store-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 18px;
            margin-bottom: 10px;
          }
          .invoice-details { 
            margin-bottom: 20px; 
            display: flex;
            justify-content: space-between;
          }
          .invoice-info, .customer-info {
            flex: 1;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
            font-size: 12px;
          }
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          .items-table th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          .totals { 
            text-align: right; 
            margin-top: 20px;
          }
          .total-line {
            margin: 5px 0;
            font-size: 14px;
          }
          .total-row { 
            font-weight: bold; 
            font-size: 16px; 
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          .print-btn:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <button class="print-btn no-print" onclick="window.print()">Print Invoice</button>
        
        <div class="header">
          <div class="store-name">CLOTHING STORE</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-info">
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(invoice.createdAt).toLocaleTimeString()}</p>
            <p><strong>Payment Mode:</strong> ${invoice.paymentMode.toUpperCase()}</p>
          </div>
          <div class="customer-info">
            <p><strong>Customer:</strong> ${invoice.customerName}</p>
            ${invoice.customerPhone ? `<p><strong>Phone:</strong> ${invoice.customerPhone}</p>` : ''}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Color</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.invoiceItems.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.size}</td>
                <td>${item.color}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice.toLocaleString()}</td>
                <td>₹${item.total.toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-line">
            <strong>Subtotal:</strong> ₹${invoice.subtotal.toLocaleString()}
          </div>
          ${invoice.discount > 0 ? `
            <div class="total-line">
              <strong>Discount:</strong> -₹${invoice.discount.toLocaleString()}
            </div>
          ` : ''}
          <div class="total-line">
            <strong>Tax (GST):</strong> ₹${invoice.tax.toLocaleString()}
          </div>
          <div class="total-line total-row">
            <strong>TOTAL:</strong> ₹${invoice.total.toLocaleString()}
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>This is a computer generated invoice</p>
        </div>

        <script>
          window.onload = function() {
            // Auto-print after a short delay
            setTimeout(function() {
              window.print();
            }, 500);
            
            // Close window after printing
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleConvertDraftToInvoice = async (draftId: string) => {
    if (!confirm('Are you sure you want to convert this draft to a final invoice? This will reduce stock and cannot be undone.')) {
      return;
    }
    
    // Find the draft details before converting
    const draftToConvert = invoiceDrafts.find(draft => draft.id === draftId);
    
    setLoading(true);
    try {
      const response = await invoiceDraftService.convertDraftToInvoice(draftId);
      console.log('Draft converted to invoice successfully:', response);
      
      showMessage('success', 'Draft converted to invoice successfully!', {
        invoiceNumber: response.data?.invoiceNumber || 'INV-' + response.data?.id?.slice(0, 8),
        customerName: draftToConvert?.customerName || 'No Customer',
        total: draftToConvert?.total || 0,
        itemsCount: draftToConvert?.items?.length || 0,
        paymentMode: draftToConvert?.paymentMode || 'Unknown'
      });
      setShowDraftsModal(false);
      getAllDrafts();
    } catch (error: any) {
      console.error('Error converting draft to invoice:', error);
      showMessage('error', error.message || 'Failed to convert draft to invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDraft = async (draftId: string) => {
    setLoading(true);
    try {
      console.log('Loading draft with ID:', draftId);
      const response = await invoiceDraftService.getInvoiceDraftById(draftId);
      console.log('Raw response from backend:', response);
      const draft = response.data;
      console.log('Loaded draft data:', draft);
      console.log('Draft keys:', Object.keys(draft));
      console.log('Full draft object:', JSON.stringify(draft, null, 2));
      console.log('Draft customer info:', {
        customerName: draft.customerName,
        customerPhone: draft.customerPhone,
        customer: draft.customer
      });
      console.log('Draft.items:', draft.items);
      console.log('Draft.InvoiceDraftItems:', draft.InvoiceDraftItems);
      console.log('Draft.invoice_draft_items:', draft.invoice_draft_items);
      console.log('Draft.InvoiceDraftItem:', draft.InvoiceDraftItem);
      
      // Load draft data - use customerName and customerPhone from the formatted response
      setCustomerInfo({
        name: draft.customerName || '',
        phone: draft.customerPhone || '',
        gst: draft.tax > 0,
        discountPercentage: draft.discount > 0 ? (draft.discount / draft.subtotal) * 100 : 0,
      });
      
      const paymentData = {
        paymentMethod: draft.paymentMode || '',
        subtotal: Number(draft.subtotal) || 0,
        discount: Number(draft.discount) || 0,
        gst: Number(draft.tax) || 0,
        total: Number(draft.total) || 0,
      };
      console.log('Setting payment details:', paymentData);
      setPaymentDetails(paymentData);

      // Load items if they exist - use the correct alias "items"
      const draftItems = draft.items || draft.InvoiceDraftItems || draft.invoice_draft_items || draft.InvoiceDraftItem || draft.invoice_draft_item || [];
      console.log('Draft items found:', draftItems);
      
      if (draftItems && draftItems.length > 0) {
        console.log('Loading draft items:', draftItems);
        
        // We need to fetch the product details for each item
        const loadedItems = await Promise.all(
          draftItems.map(async (item: any) => {
            try {
              console.log('Loading item details for variantId:', item.variantId);
              // Get product variant details
              const variantResponse = await fetch(`${API_URL}/product-variants/${item.variantId}`);
              if (variantResponse.ok) {
                const variantData = await variantResponse.json();
                console.log('Variant data for', item.variantId, ':', variantData);
                
                const billingItem = {
                  id: item.variantId,
                  productId: variantData.data.productId,
                  variantId: item.variantId,
                  productName: variantData.data.product?.name || 'Unknown Product',
                  size: variantData.data.size,
                  color: variantData.data.color,
                  quantity: Number(item.quantity) || 1,
                  unitPrice: Number(variantData.data.price) || 0,
                  total: Number(item.total) || 0,
                  barcode: variantData.data.barcode,
                  stock_qty: Number(variantData.data.stock_qty) || 0,
                };
                console.log('Created billing item:', billingItem);
                return billingItem;
              } else {
                console.error('Failed to fetch variant data for:', item.variantId);
              }
            } catch (error) {
              console.error('Error loading item details for variantId:', item.variantId, error);
            }
            return null;
          })
        );
        
        const validItems = loadedItems.filter(item => item !== null);
        console.log('Setting billing items:', validItems);
        setBillingItems(validItems);
      } else {
        console.log('No draft items found, clearing billing items');
        setBillingItems([]);
      }
      
      showMessage('success', 'Draft loaded successfully!', {
        draftNumber: draft.draftNumber || 'Draft-' + draft.id?.slice(0, 8),
        customerName: draft.customerName || 'No Customer',
        total: draft.total || 0,
        itemsCount: draftItems?.length || 0,
        paymentMode: draft.paymentMode || 'Unknown'
      });
      setShowDraftsModal(false);
    } catch (error: any) {
      console.error('Error loading draft:', error);
      showMessage('error', error.message || 'Failed to load draft');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) return;
    
    // Find the draft details before deleting
    const draftToDelete = invoiceDrafts.find(draft => draft.id === draftId);
    
    setLoading(true);
    try {
      await invoiceDraftService.deleteInvoiceDraft(draftId);
      showMessage('success', 'Draft deleted successfully!', {
        draftNumber: draftToDelete?.draftNumber || 'Draft-' + draftId?.slice(0, 8),
        customerName: draftToDelete?.customerName || 'No Customer',
        total: draftToDelete?.total || 0
      });
      getAllDrafts();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete draft');
    } finally {
      setLoading(false);
    }
  };

  const handleNewInvoice = () => {
    setBillingItems([]);
    setCustomerInfo({
      name: '',
      phone: '',
      gst: false,
      discountPercentage: 0,
    });
    setPaymentDetails({
      paymentMethod: '',
      subtotal: 0,
      discount: 0,
      gst: 0,
      total: 0,
    });
    setProduct(null);
    setSearchBarcode('');
    showMessage('success', 'New invoice created');
  };

  const addToBilling = (item: any) => {
    // Handle different data structures from barcode API vs product search
    const itemId = item.id || item.variantId;
    const productName = item.product?.name || item.productName;
    const price = Number(item.price);
    const stockQty = item.stock_qty;
    
    const existingItem = billingItems.find(
      billingItem => billingItem.variantId === itemId
    );

    if (existingItem) {
      if (existingItem.quantity < stockQty) {
        const updatedItems = billingItems.map(billingItem =>
          billingItem.variantId === itemId
            ? {
                ...billingItem,
                quantity: billingItem.quantity + 1,
                total: Number((billingItem.quantity + 1) * billingItem.unitPrice),
              }
            : billingItem
        );
        setBillingItems(updatedItems);
        showMessage('success', `${productName} quantity increased`);
      } else {
        showMessage('error', 'Cannot add more items - stock limit reached');
      }
    } else {
      const newItem: BillingItem = {
        id: itemId,
        productId: item.productId,
        variantId: itemId,
        productName: productName,
        size: item.size,
        color: item.color,
        quantity: 1,
        unitPrice: price,
        total: price,
        barcode: item.barcode,
        stock_qty: stockQty,
      };
      setBillingItems(prev => [...prev, newItem]);
      showMessage('success', `${productName} added to billing`);
    }
  };

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    const item = billingItems.find(item => item.variantId === variantId);
    if (!item) return;

    if (newQuantity <= 0) {
      setBillingItems(prev => prev.filter(item => item.variantId !== variantId));
      showMessage('info', 'Item removed from billing');
    } else if (newQuantity <= item.stock_qty) {
      const updatedItems = billingItems.map(billingItem =>
        billingItem.variantId === variantId
          ? {
              ...billingItem,
              quantity: newQuantity,
              total: Number(newQuantity * billingItem.unitPrice),
            }
          : billingItem
      );
      setBillingItems(updatedItems);
    } else {
      showMessage('error', 'Cannot exceed available stock');
    }
  };

  const handleRemoveItem = (variantId: string) => {
    setBillingItems(prev => prev.filter(item => item.variantId !== variantId));
    showMessage('info', 'Item removed from billing');
  };

  const handleSearchBarcode = async () => {
    if (!searchBarcode.trim()) {
      showMessage('error', 'Please enter a barcode');
      return;
    }

    setLoading(true);
    try {
      const response = await invoiceService.getItemByBarcode(searchBarcode);
      setProduct(response);
      // Automatically add to billing when barcode is scanned
      addToBilling(response);
      setSearchBarcode(''); // Clear the barcode input
      showMessage('success', 'Product found and added to billing!');
    } catch (error: any) {
      showMessage('error', error.message || 'Product not found');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchBarcode();
    }
  };

  const getAllProducts = async () => {
    try {
      const response = await ProductService.getAllVariants();
      setAllProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getAllCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`);
      const result = await response.json();
      setAllCustomers(result.data || []);
      console.log(result.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setAllCustomers([]); // Set empty array on error
    }
  };

  const handleCustomerSearch = (e: any) => {
    setCustomerSearch(e.target.value);
    if(e.target.value.length > 0){
      setCustomerToggle(true)
    }else{
      setCustomerToggle(false)
    }
  }

  const handleCustomerSelect = (customer: any) => {
    setCustomerInfo(prev => ({
      ...prev,
      name: customer.name,
      phone: customer.phone,
    }));
    setCustomerSearch(customer.name);
    setCustomerToggle(false);
    showMessage('success', `Customer ${customer.name} selected`);
  };
  
  const filterProducts = allProducts.filter((item: any) => {
    return (
      item.product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.size.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.color.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.product.category.name
        .toLowerCase()
        .includes(searchProduct.toLowerCase()) ||
      item.product.brand.name
        .toLowerCase()
        .includes(searchProduct.toLowerCase())
    );
  });

  useEffect(() => {
    getAllProducts();
    getAllCustomers();
    getAllDrafts();
  }, []);

  return (
    <div className="dashboard">
      {/* Message Display */}
      {message && (
        <Toast
          type={message.type}
          text={message.text}
          details={message.details}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Drafts Modal */}
      {showDraftsModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">
                Invoice Drafts ({invoiceDrafts.length})
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowDraftsModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              {invoiceDrafts.length > 0 ? (
                invoiceDrafts.map((draft) => (
                  <div 
                    key={draft.id} 
                    className="draft-card"
                  >
                    <div className="draft-card-header">
                      <div>
                        <h3 className="draft-card-title">
                          {draft.draftNumber || 'Draft-' + draft.id?.slice(0, 8)}
                        </h3>
                        <p className="draft-card-meta">
                          {draft.customerName || 'No Customer'} • {draft.customerPhone || 'No Phone'}
                        </p>
                        <p className="draft-card-date">
                          {draft.createdAt ? format(new Date(draft.createdAt), 'MMM dd, yyyy HH:mm') : 'Unknown Date'}
                        </p>
                      </div>
                      <div className="draft-card-amount-container">
                        <p className="draft-card-amount">
                          ₹{(Number(draft.total) || 0).toFixed(2)}
                        </p>
                        <p className="draft-card-payment">
                          {draft.paymentMode || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="draft-card-actions">
                      <button 
                        className="draft-btn load"
                        onClick={() => handleLoadDraft(draft.id)}
                        disabled={loading}
                      >
                        <RotateCcw size={14} />
                        Load
                      </button>
                      <button 
                        className="draft-btn convert"
                        onClick={() => handleConvertDraftToInvoice(draft.id)}
                        disabled={loading}
                      >
                        <Printer size={14} />
                        Convert to Invoice
                      </button>
                      <button 
                        className="draft-btn delete"
                        onClick={() => handleDeleteDraft(draft.id)}
                        disabled={loading}
                      >
                        <Trash size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="modal-empty-state">
                  <FileText size={48} className="modal-empty-icon" />
                  <p className="modal-empty-title">No drafts available</p>
                  <p className="modal-empty-subtitle">Save your first invoice as a draft</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>
            Welcome back! Here's what's happening with your inventory today.
          </p>
        </div>
        <div className="current-time">
          <div className="time-display">
            {format(currentTime, "EEEE, MMMM d, yyyy")}
          </div>
          <div className="time-display time-large">
            {format(currentTime, "HH:mm:ss")}
          </div>
        </div>
      </div>

      <div className="search-barcode">
        <div className="search">
          <input
            type="text"
            placeholder="Search Barcode"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="barcode-input"
          />
          <button 
            className="btn-barcode-search" 
            onClick={handleSearchBarcode}
            disabled={loading}
          >
            <Scan size={18} />
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        <div className="draft-invoice">
          <button 
            onClick={handleNewInvoice}
            className="btn-new-invoice"
          >
            <Plus size={20} /> New Invoice
          </button>
          <button 
            onClick={handleDraftsButtonClick}
            className="btn-drafts"
          >
            <FileText size={20} /> Drafts ({invoiceDrafts.length})
          </button>
        </div>
      </div>

      <div className="main-dashboard-container">
        <div className="left">
          <h2>Product Search</h2>
          <div className="search-product">
            <input
              type="text"
              placeholder="Search Product"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="product-search-input"
            />
          </div>
          <div className="products-card">
          {filterProducts.map((item: any) => (
            <div className="product-card" key={item.id}>
              <Shirt size={20} />
              <h3>{item.product.name}</h3>
              <p>
                {item.size} - {item.color}
              </p>
              <p>₹{item.price}</p>
              <p>Stock: {item.stock_qty}</p>
              <code>Barcode: {item.barcode}</code>
              <button 
                onClick={() => addToBilling(item)}
                disabled={item.stock_qty <= 0}
                className={`btn-add-billing ${item.stock_qty <= 0 ? 'disabled' : ''}`}
              >
                {item.stock_qty > 0 ? 'Add To Billing' : 'Out of Stock'}
              </button>
            </div>
          ))}
          </div>
        </div>

        <div className="right">
          <div className="head">
            <h2>Current Invoice</h2>
            <p>{billingItems.length} items Total: ₹{(Number(paymentDetails.total) || 0).toFixed(2)}</p>
          </div>
          <div className="invoice-items">
            {billingItems.length > 0 ? (
              billingItems.map((item) => (
                <div className="invoice-item" key={item.variantId}>
                  <ShoppingBag size={20} />
                  <div className="invoice-item-info">
                    <h5>{item.productName}</h5>
                    <p>{item.size} - {item.color}</p>
                    <p>₹{item.unitPrice}</p>
                  </div>
                  <div className="invoice-item-actions">
                    <button 
                      onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className={`btn-quantity btn-decrease ${item.quantity <= 1 ? 'disabled' : ''}`}
                    >
                      <Minus size={10} />
                    </button>
                    <p>{item.quantity}</p>
                    <button 
                      onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_qty}
                      className={`btn-quantity btn-increase ${item.quantity >= item.stock_qty ? 'disabled' : ''}`}
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <div className="total-price">
                    <p>₹{(Number(item.total) || 0).toFixed(2)}</p>
                  </div>
                  <Trash 
                    className="trash-icon" 
                    size={23} 
                    onClick={() => handleRemoveItem(item.variantId)}
                  />
                </div>
              ))
            ) : (
              <div className="empty-billing">
                No items in billing
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="payment-section">
        <div className="customer-info">
          <div className="head">
            <h2>Customer Info</h2>
            <button className="btn-add-customer">
              <Plus size={15} />
              <p>Add Customer</p>
            </button>
          </div>
          <div className="search-customer">
            <input 
              type="text" 
              placeholder="Search Customer" 
              value={customerSearch} 
              onChange={handleCustomerSearch}
              className="customer-search-input"
            />
            <div className={`exist-customers ${customerToggle ? 'active' : ''}`}>
              {allCustomers?.filter((customer: any) => {
                return customer?.name?.toLowerCase().includes(customerSearch.toLowerCase()) || customer?.phone?.toLowerCase().includes(customerSearch.toLowerCase())
              }).map((customer: any) => (
                <div 
                  className="customer-info-item" 
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <p>{customer.name}</p>
                  <p>{customer.phone}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="customer-details">
            <input 
              type="text" 
              placeholder="Customer Name" 
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="customer-input"
            />
            <input 
              type="text" 
              placeholder="Phone Number" 
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="customer-input"
            />
            <div className={`gst-toggle ${customerInfo.gst ? 'active' : ''}`}>
              <div 
                className="toggle-switch"
                onClick={() => setCustomerInfo(prev => ({ ...prev, gst: !prev.gst }))}
              >
                <div className="toggle-slider" />
              </div>
              <div className="gst-label">
                <p>GST (18%)</p>
                {customerInfo.gst && (
                  <span className="gst-badge">Active</span>
                )}
              </div>
            </div>
            <div className="discount-input-container">
              <input 
                type="number" 
                placeholder="Discount Percentage (%)" 
                value={customerInfo.discountPercentage === 0 ? '' : customerInfo.discountPercentage}
                onChange={(e) => setCustomerInfo(prev => ({ 
                  ...prev, 
                  discountPercentage: parseFloat(e.target.value) || 0 
                }))}
                min="0"
                max="100"
                className={`discount-input ${customerInfo.discountPercentage > 0 ? 'has-discount' : ''}`}
              />
              <div className="discount-suffix">
                {customerInfo.discountPercentage > 0 && (
                  <span className="discount-badge">
                    {customerInfo.discountPercentage}%
                  </span>
                )}
                <span className="percent-symbol">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-details">
          <h2>Payment Summary</h2>
          <div className="amount-details">
            <div className="items">
              <p>Items</p>
              <p>{billingItems.length}</p>
            </div>
            <div className="sub-total">
              <p>Sub Total</p>
              <p>₹{(Number(paymentDetails.subtotal) || 0).toFixed(2)}</p>
            </div>
            <div className="discount">
              <p>Discount</p>
              <p>₹{(Number(paymentDetails.discount) || 0).toFixed(2)}</p>
            </div>
            <div className="gst">
              <p>GST</p>
              <p>₹{(Number(paymentDetails.gst) || 0).toFixed(2)}</p>
            </div>
            <div className="total">
              <p>Total</p>
              <p>₹{(Number(paymentDetails.total) || 0).toFixed(2)}</p>
            </div>
            <select 
              value={paymentDetails.paymentMethod}
              onChange={(e) => setPaymentDetails(prev => ({ 
                ...prev, 
                paymentMethod: e.target.value 
              }))}
              className="payment-method-select"
            >
              <option value="" disabled>Select Payment Method</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div className="buttons">
            <button 
              onClick={handleSaveDraft}
              disabled={loading || billingItems.length === 0}
              className={`btn-save-draft ${loading || billingItems.length === 0 ? 'disabled' : ''}`}
            >
              <Save size={20} /> Save As Draft
            </button>
            <button 
              onClick={handlePrintAndSave}
              disabled={loading || billingItems.length === 0}
              className={`btn-print-save ${loading || billingItems.length === 0 ? 'disabled' : ''}`}
            >
              <Printer size={20} /> Save & Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
