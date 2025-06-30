import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize } from "./models/index.js";
import { createDefaultAdmin } from "./utils/createDefaultAdmin.js";

import adminRouter from "./routes/admin.routes.js";
import brandRouter from "./routes/brand.routes.js";
import categoryRouter from "./routes/category.routes.js";
import customerRouter from "./routes/customers.routes.js";
import invoiceRouter from "./routes/invoice.routes.js";
import invoiceItemRouter from "./routes/invoiceItem.routes.js";
import invoiceDraftRouter from "./routes/invoicedraft.routes.js";
import invoiceDraftItemRouter from "./routes/invoicedraftitem.routes.js";
import productRouter from "./routes/products.routes.js";
import productVariantRouter from "./routes/productVariant.routes.js";
import subCategoryRouter from "./routes/subCategory.routes.js";
import config from "./config/config.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/invoice-items", invoiceItemRouter);
app.use("/api/v1/invoice-drafts", invoiceDraftRouter);
app.use("/api/v1/invoice-draft-items", invoiceDraftItemRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/product-variants", productVariantRouter);
app.use("/api/v1/subcategory", subCategoryRouter);

sequelize
  .sync()
  .then(async () => {
    // Create default admin if none exists
    await createDefaultAdmin();
    
    app.listen(config.PORT, () => {
      console.log(`Application server is running at http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to sync db:", err.message);
  });

export { sequelize };
export default app;