// 📦 Imports
import { Op } from "sequelize";
import Sequelize from "../db/db.js";
// import Invoice from "../models/invoice.models.js";
// import InvoiceItem from "../models/invoiceItem.models.js";
import Customer from "../models/customers.models.js";
// import ProductVariant from "../models/productVariant.models.js";
  
import models from "../models/index.js"; // ✅ central file
const { Invoice, InvoiceItem, ProductVariant,Product } = models;

// 🔢 Utility: Generate unique invoice number like INV-YYYYMMDD-001
const generateInvoiceNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().split("T")[0].replace(/-/g, "");
  const countToday = await Invoice.count({
    where: {
      createdAt: {
        [Op.gte]: new Date(today.setHours(0, 0, 0, 0)),
      },
    },
  });
  const serial = String(countToday + 1).padStart(3, "0");
  return `INV-${datePart}-${serial}`;
};

// ✅ Create Invoice with Items (Handles new and existing customers)
export const createInvoiceWithItems = async (req, res) => {
  const transaction = await Sequelize.transaction();
  try {
    const {
      customerId,
      customer,
      subtotal,
      discount,
      tax,
      total,
      paymentMode,
      status,
      items,
    } = req.body;

    if (!subtotal || !discount || !tax || !total || !paymentMode || !items?.length) {
      return res.status(400).json({
        success: false,
        message: "All billing fields, payment mode, and items are required.",
      });
    }

    let finalCustomerId = null;

    if (customerId) {
      const existingCustomer = await Customer.findByPk(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }
      finalCustomerId = customerId;
    } else if (customer) {
      const { name, phone } = customer;

      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          message: "Customer name and phone are required for new customers.",
        });
      }

      const newCustomer = await Customer.create({ name, phone }, { transaction });
      finalCustomerId = newCustomer.id;
    }

    const invoiceNumber = await generateInvoiceNumber();

    const newInvoice = await Invoice.create({
      invoiceNumber,
      customerId: finalCustomerId,
      subtotal,
      discount,
      tax,
      total,
      paymentMode: paymentMode.toLowerCase(),
      status: status?.toLowerCase() || "pending",
    }, { transaction });

    const itemRows = items.map(item => ({
      invoiceId: newInvoice.id,
      variantId: item.variantId,
      quantity: item.quantity,
      total: item.total
    }));

    await InvoiceItem.bulkCreate(itemRows, { transaction });
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Invoice with items created successfully.",
      data: { invoice: newInvoice, items: itemRows },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to create invoice with items.",
      error: error.message,
    });
  }
};

// ✅ Get All Invoices
// export const getAllInvoices = async (req, res) => {
//   try {
//     const invoices = await Invoice.findAll({
//       order: [["createdAt", "DESC"]],
//     });

//     res.status(200).json({
//       success: true,
//       message: "Invoices fetched successfully.",
//       data: invoices,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch invoices.",
//       error: error.message,
//     });
//   }
// };

export const getAllInvoicesWithItems = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: InvoiceItem,
          as: "invoiceItems", // ✅ alias must match association
          include: [
            {
              model: ProductVariant,
              as: "variant", // ✅ alias must match association
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Invoices with items fetched successfully.",
      data: invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices with items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


// ✅ Get Invoice by ID
// export const getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const invoice = await Invoice.findByPk(id);
//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found.",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Invoice fetched successfully.",
//       data: invoice,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch invoice.",
//       error: error.message,
//     });
//   }
// };


// import { Invoice, InvoiceItem, Product, Variant } from "../models"; // adjust path as needed

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: InvoiceItem,
          as: "invoiceItems", // ✅ must match your association alias
          include: [
            {
              model: ProductVariant,
              as: "variant", // ✅ alias as defined in your Sequelize associations
            },
          ],
        },
      ],
    });

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
    console.error("Error fetching invoice by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice.",
      error: error.message,
    });
  }
};





// GET /api/barcode/:code
export const getItemByBarcode = async (req, res) => {
  try {
    const { code } = req.params;

    const variant = await ProductVariant.findOne({
      where: { barcode: code },
      include: [{ model: Product, as: "product" }],
    });

    if (!variant) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    res.json({
      success: true,
      message: "Item found",
      data: {
        productId: variant.productId,
        productName: variant.product.name,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock_qty: variant.stock_qty,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error", error: error.message });
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
