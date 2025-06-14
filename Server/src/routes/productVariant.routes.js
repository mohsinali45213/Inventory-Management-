import express from "express";
import {
  createProductVariant,
  getAllProductVariants,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
} from "../controllers/productVariant.controllers.js";

const productVariantRouter = express.Router();

productVariantRouter.post("/", createProductVariant);
productVariantRouter.get("/", getAllProductVariants);
productVariantRouter.get("/:id", getProductVariantById);
productVariantRouter.put("/:id", updateProductVariant);
productVariantRouter.delete("/:id", deleteProductVariant);

export default productVariantRouter;
