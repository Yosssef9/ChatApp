import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    console.log("token", token);
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // ✅ Attach user to the request
    next(); // Continue to controller
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
