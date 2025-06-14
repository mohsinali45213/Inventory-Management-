import sequelize from "../db/db.js";

import Category from "./category.models.js";
import Product from "./products.models.js";
import SubCategory from "./subCategory.modules.js";
import Brand from "./brand.models.js";
import ProductVariant from "./productVariant.models.js";
const models = {
  Category,
  Product,
  SubCategory,
  Brand,
  ProductVariant,
};

// Setup associations after all models are loaded
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;
export { Category, Product, SubCategory, Brand, ProductVariant }; // Export models for convenience
export { sequelize as db }; // Export sequelize instance as db for convenience