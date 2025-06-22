import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import InvoiceDraft from "./invoice_draft.models.js";
import ProductVariant from "./productVariant.models.js"; // Assuming you have a ProductVariant model defined





const InvoiceDraftItem = sequelize.define(
  "invoice_draft_item",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    draftId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "invoice_drafts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    variantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "product_variants",
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
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "invoice_draft_items",
    timestamps: true,
  }
);


InvoiceDraftItem.belongsTo(InvoiceDraft, { foreignKey: "draftId" });
InvoiceDraft.hasMany(InvoiceDraftItem, { foreignKey: "draftId" });

InvoiceDraftItem.belongsTo(ProductVariant, { foreignKey: "variantId" });
ProductVariant.hasMany(InvoiceDraftItem, { foreignKey: "variantId" });

export default InvoiceDraftItem;
