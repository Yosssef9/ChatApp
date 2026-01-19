import express from "express";
import { getMessages } from "../controllers/messageController.js";
const router = express.Router();
import { authMiddleware } from "../middlewares/authMiddleware.js";

router.get("/getMessages", authMiddleware, getMessages);

export default router;
