import express from "express";
import {
  adminLogin,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getCurrentAdmin,
} from "../controllers/admin.controllers.js";
import { authenticateAdmin } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

// Public route for admin login
adminRouter.post("/login", adminLogin);

// Protected routes (require admin authentication)
adminRouter.post("/", authenticateAdmin, createAdmin);
adminRouter.get("/", authenticateAdmin, getAllAdmins);
adminRouter.get("/profile", authenticateAdmin, getCurrentAdmin);
adminRouter.get("/:id", authenticateAdmin, getAdminById);
adminRouter.put("/:id", authenticateAdmin, updateAdmin);
adminRouter.delete("/:id", authenticateAdmin, deleteAdmin);

export default adminRouter; 