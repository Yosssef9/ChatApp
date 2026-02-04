import { Message } from "../models/Message.js";

export const getMessages = async (req, res) => {
  const { from, to } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    })
      .sort({ createdAt: 1 })
      .populate([
        {
          path: "repliedMessage",
        },
      ]);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
