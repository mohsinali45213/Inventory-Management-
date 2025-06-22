import {createInvoiceItem,deleteInvoiceItem,getAllInvoiceItems,getInvoiceItemsByInvoiceId} from "../controllers/invoiceItem.controllers.js";
import { Router } from "express";
const invoiceItemRouter = Router();
invoiceItemRouter.post("/", createInvoiceItem);
invoiceItemRouter.get("/", getAllInvoiceItems);
invoiceItemRouter.get("/:invoiceId", getInvoiceItemsByInvoiceId);
invoiceItemRouter.delete("/:id", deleteInvoiceItem);

export default invoiceItemRouter;