import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true }, // اسم الشخص
  text: { type: String, required: true }, // محتوى الرسالة
  timestamp: { type: Date, default: Date.now }, // وقت الإرسال
});

export const Message = mongoose.model("Message", messageSchema);
