import Sequelize from "../db/db.js";
import InvoiceDraft from "../models/invoice_draft.models.js";
import InvoiceDraftItem from "../models/Invoice_draft_item.models.js";
import Customer from "../models/customers.models.js";
import { Op } from "sequelize";

// ✅ Create Invoice Draft with Items
const generateDraftNumber = async () => {
  try {
    const today = new Date();
    const datePart = today.toISOString().split("T")[0].replace(/-/g, "");

    const countToday = await InvoiceDraft.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });

    const serial = String(countToday + 1).padStart(3, "0");
    const draftNumber = `DRAFT-${datePart}-${serial}`;

    const existingDraft = await InvoiceDraft.findOne({
      where: { draftNumber }
    });

    if (existingDraft) {
      const maxSerial = await InvoiceDraft.max('draftNumber', {
        where: {
          draftNumber: {
            [Op.like]: `DRAFT-${datePart}-%`
          }
        }
      });

      if (maxSerial) {
        const lastSerial = parseInt(maxSerial.split('-')[2]);
        const newSerial = String(lastSerial + 1).padStart(3, "0");
        return `DRAFT-${datePart}-${newSerial}`;
      }
    }

    return draftNumber;
  } catch (error) {
    throw error;
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
      items,
    } = req.body;

    let customerId = null;
    if (customerName && customerPhone) {
      let customer = await Customer.findOne({
        where: { phoneNumber: customerPhone }
      });

      if (!customer) {
        customer = await Customer.create({
          name: customerName,
          phoneNumber: customerPhone,
        }, { transaction });
      }

      customerId = customer.id;
    }

    const draftNumber = await generateDraftNumber();

    const draft = await InvoiceDraft.create({
      draftNumber,
      customerId,
      subtotal,
      discount,
      tax,
      total,
      paymentMode,
      status,
    }, { transaction });

    if (items && items.length > 0) {
      const itemRows = items.map(item => ({
        draftId: draft.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.total / item.quantity,
        total: item.total,
      }));

      await InvoiceDraftItem.bulkCreate(itemRows, { transaction });
    }

    await transaction.commit();

    const createdDraft = await InvoiceDraft.findByPk(draft.id, {
      include: [
        {
          model: InvoiceDraftItem,
          as: "items",
        },
        {
          model: Customer,
          as: "customer",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Invoice draft created successfully",
      data: createdDraft,
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to create invoice draft",
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

    const formattedDrafts = drafts.map(draft => {
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

    res.status(200).json({
      success: true,
      message: "Drafts fetched successfully.",
      data: formattedDrafts,
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

    const formattedDraft = {
      ...draft.toJSON(),
      customerName: draft.customer?.name || draft.customerName || '',
      customerPhone: draft.customer?.phoneNumber || draft.customerPhone || '',
    };

    res.status(200).json({
      success: true,
      message: "Invoice draft fetched successfully.",
      data: formattedDraft,
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
