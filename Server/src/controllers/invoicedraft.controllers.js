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

//     const draft = await InvoiceDraft.findByPk(id);
//     if (!draft) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice draft not found.",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Invoice draft fetched successfully.",
//       data: draft,
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
import InvoiceDraftItem from "../models/invoice_draft_item.models.js";
import Customer from "../models/customers.models.js";
import { Op } from "sequelize";

// ✅ Create Invoice Draft with Items
const generateDraftNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().split("T")[0].replace(/-/g, ""); // e.g., 20250622

  const countToday = await InvoiceDraft.count({
    where: {
      createdAt: {
        [Op.gte]: new Date(today.setHours(0, 0, 0, 0)), // start of today
      },
    },
  });

  const serial = String(countToday + 1).padStart(3, "0");
  return `DRAFT-${datePart}-${serial}`;
};


// ✅ Create Invoice Draft with Items
export const createInvoiceDraftWithItems = async (req, res) => {
  const transaction = await Sequelize.transaction();
  try {
    const {
      customerId,
      customer, // optional: { name, email, phone }
      subtotal,
      discount,
      tax,
      total,
      paymentMode,
      status,
      items, // Array of items: [{ variantId, quantity, total }]
    } = req.body;

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

    let resolvedCustomerId = null;
    if (customerId) {
      const found = await Customer.findByPk(customerId);
      if (!found) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }
      resolvedCustomerId = customerId;
    } else if (customer?.name) {
      const created = await Customer.create(customer, { transaction });
      resolvedCustomerId = created.id;
    }

    const draftNumber = await generateDraftNumber();

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

    const itemRows = items.map((item) => ({
      draftId: draft.id,
      variantId: item.variantId,
      quantity: item.quantity,
      total: item.total,
    }));

    await InvoiceDraftItem.bulkCreate(itemRows, { transaction });
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Invoice draft with items created successfully.",
      data: {
        draft,
        items: itemRows,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to create invoice draft with items.",
      error: error.message,
    });
  }
};

// ✅ Get All Invoice Drafts
export const getAllInvoiceDrafts = async (req, res) => {
  try {
    const drafts = await InvoiceDraft.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Drafts fetched successfully.",
      data: drafts,
    });
  } catch (error) {
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
      include: [InvoiceDraftItem],
    });
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Invoice draft not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice draft fetched successfully.",
      data: draft,
    });
  } catch (error) {
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
