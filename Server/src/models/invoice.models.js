// import sequelize from "../db/db.js";
// import { DataTypes } from "sequelize";
// import { Model } from "sequelize";



// const Invoice = sequelize.define(
//   "invoice",
//   {
//     id: {
//       type: DataTypes.UUID,
//       primaryKey: true,
//       defaultValue: DataTypes.UUIDV4,
//     },
//     customerId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     totalAmount: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM("pending", "paid", "cancelled"),
//       defaultValue: "pending",
//     },
//   },
//   { tableName: "invoices", timestamps: true }
// );

// export default Invoice;


import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Invoice = sequelize.define(
  "invoice",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "customers", // This should match the table name in the DB
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // or 'CASCADE' if you want invoices to be deleted with customers
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled"),
      defaultValue: "pending",
    },
  },
  { tableName: "invoices", timestamps: true }
);

export default Invoice;
