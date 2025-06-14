import {
  createUser,
  deleteUser,
  findAllUsers,
  findUserById,
  loginUser,
  updateUser,
} from "../controllers/users.controllers.js";
// import { authenticate } from "../middlewares/auth.js";
import { Router } from "express";
const userRouter = Router();
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/", findAllUsers);
userRouter.get("/:id", findUserById);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
export default userRouter;
