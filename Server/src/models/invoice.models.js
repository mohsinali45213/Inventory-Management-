import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";
import { Model } from "sequelize";

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