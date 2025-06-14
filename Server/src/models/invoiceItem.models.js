// import sequelize from "../db/db.js";
// import { DataTypes } from "sequelize";

// const InvoiceItem = sequelize.define(
//   "InvoiceItem",
//   {
//     id: {
//       type: DataTypes.UUID,
//       primaryKey: true,
//       defaultValue: DataTypes.UUIDV4,
//     },
//     invoiceId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     variantId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     quantity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 1,
//     },
//     unitPrice: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//     totalPrice: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//   },
//   {
//     tableName: "invoice_items",
//     timestamps: true,
//   }
// );

// export default InvoiceItem;

import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";

const InvoiceItem = sequelize.define(
  "InvoiceItem",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "invoices", // must match the table name of Invoice model
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "product_variants", // must match the table name of ProductVariant model
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "invoice_items",
    timestamps: true,
  }
);

export default InvoiceItem;
