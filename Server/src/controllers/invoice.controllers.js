import Invoice from "../models/invoice.models.js";
import Customer from "../models/customers.models.js";

// ✅ Create Invoice
export const createInvoice = async (req, res) => {
  try {
    const { customerId, totalAmount, status } = req.body;

    // Basic validation
    if (!customerId || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and total amount are required.",
      });
    }

    // Check if the customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const newInvoice = await Invoice.create({
      customerId,
      totalAmount,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      data: newInvoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create invoice.",
      error: error.message,
    });
  }
};

// ✅ Get All Invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll();

    res.status(200).json({
      success: true,
      message: "Invoices fetched successfully.",
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices.",
      error: error.message,
    });
  }
};

// ✅ Get Invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice fetched successfully.",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice.",
      error: error.message,
    });
  }
};

// ✅ Update Invoice
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, totalAmount, status } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    // Optional: validate customerId again
    if (customerId && customerId !== invoice.customerId) {
      const customerExists = await Customer.findByPk(customerId);
      if (!customerExists) {
        return res.status(404).json({
          success: false,
          message: "New customer not found.",
        });
      }
    }

    await invoice.update({
      customerId: customerId ?? invoice.customerId,
      totalAmount: totalAmount ?? invoice.totalAmount,
      status: status ?? invoice.status,
    });

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully.",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice.",
      error: error.message,
    });
  }
};

// ✅ Delete Invoice
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    await invoice.destroy();

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice.",
      error: error.message,
    });
  }
};
