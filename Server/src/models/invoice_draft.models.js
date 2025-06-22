import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import Customer from "./customers.models.js"; // Assuming you have a Customer model defined








const InvoiceDraft = sequelize.define(
  "invoice_draft",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    draftNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // e.g., DRAFT-2025-001
    },

    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0, // % discount
    },

    tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0, // % tax
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    paymentMode: {
      type: DataTypes.ENUM("cash", "card", "upi", "cheque"),
      allowNull: true, // optional at draft stage
    },

    status: {
      type: DataTypes.ENUM("draft", "saved"),
      defaultValue: "draft",
    },
  },
  {
    tableName: "invoice_drafts",
    timestamps: true, // adds createdAt and updatedAt
  }
);

InvoiceDraft.belongsTo(Customer, { foreignKey: "customerId" });
Customer.hasMany(InvoiceDraft, { foreignKey: "customerId" });

export default InvoiceDraft;
