import React, { useEffect, useState } from "react";
import {
  // Plus,
  Search,
  // Filter,
  Eye,
  Printer,
  FileText,
  // Calendar,
} from "lucide-react";
// import { useInventory } from "../context/InventoryContext";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
// import Input from "../components/common/Input";
import Alert from "../components/common/Alert";
import { Invoice, InvoiceItem } from "../types";
import invoiceService from "../functions/invoice";
// import { API_URL } from "../config/config";
// import Categories from "./Categories";

const Invoices: React.FC = () => {
  // const { state, dispatch } = useInventory();
  const [getInvoices, setGetAllInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Alert state for timeInterval
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const getAllInvoices = async () => {
    try {
      const invoices: any = await invoiceService.getAllInvoices();
      setGetAllInvoices(invoices.data);
      // console.log("invoices fetched successfully:", invoices);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch invoices." });
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const invoice = await invoiceService.getInvoiceById(invoiceId);

      const fullInvoice = {
        ...invoice,
        items: invoice.invoiceItems || invoice.invoiceItems || [], // for safety
      };

      setSelectedInvoice(fullInvoice);
      // console.log("Selected Invoice:", fullInvoice);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Invoice Fetch Error:", error);
      setAlert({ type: "error", message: "Failed to load invoice details." });
    }
  };

  useEffect(() => {
    getAllInvoices();
  }, []);

  const filteredInvoices = getInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.paymentMode.toLowerCase().includes(searchTerm.toLowerCase());

    const invoiceDate = new Date(invoice.createdAt);
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
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

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
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CLOTHING STORE</h1>
          <h2>INVOICE</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(
            invoice.createdAt
          ).toLocaleDateString()}</p>
          ${
            invoice.customerName
              ? `<p><strong>Customer:</strong> ${invoice.customerName}</p>`
              : ""
          }
          <p><strong>Payment Mode:</strong> ${invoice.paymentMode.toUpperCase()}</p>
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
            ${invoice.invoiceItems
              .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.size}</td>
                <td>${item.color}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice.toLocaleString()}</td>
                <td>₹${item.total.toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <p>Subtotal: ₹${invoice.subtotal.toLocaleString()}</p>
          ${
            invoice.discount > 0
              ? `<p>Discount: -₹${invoice.discount.toLocaleString()}</p>`
              : ""
          }
          <p>Tax: ₹${invoice.tax.toLocaleString()}</p>
          <p class="total-row">Total: ₹${invoice.total.toLocaleString()}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
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
        {/* <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          Create Invoice
        </Button> */}
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
                    <span className="invoice-number">
                      {invoice.invoiceNumber}
                      {/* {console.log("Invoice Number:", invoice.invoiceNumber)} */}
                    </span>
                  </td>
                  <td>
                    <span className="customer-name">
                      {invoice.customer?.name.charAt(0).toUpperCase() + invoice.customer?.name.slice(1) || "Walk-in Customer"}
                    </span>
                  </td>
                  <td>
                    <span className="invoice-date">
                      {new Date(invoice.createdAt).toLocaleDateString()}
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
                      {invoice.paymentMode.toUpperCase()}
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
                          // setSelectedInvoice(invoice);
                          handleViewInvoice(invoice.id);
                          setIsViewModalOpen(true);
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
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
                  {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {selectedInvoice.customer?.name.charAt(0).toUpperCase() + selectedInvoice.customer?.name.slice(1) || "Walk-in Customer"}
                </p>
                <p>
                  <strong>Payment Mode:</strong>{" "}
                  {selectedInvoice.paymentMode.toUpperCase()}
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
                        <td>{item.productName}</td>
                        <td>{item.variant.size}</td>
                        <td>{item.variant.color}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.variant.price ?? 0).toLocaleString()}</td>

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
