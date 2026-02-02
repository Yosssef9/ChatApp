import mongoose from "mongoose";
const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "haha", "sad", "angry", "pray"],
      required: true,
    },
  },
  { timestamps: true },
);
const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: null },
    isSeen: { type: Boolean, default: false, required: true },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    hiddenFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    repliedMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true },
);

// Transform _id -> id and hide sensitive fields
messageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const Message = mongoose.model("Message", messageSchema);
