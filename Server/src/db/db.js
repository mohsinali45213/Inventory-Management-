// connect mysql database using sequelize
import { Sequelize } from "sequelize";
import config from "../config/config.js";

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
  host: config.DB_HOST,
  port: config.MYSQL_PORT,
  dialect: "mysql",
  logging: false,
});

export default sequelize;