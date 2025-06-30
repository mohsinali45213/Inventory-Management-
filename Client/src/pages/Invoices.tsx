import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Printer,
  FileText,
  Trash2,
} from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Alert from "../components/common/Alert";
import { Invoice, InvoiceItem } from "../types";
import invoiceService from "../functions/invoice";

const Invoices: React.FC = () => {
  const [getInvoices, setGetAllInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const getAllInvoices = async () => {
    try {
      const invoices: any = await invoiceService.getAllInvoices();
      setGetAllInvoices(invoices || []);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch invoices." });
      setGetAllInvoices([]);
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const invoice = await invoiceService.getInvoiceById(invoiceId);

      const fullInvoice = {
        ...invoice,
        items: invoice.invoiceItems || invoice.invoiceItems || [],
      };

      setSelectedInvoice(fullInvoice);
      setIsViewModalOpen(true);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to load invoice details." });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await invoiceService.deleteInvoice(invoiceId);
      setAlert({ type: "success", message: "Invoice deleted successfully." });
      getAllInvoices();
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to delete invoice." });
    }
  };

  const handleDeleteMultipleInvoices = async () => {
    try {
      const deletePromises = selectedInvoices.map(id => invoiceService.deleteInvoice(id));
      await Promise.all(deletePromises);
      setAlert({ type: "success", message: `${selectedInvoices.length} invoice(s) deleted successfully.` });
      setSelectedInvoices([]);
      setIsSelectAll(false);
      getAllInvoices();
      setIsDeleteModalOpen(false);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to delete some invoices." });
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedInvoices([]);
      setIsSelectAll(false);
    } else {
      const allIds = filteredInvoices.map(invoice => invoice.id).filter(Boolean) as string[];
      setSelectedInvoices(allIds);
      setIsSelectAll(true);
    }
  };

  useEffect(() => {
    getAllInvoices();
  }, []);

  const filteredInvoices = getInvoices.filter((invoice) => {
    const matchesSearch =
      (invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (invoice.paymentMode?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" &&
        invoiceDate.toDateString() === today.toDateString()) ||
      (dateFilter === "week" && invoiceDate >= weekAgo) ||
      (dateFilter === "month" && invoiceDate >= monthAgo);

    return matchesSearch && matchesDate;
  });

  const handlePrintInvoice = (invoice: Invoice) => {
    try {
      const printWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
      if (!printWindow) {
        setAlert({ type: "error", message: "Popup blocked. Please allow popups for this site and try again." });
        return;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { text-align: right; }
            .total-row { font-weight: bold; font-size: 1.1em; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CLOTHING STORE</h1>
            <h2>INVOICE</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoice.createdAt ? new Date(
              invoice.createdAt
            ).toLocaleDateString() : 'N/A'}</p>
            ${
              invoice.customerName
                ? `<p><strong>Customer:</strong> ${invoice.customerName}</p>`
                : ""
            }
            <p><strong>Payment Mode:</strong> ${invoice.paymentMode?.toUpperCase() || 'N/A'}</p>
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
              ${invoice.invoiceItems?.map(item => `
                <tr>
                  <td>${item.variant?.product?.name || 'N/A'}</td>
                  <td>${item.variant?.size || item.size || 'N/A'}</td>
                  <td>${item.variant?.color || item.color || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>₹${(item.variant?.price || item.unitPrice || 0).toLocaleString()}</td>
                  <td>₹${(item.total || 0).toLocaleString()}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal: ₹${invoice.subtotal?.toLocaleString() || '0'}</span>
            </div>
            ${invoice.discount > 0 ? `
              <div class="total-row">
                <span>Discount: -₹${invoice.discount.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Tax: ₹${invoice.tax?.toLocaleString() || '0'}</span>
            </div>
            <div class="total-row">
              <span>Total: ₹${invoice.total?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (error) {
      setAlert({ type: "error", message: "Failed to print invoice" });
    }
  };


  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <FileText className="page-icon" />
          <div>
            <h1>Invoices</h1>
            <p>Manage sales invoices and billing</p>
          </div>
        </div>
        {selectedInvoices.length > 0 && (
          <Button 
            variant="danger" 
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 size={16} />
            Delete Selected ({selectedInvoices.length})
          </Button>
        )}
      </div>

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="filters-section">
          <div className="search-filter">
            <div className="search-input-container">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <Button
                variant={dateFilter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setDateFilter("all")}
              >
                All Time
              </Button>
              <Button
                variant={dateFilter === "today" ? "primary" : "outline"}
                size="sm"
                onClick={() => setDateFilter("today")}
              >
                Today
              </Button>
              <Button
                variant={dateFilter === "week" ? "primary" : "outline"}
                size="sm"
                onClick={() => setDateFilter("week")}
              >
                This Week
              </Button>
              <Button
                variant={dateFilter === "month" ? "primary" : "outline"}
                size="sm"
                onClick={() => setDateFilter("month")}
              >
                This Month
              </Button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={handleSelectAll}
                    className="select-checkbox"
                  />
                </th>
                <th>Invoice Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id || '')}
                      onChange={() => handleSelectInvoice(invoice.id || '')}
                      className="select-checkbox"
                    />
                  </td>
                  <td>
                    <span className="invoice-number">
                      {invoice.invoiceNumber}
                    </span>
                  </td>
                  <td>
                    <span className="customer-name">
                      {invoice.customer?.name ? 
                        invoice.customer?.name.charAt(0).toUpperCase() + invoice.customer?.name.slice(1) 
                        : "Walk-in Customer"}
                    </span>
                  </td>
                  <td>
                    <span className="invoice-date">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="items-count">
                      {invoice.invoiceItems.length}
                    </span>
                  </td>
                  <td>
                    <span className="total-amount">
                      ₹{invoice.total.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`payment-mode payment-mode-${invoice.paymentMode}`}
                    >
                      {invoice.paymentMode?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${invoice.status}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn action-btn-view"
                        onClick={() => {
                          if (invoice.id) {
                            handleViewInvoice(invoice.id);
                            setIsViewModalOpen(true);
                          }
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn action-btn-print"
                        onClick={() => handlePrintInvoice(invoice)}
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        className="action-btn action-btn-delete"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInvoice(null);
        }}
        title={selectedInvoice ? "Delete Invoice" : "Delete Multiple Invoices"}
        size="md"
      >
        <div className="delete-confirmation">
          {selectedInvoice ? (
            <p>Are you sure you want to delete invoice <strong>{selectedInvoice.invoiceNumber}</strong>? This action cannot be undone.</p>
          ) : (
            <p>Are you sure you want to delete <strong>{selectedInvoices.length}</strong> selected invoice(s)? This action cannot be undone.</p>
          )}
          
          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedInvoice(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedInvoice) {
                  handleDeleteInvoice(selectedInvoice.id || '');
                } else {
                  handleDeleteMultipleInvoices();
                }
              }}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        title={`Invoice ${selectedInvoice?.invoiceNumber}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="invoice-view">
            <div className="invoice-header">
              <div className="invoice-info">
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {selectedInvoice.customer?.name ? 
                    selectedInvoice.customer?.name.charAt(0).toUpperCase() + selectedInvoice.customer?.name.slice(1) 
                    : "Walk-in Customer"}
                </p>
                <p>
                  <strong>Payment Mode:</strong>{" "}
                  {selectedInvoice.paymentMode?.toUpperCase() || 'N/A'}
                </p>
                <p>
                  <strong>Status:</strong> {selectedInvoice.status}
                </p>
              </div>
            </div>

            <div className="invoice-items">
              <h4>Items</h4>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice?.invoiceItems?.length > 0 ? (
                    selectedInvoice.invoiceItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.variant?.product?.name}</td>
                        <td>{item.variant?.size || item.size}</td>
                        <td>{item.variant?.color || item.color}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.variant?.price || item.unitPrice || 0).toLocaleString()}</td>
                        <td>₹{(item.total ?? 0).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>No items in this invoice.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="invoice-totals">
              <div className="totals-summary">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="total-line">
                    <span>Discount:</span>
                    <span>-₹{selectedInvoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="total-line">
                  <span>Tax:</span>
                  <span>₹{selectedInvoice.tax.toLocaleString()}</span>
                </div>
                <div className="total-line total-final">
                  <span>Total:</span>
                  <span>₹{selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                variant="outline"
                onClick={() => handlePrintInvoice(selectedInvoice)}
              >
                <Printer size={16} />
                Print Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
