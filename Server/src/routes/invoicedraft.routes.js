import express from "express";
import {
  // createInvoiceDraft,
  createInvoiceDraftWithItems,
  getAllInvoiceDrafts,
  getInvoiceDraftById,
  updateInvoiceDraft,
  deleteInvoiceDraft,
} from "../controllers/invoiceDraft.controllers.js";

const invoiceDraftRouter = express.Router();

// ✅ Create a new draft invoice
invoiceDraftRouter.post("/", createInvoiceDraftWithItems);

// ✅ Get all invoice drafts
invoiceDraftRouter.get("/", getAllInvoiceDrafts);

// ✅ Get a single draft by ID
invoiceDraftRouter.get("/:id", getInvoiceDraftById);

// ✅ Update a draft invoice
invoiceDraftRouter.put("/:id", updateInvoiceDraft);

// ✅ Delete a draft invoice
invoiceDraftRouter.delete("/:id", deleteInvoiceDraft);

export default invoiceDraftRouter;
