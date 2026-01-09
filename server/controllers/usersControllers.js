// controllers/userControllers.js
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";

export const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const query = req.query.q || "";
    if (!query) return res.status(200).json({ users: [] });

    // 1- Find matching users
    const users = await User.find({
      username: { $regex: query, $options: "i" },
      _id: { $ne: currentUserId }, // exclude self
    }).select("_id username");

    // 2- For each user, find existing conversation or prepare empty
    const recentChats = await Promise.all(
      users.map(async (u) => {
        const convo = await Conversation.findOne({
          members: { $all: [currentUserId, u._id] },
        }).populate("lastMessage");

        return {
          id: convo?._id || null, // null if no conversation exists yet
          user: {
            id: u._id,
            username: u.username,
          },
          lastMessage: convo?.lastMessage?.text || "", // empty string if no last message
          updatedAt: convo?.updatedAt || null, // null if no conversation yet
        };
      })
    );

    res.status(200).json(recentChats);
  } catch (error) {
    console.error("❌ Search users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecentChatsUsers = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    // 1- جيب كل المحادثات اللي المستخدم موجود فيها
    const conversations = await Conversation.find({
      members: currentUserId,
    })
      .sort({ updatedAt: -1 }) // أحدث المحادثات أولاً
      .populate("members", "username") // بيانات المستخدمين
      .populate("lastMessage"); // آخر رسالة

    // 2- حول المحادثات لصيغة سهلة للعميل
    const recentChats = conversations.map((convo) => {
      const otherUser = convo.members.find(
        (m) => m._id.toString() !== currentUserId
      );

      return {
        id: convo._id,
        user: {
          id: otherUser._id,
          username: otherUser.username,
        },
        lastMessage: convo.lastMessage?.text || "",
        updatedAt: convo.updatedAt,
      };
    });

    res.json(recentChats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent chats" });
  }
};
