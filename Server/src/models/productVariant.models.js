import {  DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const ProductVariant = sequelize.define(
  "product_variants",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: "products", // Name of the referenced model
        key: "id", // Key in the referenced model
      },
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock_qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // image_url: {
    //   type: DataTypes.STRING(255),
    //   allowNull: true,
    // },
  },
  { tableName: "product_variants", timestamps: true }
);

// Associations
ProductVariant.associate = (models) => {
  ProductVariant.belongsTo(models.Product, {
    foreignKey: "productId",
    as: "product",
  });
  ProductVariant.hasMany(models.InvoiceItem, { 
    foreignKey: "variantId",
    as: "invoiceItems",
  });
  ProductVariant.hasMany(models.InvoiceDraftItem, { 
    foreignKey: "variantId",
    as: "draftItems",
  });
};
export default ProductVariant;
