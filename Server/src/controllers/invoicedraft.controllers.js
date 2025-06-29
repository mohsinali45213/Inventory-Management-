// import InvoiceDraft from "../models/invoice_draft.models.js";
// import Customer from "../models/customers.models.js";

// // ✅ Create Draft Invoice
// export const createInvoiceDraft = async (req, res) => {
//   try {
//     const { customerId, totalAmount, status } = req.body;

//     if (!customerId || !totalAmount) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer ID and total amount are required.",
//       });
//     }

//     const customer = await Customer.findByPk(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found.",
//       });
//     }

//     const draft = await InvoiceDraft.create({
//       customerId,
//       totalAmount,
//       status: status || "draft",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Invoice draft created successfully.",
//       data: draft,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to create invoice draft.",
//       error: error.message,
//     });
//   }
// };

// // ✅ Get All Invoice Drafts
// export const getAllInvoiceDrafts = async (req, res) => {
//   try {
//     const drafts = await InvoiceDraft.findAll({
//       order: [["createdAt", "DESC"]],
//     });

//     res.status(200).json({
//       success: true,
//       message: "Drafts fetched successfully.",
//       data: drafts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch invoice drafts.",
//       error: error.message,
//     });
//   }
// };

// // ✅ Get Draft by ID
// export const getInvoiceDraftById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const draft = await InvoiceDraft.findByPk(id, {
//       include: [
//         InvoiceDraftItem,
//         {
//           model: Customer,
//           attributes: ['id', 'name', 'phoneNumber'],
//         }
//       ],
//     });
//     if (!draft) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice draft not found.",
//       });
//     }

//     // Format the response to include customer name and phone
//     const formattedDraft = {
//       ...draft.toJSON(),
//       customerName: draft.Customer?.name || '',
//       customerPhone: draft.Customer?.phoneNumber || '',
//     };

//     res.status(200).json({
//       success: true,
//       message: "Invoice draft fetched successfully.",
//       data: formattedDraft,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch invoice draft.",
//       error: error.message,
//     });
//   }
// };

// // ✅ Update Draft Invoice
// export const updateInvoiceDraft = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { customerId, totalAmount, status } = req.body;

//     const draft = await InvoiceDraft.findByPk(id);
//     if (!draft) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice draft not found.",
//       });
//     }

//     if (customerId && customerId !== draft.customerId) {
//       const customerExists = await Customer.findByPk(customerId);
//       if (!customerExists) {
//         return res.status(404).json({
//           success: false,
//           message: "New customer not found.",
//         });
//       }
//     }

//     await draft.update({
//       customerId: customerId ?? draft.customerId,
//       totalAmount: totalAmount ?? draft.totalAmount,
//       status: status ?? draft.status,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Invoice draft updated successfully.",
//       data: draft,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update invoice draft.",
//       error: error.message,
//     });
//   }
// };

// // ✅ Delete Invoice Draft
// export const deleteInvoiceDraft = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const draft = await InvoiceDraft.findByPk(id);
//     if (!draft) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice draft not found.",
//       });
//     }

//     await draft.destroy();

//     res.status(200).json({
//       success: true,
//       message: "Invoice draft deleted successfully.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete invoice draft.",
//       error: error.message,
//     });
//   }
// };








// Invoice Draft Controller with Items

import Sequelize from "../db/db.js";
import InvoiceDraft from "../models/invoice_draft.models.js";
import InvoiceDraftItem from "../models/Invoice_draft_item.models.js";
import Customer from "../models/customers.models.js";
import { Op } from "sequelize";

// ✅ Create Invoice Draft with Items
const generateDraftNumber = async () => {
  try {
    const today = new Date();
    const datePart = today.toISOString().split("T")[0].replace(/-/g, ""); // e.g., 20250622

    // Create a new date object for the start of today
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    // Get the highest draft number for today
    const todayDrafts = await InvoiceDraft.findAll({
      where: {
        draftNumber: {
          [Op.like]: `DRAFT-${datePart}-%`
        }
      },
      order: [['draftNumber', 'DESC']],
      limit: 1
    });

    let serial = 1;
    if (todayDrafts.length > 0) {
      const lastDraftNumber = todayDrafts[0].draftNumber;
      const lastSerial = parseInt(lastDraftNumber.split('-')[2]);
      serial = lastSerial + 1;
    }

    const draftNumber = `DRAFT-${datePart}-${String(serial).padStart(3, "0")}`;
    
    console.log('Generated draft number:', draftNumber, 'serial:', serial);
    return draftNumber;
  } catch (error) {
    console.error('Error generating draft number:', error);
    // Fallback to timestamp-based number
    const timestamp = Date.now();
    return `DRAFT-${timestamp}`;
  }
};


// ✅ Create Invoice Draft with Items
export const createInvoiceDraftWithItems = async (req, res) => {
  const transaction = await Sequelize.transaction();
  try {
    const {
      customerName,
      customerPhone,
      subtotal,
      discount,
      tax,
      total,
      paymentMode,
      status,
      items, // Array of items: [{ variantId, quantity, total }]
    } = req.body;

    console.log('Creating draft with data:', {
      customerName,
      customerPhone,
      subtotal,
      discount,
      tax,
      total,
      paymentMode,
      status,
      itemsCount: items?.length
    });

    // Log data types for debugging
    console.log('Data types:', {
      subtotal: typeof subtotal,
      discount: typeof discount,
      tax: typeof tax,
      total: typeof total,
      paymentMode: typeof paymentMode,
      status: typeof status,
      items: Array.isArray(items)
    });

    if (
      subtotal == null ||
      discount == null ||
      tax == null ||
      total == null ||
      !paymentMode ||
      !items?.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All billing fields, payment mode, and items are required.",
      });
    }

    // Create or find customer
    let resolvedCustomerId = null;
    if (customerName && customerPhone) {
      console.log('Looking for existing customer with phone:', customerPhone);
      let customer = await Customer.findOne({
        where: { phoneNumber: customerPhone }
      });
      
      if (!customer) {
        console.log('Creating new customer:', { name: customerName, phone: customerPhone });
        customer = await Customer.create({
          name: customerName,
          phoneNumber: customerPhone,
        }, { transaction });
        console.log('New customer created:', customer.toJSON());
      } else {
        console.log('Existing customer found:', customer.toJSON());
      }
      resolvedCustomerId = customer.id;
      console.log('Resolved customer ID:', resolvedCustomerId);
    }

    const draftNumber = await generateDraftNumber();
    console.log('Generated draft number:', draftNumber);

    const draft = await InvoiceDraft.create(
      {
        draftNumber,
        customerId: resolvedCustomerId,
        subtotal,
        discount,
        tax,
        total,
        paymentMode: paymentMode.toLowerCase(),
        status: status?.toLowerCase() || "draft",
      },
      { transaction }
    );

    console.log('Draft created:', draft.toJSON());

    const itemRows = items.map((item) => ({
      draftId: draft.id,
      variantId: item.variantId,
      quantity: item.quantity,
      total: item.total,
    }));

    console.log('Creating draft items:', itemRows);

    const createdItems = await InvoiceDraftItem.bulkCreate(itemRows, { transaction });
    console.log('Created draft items:', createdItems.map(item => item.toJSON()));
    
    await transaction.commit();

    console.log('Draft creation completed successfully');
    
    // Verify the draft with items
    const createdDraft = await InvoiceDraft.findByPk(draft.id, {
      include: [
        {
          model: InvoiceDraftItem,
          as: "items",
        }
      ]
    });
    console.log('Verification - Draft with items:', createdDraft?.toJSON());
    console.log('Verification - Items count:', createdDraft?.items?.length || 0);

    res.status(201).json({
      success: true,
      message: "Invoice draft with items created successfully.",
      data: {
        draft,
        items: itemRows,
      },
    });
  } catch (error) {
    // Only rollback if transaction is still active
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error creating draft:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      errors: error.errors,
      fields: error.errors?.map(e => ({ field: e.path, value: e.value, message: e.message }))
    });
    
    let errorMessage = "Failed to create invoice draft with items.";
    if (error.name === 'SequelizeValidationError') {
      const fieldErrors = error.errors?.map(e => `${e.path}: ${e.message}`).join(', ');
      errorMessage = `Validation error: ${fieldErrors}`;
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = `Duplicate entry error: ${error.errors.map(e => e.message).join(', ')}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

// ✅ Get All Invoice Drafts
export const getAllInvoiceDrafts = async (req, res) => {
  try {
    const drafts = await InvoiceDraft.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['name', 'phoneNumber'],
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format the response to include customer name and phone
    const formattedDrafts = drafts.map(draft => {
      console.log('Raw draft data:', draft.toJSON());
      console.log('Customer data:', draft.customer);
      
      return {
        id: draft.id,
        draftNumber: draft.draftNumber,
        customerName: draft.customer?.name || draft.customerName || '',
        customerPhone: draft.customer?.phoneNumber || draft.customerPhone || '',
        subtotal: draft.subtotal,
        discount: draft.discount,
        tax: draft.tax,
        total: draft.total,
        paymentMode: draft.paymentMode,
        status: draft.status,
        createdAt: draft.createdAt,
      };
    });

    console.log('Formatted drafts:', formattedDrafts);

    res.status(200).json({
      success: true,
      message: "Drafts fetched successfully.",
      data: formattedDrafts,
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice drafts.",
      error: error.message,
    });
  }
};

// ✅ Get Draft by ID
export const getInvoiceDraftById = async (req, res) => {
  try {
    const { id } = req.params;

    const draft = await InvoiceDraft.findByPk(id, {
      include: [
        {
          model: InvoiceDraftItem,
          as: "items",
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phoneNumber'],
        }
      ],
    });
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Invoice draft not found.",
      });
    }

    console.log('Raw draft data:', draft.toJSON());
    console.log('Customer data:', draft.customer);
    console.log('Draft items data:', draft.items);
    console.log('Draft items length:', draft.items?.length || 0);
    console.log('Draft items structure:', JSON.stringify(draft.items, null, 2));

    // Format the response to include customer name and phone
    const formattedDraft = {
      ...draft.toJSON(),
      customerName: draft.customer?.name || draft.customerName || '',
      customerPhone: draft.customer?.phoneNumber || draft.customerPhone || '',
    };

    console.log('Formatted draft:', formattedDraft);
    console.log('Formatted draft items:', formattedDraft.items);

    res.status(200).json({
      success: true,
      message: "Invoice draft fetched successfully.",
      data: formattedDraft,
    });
  } catch (error) {
    console.error('Error fetching draft by ID:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice draft.",
      error: error.message,
    });
  }
};

// ✅ Update Draft Invoice
export const updateInvoiceDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, subtotal, discount, tax, total, paymentMode, status } = req.body;

    const draft = await InvoiceDraft.findByPk(id);
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Invoice draft not found.",
      });
    }

    if (customerId && customerId !== draft.customerId) {
      const customerExists = await Customer.findByPk(customerId);
      if (!customerExists) {
        return res.status(404).json({
          success: false,
          message: "New customer not found.",
        });
      }
    }

    await draft.update({
      customerId: customerId ?? draft.customerId,
      subtotal: subtotal ?? draft.subtotal,
      discount: discount ?? draft.discount,
      tax: tax ?? draft.tax,
      total: total ?? draft.total,
      paymentMode: paymentMode ?? draft.paymentMode,
      status: status ?? draft.status,
    });

    res.status(200).json({
      success: true,
      message: "Invoice draft updated successfully.",
      data: draft,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice draft.",
      error: error.message,
    });
  }
};

// ✅ Delete Invoice Draft
export const deleteInvoiceDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const draft = await InvoiceDraft.findByPk(id);
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Invoice draft not found.",
      });
    }

    await draft.destroy();

    res.status(200).json({
      success: true,
      message: "Invoice draft deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice draft.",
      error: error.message,
    });
  }
};
