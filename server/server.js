import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import "./config/db.js"; // الاتصال بالـ MongoDB
import { Message } from "./models/Message.js";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// API لجلب آخر 50 رسالة
app.get("/messages", async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
  res.json(messages);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chat message", async (data) => {
    const { username, text } = data;

    // حفظ الرسالة في MongoDB
    const msg = new Message({ username, text });
    await msg.save();
    console.log(msg);

    // إرسال الرسالة لكل العملاء
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3000, () => console.log("Server running on port 3000"));
