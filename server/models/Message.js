import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    isSeen: { type: Boolean, default: false, require: true },
  },
  { timestamps: true }
);
// Transform _id -> id and hide sensitive fields
messageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password; // optional
  },
});

export const Message = mongoose.model("Message", messageSchema);
