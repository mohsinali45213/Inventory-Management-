import sequelize from "../db/db.js";

import Category from "./category.models.js";
import Product from "./products.models.js";
import SubCategory from "./subCategory.modules.js";
import Brand from "./brand.models.js";
import ProductVariant from "./productVariant.models.js";
import Invoice from "./invoice.models.js";
import InvoiceItem from "./invoiceItem.models.js";
import Customer from "./customers.models.js";
import InvoiceDraft from "./invoice_draft.models.js";
import InvoiceDraftItem from "./Invoice_draft_item.models.js";

const models = {
  Category,
  Product,
  SubCategory,
  Brand,
  ProductVariant,
  Invoice,
  InvoiceItem,
  Customer,
  InvoiceDraft,
  InvoiceDraftItem,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

export { sequelize };
export default models;

export {
  Category,
  Product,
  SubCategory,
  Brand,
  ProductVariant,
  Invoice,
  InvoiceItem,
  Customer,
  InvoiceDraft,
  InvoiceDraftItem,
};

export { sequelize as db };

