import InvoiceDraftItem from "../models/Invoice_draft_item.models.js";
import InvoiceDraft from "../models/invoice_draft.models.js";
import ProductVariant from "../models/productVariant.models.js";
import Product from "../models/products.models.js";

// ✅ Create Draft Item
export const createInvoiceDraftItem = async (req, res) => {
  try {
    const { draftId, variantId, quantity } = req.body;

    if (!draftId || !variantId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "All fields (draftId, variantId, quantity) are required.",
      });
    }

    const draft = await InvoiceDraft.findByPk(draftId);
    const variant = await ProductVariant.findByPk(variantId, {
      include: [{ model: Product, as: "product" }],
    });

    if (!draft || !variant) {
      return res.status(404).json({
        success: false,
        message: "Draft or Variant not found.",
      });
    }

    const unitPrice = parseFloat(variant.price); // Get price from variant
    const total = parseFloat((quantity * unitPrice).toFixed(2));

    const item = await InvoiceDraftItem.create({
      draftId,
      variantId,
      quantity,
      unitPrice,
      total,
    });

    res.status(201).json({
      success: true,
      message: "Draft item created successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create draft item.",
      error: error.message,
    });
  }
};

// ✅ Get All Draft Items
export const getAllInvoiceDraftItems = async (req, res) => {
  try {
    const items = await InvoiceDraftItem.findAll({
      include: [
        {
          model: ProductVariant,
          as: "variant",
          include: [{ model: Product, as: "product" }],
        },
        {
          model: InvoiceDraft,
          as: "draft",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Draft items fetched successfully.",
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch draft items.",
      error: error.message,
    });
  }
};

// ✅ Get Draft Item by ID
export const getInvoiceDraftItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InvoiceDraftItem.findByPk(id, {
      include: [
        {
          model: ProductVariant,
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Draft item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Draft item fetched successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch draft item.",
      error: error.message,
    });
  }
};

// ✅ Update Draft Item
export const updateInvoiceDraftItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = await InvoiceDraftItem.findByPk(id, {
      include: [{ 
        model: ProductVariant,
        as: "variant",
      }],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Draft item not found.",
      });
    }

    const newQty = quantity ?? item.quantity;
    const unitPrice = parseFloat(item.unitPrice);
    const total = parseFloat((newQty * unitPrice).toFixed(2));

    await item.update({
      quantity: newQty,
      total,
    });

    res.status(200).json({
      success: true,
      message: "Draft item updated successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update draft item.",
      error: error.message,
    });
  }
};

// ✅ Delete Draft Item
export const deleteInvoiceDraftItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InvoiceDraftItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Draft item not found.",
      });
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      message: "Draft item deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete draft item.",
      error: error.message,
    });
  }
};
