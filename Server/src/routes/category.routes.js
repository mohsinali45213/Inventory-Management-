import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  // searchCategories,
  updateCategory,
} from "../controllers/category.controllers.js";

import { Router } from "express";
const categoryRouter = Router();
categoryRouter.post("/", createCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);
// categoryRouter.get("/search", searchCategories);
export default categoryRouter;

