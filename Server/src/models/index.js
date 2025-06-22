// import sequelize from "../db/db.js";

// import Category from "./category.models.js";
// import Product from "./products.models.js";
// import SubCategory from "./subCategory.modules.js";
// import Brand from "./brand.models.js";
// import ProductVariant from "./productVariant.models.js";
// const models = {
//   Category,
//   Product,
//   SubCategory,
//   Brand,
//   ProductVariant,
// };

// // Setup associations after all models are loaded
// Object.values(models).forEach((model) => {
//   if (model.associate) {
//     model.associate(models);
//   }
// });

// export { sequelize };
// export default models;
// export { Category, Product, SubCategory, Brand, ProductVariant }; // Export models for convenience
// export { sequelize as db }; // Export sequelize instance as db for convenience







import sequelize from "../db/db.js";

// Import all models
import Category from "./category.models.js";
import Product from "./products.models.js";
import SubCategory from "./subCategory.modules.js";
import Brand from "./brand.models.js";
import ProductVariant from "./productVariant.models.js";
import Invoice from "./invoice.models.js";
import InvoiceItem from "./invoiceItem.models.js";
import Customer from "./customers.models.js";

// Register all models in the models object
const models = {
  Category,
  Product,
  SubCategory,
  Brand,
  ProductVariant,
  Invoice,
  InvoiceItem,
  Customer,
};

// Call associate() for each model
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Export
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
};

export { sequelize as db };

