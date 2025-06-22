import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";


const Invoice = sequelize.define("invoice", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
    defaultValue: 0.0,
  },
  tax: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  paymentMode: {
    type: DataTypes.ENUM("cash", "card", "upi", "cheque"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "paid", "cancelled"),
    defaultValue: "pending",
  },
}, {
  tableName: "invoices",
  timestamps: true,
});

// ✅ Association method
// Invoice.associate = (models) => {
//   Invoice.belongsTo(models.Customer, { foreignKey: "customerId" });
//   models.Customer.hasMany(Invoice, { foreignKey: "customerId" });

//   Invoice.hasMany(InvoiceItem, {
//     foreignKey: "invoiceId",
//     as: "invoiceItems",
//   });
// };
Invoice.associate = (models) => {
  Invoice.belongsTo(models.Customer, { foreignKey: "customerId" });
  models.Customer.hasMany(Invoice, { foreignKey: "customerId" });

  // ✅ Use exact alias
  Invoice.hasMany(models.InvoiceItem, {
    foreignKey: "invoiceId",
    as: "invoiceItems",
  });
};


export default Invoice;
