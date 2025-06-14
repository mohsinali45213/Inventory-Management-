import express from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controllers.js";

const invoiceRouter = express.Router();

invoiceRouter.post("/", createInvoice);
invoiceRouter.get("/", getAllInvoices);
invoiceRouter.get("/:id", getInvoiceById);
invoiceRouter.put("/:id", updateInvoice);
invoiceRouter.delete("/:id", deleteInvoice);

export default invoiceRouter;
