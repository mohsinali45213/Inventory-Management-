// 📦 Imports
import { Op } from "sequelize";
import Sequelize from "../db/db.js";
// import Invoice from "../models/invoice.models.js";
// import InvoiceItem from "../models/invoiceItem.models.js";
import Customer from "../models/customers.models.js";
import InvoiceDraft from "../models/invoice_draft.models.js";
import InvoiceDraftItem from "../models/Invoice_draft_item.models.js";
// import ProductVariant from "../models/productVariant.models.js";
  
import models from "../models/index.js"; // ✅ central file
const { Invoice, InvoiceItem, ProductVariant,Product } = models;

// 🔢 Utility: Generate unique invoice number like INV-YYYYMMDD-001
const generateInvoiceNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().split("T")[0].replace(/-/g, "");
  
  // Get count of invoices created today
  const countToday = await Invoice.count({
    where: {
      createdAt: {
        [Op.gte]: new Date(today.setHours(0, 0, 0, 0)),
      },
    },
  });
  
  const serial = String(countToday + 1).padStart(3, "0");
  const invoiceNumber = `INV-${datePart}-${serial}`;
  
  // Check if this invoice number already exists (race condition protection)
  const existingInvoice = await Invoice.findOne({
    where: { invoiceNumber }
  });
  
  if (existingInvoice) {
    // If exists, try with a higher serial number
    const maxSerial = await Invoice.max('invoiceNumber', {
      where: {
        invoiceNumber: {
          [Op.like]: `INV-${datePart}-%`
        }
      }
    });
    
    if (maxSerial) {
      const lastSerial = parseInt(maxSerial.split('-')[2]);
      const newSerial = String(lastSerial + 1).padStart(3, "0");
      return `INV-${datePart}-${newSerial}`;
    }
  }
  
  return invoiceNumber;
};

// ✅ Create Invoice with Items (Handles new and existing customers)
export const createInvoiceWithItems = async (req, res) => {
  const transaction = await Sequelize.transaction();
  
  try {
    // console.log("Received invoice data:", req.body);
    
    const {
      customerName,
      customerPhone,
      subtotal,
      discount,
      tax,
      total,
      paymentMode,
      status,
      items,
    } = req.body;

    // 🔍 Customer handling
    let customerId = null;
    if (customerName && customerPhone) {
      // console.log("Customer creation check:", {
      //   hasCustomerName: !!customerName,
      //   hasCustomerPhone: !!customerPhone,
      //   customerNameLength: customerName.length,
      //   customerPhoneLength: customerPhone.length,
      //   customerNameValue: customerName,
      //   customerPhoneValue: customerPhone
      // });

      // Check if customer already exists
      // console.log("Looking for existing customer with phone:", customerPhone);
      let customer = await Customer.findOne({
        where: { phoneNumber: customerPhone }
      });

      if (!customer) {
        // console.log("Customer not found, creating new customer:", { name: customerName, phone: customerPhone });
        customer = await Customer.create({
          name: customerName,
          phoneNumber: customerPhone,
        }, { transaction });
        // console.log("New customer created:", customer.toJSON());
      }

      customerId = customer.id;
      // console.log("Customer resolved for invoice:", {
      //   customerId,
      //   customerName,
      //   customerPhone,
      //   customerIdType: typeof customerId
      // });
    }

    // 🔢 Generate invoice number with retry mechanism
    let invoiceNumber;
    let invoice; // Declare invoice variable outside the loop
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        invoiceNumber = await generateInvoiceNumber();
        // console.log(`Generated invoice number (attempt ${retryCount + 1}):`, invoiceNumber);
        
        // Try to create the invoice
        invoice = await Invoice.create(
          {
            invoiceNumber,
            customerId,
            subtotal,
            discount,
            tax,
            total,
            paymentMode,
            status,
          },
          { transaction }
        );
        
        // console.log("Invoice created successfully:", invoice.toJSON());
        break; // Success, exit retry loop
        
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' && error.fields?.invoiceNumber) {
          // console.log(`Invoice number conflict detected (attempt ${retryCount + 1}):`, invoiceNumber);
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to generate unique invoice number after ${maxRetries} attempts`);
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          throw error; // Re-throw non-invoice-number errors
        }
      }
    }

    // Check if invoice was created successfully
    if (!invoice) {
      throw new Error("Failed to create invoice after all retry attempts");
    }

    // 📦 Create invoice items
    if (items && items.length > 0) {
      // console.log("Creating invoice items:", items);
      
      for (const item of items) {
        const { variantId, quantity, total } = item;
        
        // Get product variant details
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
          throw new Error(`Product variant not found: ${variantId}`);
        }
        
        // Check stock availability
        if (variant.stock_qty < quantity) {
          throw new Error(`Insufficient stock for ${variant.product?.name || 'product'}. Available: ${variant.stock_qty}, Requested: ${quantity}`);
        }
        
        // Create invoice item
        await InvoiceItem.create(
          {
            invoiceId: invoice.id,
            variantId,
            quantity,
            unitPrice: total / quantity,
            total,
          },
          { transaction }
        );
        
        // Reduce stock - check again before updating
        const currentStock = variant.stock_qty;
        const newStock = currentStock - quantity;
        
        if (newStock < 0) {
          throw new Error(`Insufficient stock for ${variant.product?.name || 'product'}. Available: ${currentStock}, Requested: ${quantity}`);
        }
        
        await variant.update(
          { stock_qty: newStock },
          { transaction }
        );
        
        // console.log(`Stock reduced for variant ${variantId}: ${currentStock} -> ${newStock}`);
      }
    }

    await transaction.commit();
    
    // Fetch complete invoice with items
    const completeInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: InvoiceItem,
          as: "invoiceItems",
          include: [
            {
              model: ProductVariant,
              as: "variant",
              include: [{ model: Product, as: "product" }],
            },
          ],
        },
        { 
          model: Customer,
          as: "customer",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        invoice: completeInvoice,
      },
    });
  } catch (error) {
    // Only rollback if transaction is still active
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error in createInvoiceWithItems:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create invoice",
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
        {
          model: Customer,
          as: "customer", // ✅ include customer details
          attributes: ['id', 'name', 'phoneNumber'],
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
        {
          model: Customer,
          as: "customer", // ✅ include customer details
          attributes: ['id', 'name', 'phoneNumber'],
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

// ✅ Convert Draft to Final Invoice (Print & Save)
export const convertDraftToInvoice = async (req, res) => {
  const transaction = await Sequelize.transaction();
  try {
    const { draftId } = req.body;

    if (!draftId) {
      return res.status(400).json({
        success: false,
        message: "Draft ID is required.",
      });
    }

    // Get the draft with items and customer information
    const draft = await InvoiceDraft.findByPk(draftId, {
      include: [
        {
          model: InvoiceDraftItem,
          as: "items",
        },
        {
          model: Customer,
          as: "customer",
          attributes: ['id', 'name', 'phoneNumber'],
        }
      ],
      transaction
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Invoice draft not found.",
      });
    }
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create the final invoice with customerId
    const newInvoice = await Invoice.create({
      invoiceNumber,
      customerId: draft.customerId, // This should be set from the draft
      subtotal: draft.subtotal,
      discount: draft.discount,
      tax: draft.tax,
      total: draft.total,
      paymentMode: draft.paymentMode,
      status: "paid",
    }, { transaction });

    // console.log('Created invoice with customerId:', newInvoice.customerId);

    // Create invoice items and reduce stock
    for (const draftItem of draft.items) {
      // Create invoice item
      await InvoiceItem.create({
        invoiceId: newInvoice.id,
        variantId: draftItem.variantId,
        quantity: draftItem.quantity,
        total: draftItem.total
      }, { transaction });

      // Reduce stock
      const variant = await ProductVariant.findByPk(draftItem.variantId, { transaction });
      if (variant) {
        if (variant.stock_qty < draftItem.quantity) {
          throw new Error(`Insufficient stock for variant ${variant.id}. Available: ${variant.stock_qty}, Requested: ${draftItem.quantity}`);
        }
        await variant.update({
          stock_qty: variant.stock_qty - draftItem.quantity
        }, { transaction });
      }
    }

    // Delete the draft and its items
    await draft.destroy({ transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Draft converted to invoice successfully and stock updated.",
      data: { 
        invoice: newInvoice, 
        invoiceNumber: invoiceNumber,
        items: draft.items 
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error converting draft to invoice:', error);
    res.status(500).json({
      success: false,
      message: "Failed to convert draft to invoice.",
      error: error.message,
    });
  }
};
