import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const SubCategory = sequelize.define(
  "sub_category",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "categories", key: "id" },
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  { tableName: "sub_categories", timestamps: true }
);

// Associations
SubCategory.associate = (models) => {
  SubCategory.belongsTo(models.Category, {
    foreignKey: "categoryId",
    as: "category",
  });
  SubCategory.hasMany(models.Product, {
    foreignKey: "subCategoryId",
    as: "products",
  });
  
};
export default SubCategory;
