import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js"; // your Mongoose User model

// -------------------- Register --------------------
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        timestamp: newUser.timestamp,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------- Login --------------------
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Find user
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Invalid username or password" });

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid username or password" });

    // ✅ Access Token قصير (مثلاً 15 دقيقة)
    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Refresh Token طويل (مثلاً 7 أيام)
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ خزنه في الـ DB
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ ابعته للعميل في cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 دقيقة
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        timestamp: user.timestamp,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------- Get current user --------------------
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        timestamp: user.timestamp,
      },
    });
  } catch (error) {
    console.error("❌ getMe error:", error);
    res.status(403).json({ message: "Invalid token" });
  }
};

// -------------------- refreshAccessToken --------------------

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    // ✅ تحقق من الـ token في DB
    const user = await User.findOne({ refreshToken: token });
    if (!user)
      return res.status(403).json({ message: "Invalid refresh token" });

    // ✅ أنشئ Access Token جديد
    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Optional: rotate refresh token (أمان أعلى)
    const newRefreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    user.refreshToken = newRefreshToken;
    await user.save();

    // ✅ إرسال tokens جديدة
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// -------------------- Logout --------------------
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // ✅ إزالة refresh token من DB
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    // ✅ حذف الـ cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ message: "Server error while logging out" });
  }
};
