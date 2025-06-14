import { createSubCategory,deleteSubCategory,getAllSubCategories,getSubCategoryById,updateSubCategory } from "../controllers/subCategory.controllers.js";

import { Router } from "express";
const subCategoryRouter = Router();
subCategoryRouter.post("/", createSubCategory);
subCategoryRouter.get("/", getAllSubCategories);
subCategoryRouter.get("/:id", getSubCategoryById);
subCategoryRouter.put("/:id", updateSubCategory);
subCategoryRouter.delete("/:id", deleteSubCategory);
export default subCategoryRouter;
