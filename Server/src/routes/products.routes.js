import express from "express";
import {
  // createProduct,
  getAllProducts,
  getProductById,
  // updateProduct,
  // deleteProduct,
  createProductWithVariants,
  updateProductWithVariants,
  updateProductVariant,
  deleteProductWithVariants,
  deleteProductVariant,
} from "../controllers/products.controllers.js";

const productRouter = express.Router();

// productRouter.post("/", createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
// productRouter.put("/:id", updateProduct);
// productRouter.delete("/:id", deleteProduct);
productRouter.post("/variants", createProductWithVariants);
productRouter.put("/:id", updateProductWithVariants);
productRouter.put("/variants/:id", updateProductVariant);
productRouter.delete("/:id", deleteProductWithVariants);
productRouter.delete("/variants/:id", deleteProductVariant);



export default productRouter;
