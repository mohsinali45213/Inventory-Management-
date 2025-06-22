// import { DataTypes } from "sequelize";
// import sequelize from "../db/db.js";
// import Invoice from "./invoice.models.js";
// // import InvoiceItem from "./invoiceItem.models.js";
// import ProductVariant from "./productVariant.models.js";

// Invoice.hasMany(InvoiceItem, { foreignKey: "invoiceId" });
// InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

// ProductVariant.hasMany(InvoiceItem, { foreignKey: "variantId" });
// InvoiceItem.belongsTo(ProductVariant, { foreignKey: "variantId" });




// const InvoiceItem = sequelize.define(
//   "invoice_item",
//   {
//     id: {
//       type: DataTypes.UUID,
//       primaryKey: true,
//       defaultValue: DataTypes.UUIDV4,
//     },

//     invoiceId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: Invoice,
//         key: "id",
//       },
//       onUpdate: "CASCADE",
//       onDelete: "CASCADE",
//     },

//     variantId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: ProductVariant,
//         key: "id",
//       },
//       onUpdate: "CASCADE",
//       onDelete: "CASCADE",
//     },

    

//     quantity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 1,
//     },


//     total: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//   },
//   {
//     tableName: "invoice_items",
//     timestamps: true,
//   }
// );


// // InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });
// // Invoice.hasMany(InvoiceItem, { foreignKey: "invoiceId" });

// // InvoiceItem.belongsTo(ProductVariant, { foreignKey: "variantId" });
// // ProductVariant.hasMany(InvoiceItem, { foreignKey: "variantId" });



// export default InvoiceItem;








import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import Invoice from "./invoice.models.js";

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

// ✅ Association method
// InvoiceItem.associate = (models) => {
//   InvoiceItem.belongsTo(models.Invoice, { foreignKey: "invoiceId" });
//   InvoiceItem.belongsTo(models.ProductVariant, { foreignKey: "variantId" });

//   models.Invoice.hasMany(InvoiceItem, { foreignKey: "invoiceId" });
//   models.ProductVariant.hasMany(InvoiceItem, { foreignKey: "variantId" });
// };

InvoiceItem.associate = (models) => {
  // ✅ Belongs to invoice
  InvoiceItem.belongsTo(models.Invoice, {
    foreignKey: "invoiceId",
    as: "invoice",
  });

  // ✅ Belongs to product variant
  InvoiceItem.belongsTo(models.ProductVariant, {
    foreignKey: "variantId",
    as: "variant",
  });

  // ❌ DO NOT re-define models.Invoice.hasMany(...) here again
  // ✅ Only define once in invoice.models.js
};


export default InvoiceItem;
