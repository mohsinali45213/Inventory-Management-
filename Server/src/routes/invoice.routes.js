import express from "express";
import {
  createInvoiceWithItems,
  getAllInvoicesWithItems,
  getInvoiceById,
  deleteInvoice,
  getItemByBarcode,
  convertDraftToInvoice,
} from "../controllers/invoice.controllers.js";

const invoiceRouter = express.Router();

invoiceRouter.post("/", createInvoiceWithItems);
invoiceRouter.post("/convert-draft", convertDraftToInvoice);
invoiceRouter.get("/", getAllInvoicesWithItems);
invoiceRouter.get("/:id", getInvoiceById);
invoiceRouter.get("/barcode/:code", getItemByBarcode);
invoiceRouter.delete("/:id", deleteInvoice);

export default invoiceRouter;
