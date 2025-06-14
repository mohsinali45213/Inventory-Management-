import InvoiceItem from "../models/invoiceItem.models.js";
import Invoice from "../models/invoice.models.js";
import Variant from "../models/productVariant.models.js"; // Ensure this model exists

// ✅ Create Invoice Item
export const createInvoiceItem = async (req, res) => {
  try {
    const { invoiceId, variantId, quantity, unitPrice } = req.body;

    // Validation
    if (!invoiceId || !variantId || !quantity || !unitPrice) {
      return res.status(400).json({
        success: false,
        message: "All fields (invoiceId, variantId, quantity, unitPrice) are required.",
      });
    }

    const invoice = await Invoice.findByPk(invoiceId);
    const variant = await Variant.findByPk(variantId);

    if (!invoice || !variant) {
      return res.status(404).json({
        success: false,
        message: "Invoice or Variant not found.",
      });
    }

    const totalPrice = (quantity * unitPrice).toFixed(2);

    const item = await InvoiceItem.create({
      invoiceId,
      variantId,
      quantity,
      unitPrice,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Invoice item created successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create invoice item.",
      error: error.message,
    });
  }
};

// ✅ Get All Invoice Items
export const getAllInvoiceItems = async (req, res) => {
  try {
    const items = await InvoiceItem.findAll();

    res.status(200).json({
      success: true,
      message: "Invoice items fetched successfully.",
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice items.",
      error: error.message,
    });
  }
};

// ✅ Get Invoice Item by ID
export const getInvoiceItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InvoiceItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Invoice item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice item fetched successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice item.",
      error: error.message,
    });
  }
};

// ✅ Update Invoice Item
export const updateInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, unitPrice } = req.body;

    const item = await InvoiceItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Invoice item not found.",
      });
    }

    const updatedQuantity = quantity ?? item.quantity;
    const updatedUnitPrice = unitPrice ?? item.unitPrice;
    const updatedTotalPrice = (updatedQuantity * updatedUnitPrice).toFixed(2);

    await item.update({
      quantity: updatedQuantity,
      unitPrice: updatedUnitPrice,
      totalPrice: updatedTotalPrice,
    });

    res.status(200).json({
      success: true,
      message: "Invoice item updated successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice item.",
      error: error.message,
    });
  }
};

// ✅ Delete Invoice Item
export const deleteInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InvoiceItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Invoice item not found.",
      });
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      message: "Invoice item deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice item.",
      error: error.message,
    });
  }
};
