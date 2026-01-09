import { getOnlineUsers } from "./presenceSocket.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
export const chatSocket = (io, socket) => {
  socket.on(
    "join-conversation",
    async ({ conversationId, userId, otherUserId }) => {
      console.log("userId in join-conversation", userId);

      socket.userId = userId;
      socket.join(conversationId);

      const result = await Message.updateMany(
        {
          from: otherUserId,
          to: userId,
          isSeen: false,
        },
        { $set: { isSeen: true } }
      );

      //  لو فعلاً في رسائل اتغيرت
      if (result.modifiedCount > 0) {
        const onlineUsers = getOnlineUsers();
        const senderSocket = onlineUsers.get(otherUserId);

        if (senderSocket) {
          io.to(senderSocket).emit("messages-seen", {
            conversationId,
            seenBy: userId,
          });
        }
      }
    }
  );
  socket.on("leave-conversation", ({ conversationId }) => {
    socket.leave(conversationId);
  });

  socket.on("send-message", async ({ msg, conversationId }) => {
    console.log("send-message ttttttttttttttttttt");
    console.log("send-message conversationId", conversationId);
    console.log("send-message msg", msg);

    // 1- نشوف هل المستخدم التاني جوه الشات؟
    const socketsInRoom = await io.in(conversationId).fetchSockets();
    const isReceiverInChat = socketsInRoom.some((s) => {
      console.log("s.userId", s.userId);
      return s.userId === msg.to;
    });
    const message = await Message.create({
      from: msg.from,
      to: msg.to,
      text: msg.text,
      isSeen: isReceiverInChat,
    });
    let convo = await Conversation.findOne({
      members: { $all: [msg.from, msg.to] },
    });
    if (!convo) {
      convo = await Conversation.create({
        members: [msg.from, msg.to],
        lastMessage: message._id,
      });
    } else {
      convo.lastMessage = message._id;
      await convo.save();
    }

    convo = await Conversation.findById(convo._id)
      .populate("members", "username")
      .populate("lastMessage");
    // 4- تحويلها لشكل العميل زي الـ controller
    const receiverUser = convo.members.find((m) => m._id.toString() === msg.to);
    const senderUser = convo.members.find((m) => m._id.toString() === msg.from);
    const unSeenMsgsNumber = await Message.countDocuments({
      from: msg.from,
      to: msg.to,
      isSeen: false,
    });
    const formattedConvoForReceiver = {
      id: convo._id,
      user: {
        id: senderUser._id,
        username: senderUser.username,
      },
      lastMessage: convo.lastMessage?.text || "",
      updatedAt: convo.updatedAt,
      unSeenMsgsNumber,
    };

    const formattedConvoForSender = { ...formattedConvoForReceiver };
    formattedConvoForSender.user = {
      id: receiverUser._id,
      username: receiverUser.username,
    };
    formattedConvoForSender.unSeenMsgsNumber = 0;
    const onlineUsers = getOnlineUsers();
    const receiverSocket = onlineUsers.get(msg.to);

    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-message", message);
      io.to(receiverSocket).emit(
        "conversation-updated",
        formattedConvoForReceiver
      );
    }
    const senderSocket = onlineUsers.get(msg.from);
    if (senderSocket) {
      io.to(senderSocket).emit("conversation-updated", formattedConvoForSender);
    }
    socket.emit("receive-message", message);
  });
};
