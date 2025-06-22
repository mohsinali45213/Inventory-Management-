import express from "express";
import {
  createInvoiceDraftItem,
  getAllInvoiceDraftItems,
  getInvoiceDraftItemById,
  updateInvoiceDraftItem,
  deleteInvoiceDraftItem,
} from "../controllers/invoiceDraftItem.controllers.js";

const invoiceDraftItemRouter = express.Router();

// ✅ Add an item to draft
invoiceDraftItemRouter.post("/", createInvoiceDraftItem);

// ✅ Get all draft items (across drafts)
invoiceDraftItemRouter.get("/", getAllInvoiceDraftItems);

// ✅ Get single draft item by ID
invoiceDraftItemRouter.get("/:id", getInvoiceDraftItemById);

// ✅ Update item in draft
invoiceDraftItemRouter.put("/:id", updateInvoiceDraftItem);

// ✅ Delete item from draft
invoiceDraftItemRouter.delete("/:id", deleteInvoiceDraftItem);

export default invoiceDraftItemRouter;
