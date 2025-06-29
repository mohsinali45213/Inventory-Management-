import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

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

// Association method
InvoiceDraftItem.associate = (models) => {
  InvoiceDraftItem.belongsTo(models.InvoiceDraft, { 
    foreignKey: "draftId",
    as: "draft",
  });
  InvoiceDraftItem.belongsTo(models.ProductVariant, { 
    foreignKey: "variantId",
    as: "variant",
  });
};

export default InvoiceDraftItem;
