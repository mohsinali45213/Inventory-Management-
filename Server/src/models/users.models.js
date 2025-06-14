import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    contact_number: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    }
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default User;