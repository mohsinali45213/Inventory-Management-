import express from "express";
import {
  getAllProductVariants,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
} from "../controllers/productVariant.controllers.js";
import {upload} from "../middlewares/multer.js";

const productVariantRouter = express.Router();

productVariantRouter.get("/", getAllProductVariants);
productVariantRouter.get("/:id", getProductVariantById);
productVariantRouter.put("/:id", upload.single("image_url"), updateProductVariant);
productVariantRouter.delete("/:id", deleteProductVariant);

export default productVariantRouter;
