import express from "express";
import {
  createInvoiceItem,
  getAllInvoiceItems,
  getInvoiceItemById,
  updateInvoiceItem,
  deleteInvoiceItem,
} from "../controllers/invoiceItem.controllers.js";

const invoiceItemRouter = express.Router();

invoiceItemRouter.post("/", createInvoiceItem);
invoiceItemRouter.get("/", getAllInvoiceItems);
invoiceItemRouter.get("/:id", getInvoiceItemById);
invoiceItemRouter.put("/:id", updateInvoiceItem);
invoiceItemRouter.delete("/:id", deleteInvoiceItem);

export default invoiceItemRouter;
