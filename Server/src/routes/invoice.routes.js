// import express from "express";
// import {
//   createInvoice,
//   getAllInvoices,
//   getInvoiceById,
//   updateInvoice,
//   deleteInvoice,
// } from "../controllers/invoice.controllers.js";

// const invoiceRouter = express.Router();

// invoiceRouter.post("/", createInvoice);
// invoiceRouter.get("/", getAllInvoices);
// invoiceRouter.get("/:id", getInvoiceById);
// invoiceRouter.put("/:id", updateInvoice);
// invoiceRouter.delete("/:id", deleteInvoice);

// export default invoiceRouter;




import express from "express";
import {
  // createInvoice,
  createInvoiceWithItems,
  getAllInvoicesWithItems,
  getInvoiceById,
  // updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controllers.js";

const invoiceRouter = express.Router();

// ✅ Create a new invoice
invoiceRouter.post("/", createInvoiceWithItems);

// ✅ Get all invoices
invoiceRouter.get("/", getAllInvoicesWithItems);

// ✅ Get invoice by ID
invoiceRouter.get("/:id", getInvoiceById);

// ✅ Update invoice
// invoiceRouter.put("/:id", updateInvoice);

// ✅ Delete invoice
invoiceRouter.delete("/:id", deleteInvoice);

export default invoiceRouter;
