import InvoiceItem from "../models/invoiceItem.models.js";
import ProductVariant from "../models/productVariant.models.js";
import Invoice from "../models/invoice.models.js";
import sequelize from "../db/db.js";

// ➕ CREATE invoice item
export const createInvoiceItem = async (req, res) => {
  try {
    const { invoiceId, variantId, quantity } = req.body;

    if (!invoiceId || !variantId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "invoiceId, variantId, and valid quantity are required.",
      });
    }

    // Fetch product variant to get price
    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found.",
      });
    }

    const price = parseFloat(variant.price); // Ensure it's a float
    const total = price * quantity;

    const newItem = await InvoiceItem.create({
      invoiceId,
      variantId,
      quantity,
      total,
    });

    res.status(201).json({
      success: true,
      message: "Invoice item created successfully.",
      data: newItem,
    });
  } catch (error) {
    console.error("Error creating invoice item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getAllInvoiceItems = async (req, res) => {
  try {
    const items = await InvoiceItem.findAll({
      include: [
        {
          model: ProductVariant,
          as: "variant",
        },
        {
          model: Invoice,
          as: "invoice",
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "All invoice items fetched successfully.",
      data: items,
    });
  } catch (error) {
    console.error("Error fetching invoice items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getInvoiceItemsByInvoiceId = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const items = await InvoiceItem.findAll({
      where: { invoiceId },
      include: [{ 
        model: ProductVariant,
        as: "variant",
      }],
    });

    res.status(200).json({
      success: true,
      message: `Items for invoice ${invoiceId} fetched successfully.`,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching items by invoice ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const deleteInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await InvoiceItem.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Invoice item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice item deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting invoice item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
