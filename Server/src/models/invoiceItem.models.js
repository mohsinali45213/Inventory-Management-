import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const InvoiceItem = sequelize.define("invoice_item", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: "invoice_items",
  timestamps: true,
});

InvoiceItem.associate = (models) => {
  InvoiceItem.belongsTo(models.Invoice, {
    foreignKey: "invoiceId",
    as: "invoice",
  });

  InvoiceItem.belongsTo(models.ProductVariant, {
    foreignKey: "variantId",
    as: "variant",
  });
};

export default InvoiceItem;
