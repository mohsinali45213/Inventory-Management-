import {
  createBrand,
  deleteBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
} from "../controllers/brand.controllers.js";
import { Router } from "express";
const brandRouter = Router();
brandRouter.post("/", createBrand);
brandRouter.get("/", getAllBrands);
brandRouter.get("/:id", getBrandById);
brandRouter.put("/:id", updateBrand);
brandRouter.delete("/:id", deleteBrand);
export default brandRouter;