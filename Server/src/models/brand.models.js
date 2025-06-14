import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";
const Brand = sequelize.define(
  "brand",
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
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  { tableName: "brands", timestamps: true }
);

// Associations
Brand.associate = (models) => {
  Brand.hasMany(models.Product, {
    foreignKey: "brandId",
    as: "products",
  });
};

export default Brand;
