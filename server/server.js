import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import "./config/db.js"; // الاتصال بالـ MongoDB
import { Message } from "./models/Message.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { initSockets } from "./sockets/index.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
const allowedOrigins = [
  "http://localhost:5173",
  "https://bwsxd8pq-5173.uks1.devtunnels.ms",
];
const app = express();
app.set("trust proxy", 1); // trust first proxy (your dev tunnel)

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins, // your frontend URL
    credentials: true, // allow cookies
  }),
);
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/messages", messageRoutes);
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

httpServer.listen(3000, "0.0.0.0", () =>
  console.log("Server running on port 3000"),
);
initSockets(io);
