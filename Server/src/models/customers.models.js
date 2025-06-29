import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";

const Customer = sequelize.define(
  "customer",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  { tableName: "customers", timestamps: true }
);

// Association method
Customer.associate = (models) => {
  Customer.hasMany(models.Invoice, { 
    foreignKey: "customerId",
    as: "invoices",
  });
  Customer.hasMany(models.InvoiceDraft, { 
    foreignKey: "customerId",
    as: "drafts",
  });
};

export default Customer;