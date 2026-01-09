import express from "express";
import {
  searchUsers,
  getRecentChatsUsers,
} from "../controllers/usersControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/searchUsers", authMiddleware, searchUsers);
router.get("/getRecentChatsUsers", authMiddleware, getRecentChatsUsers);

export default router;
