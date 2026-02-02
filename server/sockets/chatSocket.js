import { getOnlineUsers } from "./presenceSocket.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";

export const chatSocket = (io, socket) => {
  socket.on(
    "join-conversation",
    async ({ conversationId, userId, otherUserId }) => {
      console.log("userId in join-conversation", userId);
      console.log("JOINED rooms:", Array.from(socket.rooms));
      console.log(
        "JOINED conversationId typeof:",
        typeof conversationId,
        conversationId,
      );
      socket.emit("userIsOnTheChat", otherUserId);
      socket.userId = userId;
      socket.join(conversationId);
      const onlineUsers = getOnlineUsers();

      const otherUserSocket = onlineUsers.get(otherUserId);

      if (otherUserSocket) {
        io.to(otherUserSocket).emit("user-in-chat", {
          conversationId,
          userId,
        });
      }

      const result = await Message.updateMany(
        {
          from: otherUserId,
          to: userId,
          isSeen: false,
        },
        { $set: { isSeen: true } },
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
    },
  );
  socket.on("leave-conversation", ({ conversationId, otherUserId, userId }) => {
    socket.leave(conversationId);
    const onlineUsers = getOnlineUsers();

    const otherUserSocket = onlineUsers.get(otherUserId);

    if (otherUserSocket) {
      io.to(otherUserSocket).emit("user-left-chat", {
        conversationId,
        userId,
      });
    }
  });

  socket.on("send-message", async ({ msg, conversationId, repliedMessage }) => {
    console.log("send-message ttttttttttttttttttt");
    console.log("send-message conversationId", conversationId);
    console.log("send-message msg", msg);
    console.log("send-message repliedMessage", repliedMessage);

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
      repliedMessage: repliedMessage?.id || null,
    });
    const populatedMessage = await Message.findById(message._id).populate(
      "repliedMessage",
    );
    console.log(populatedMessage?.repliedMessage);
    let convo = await Conversation.findById(conversationId);

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
      io.to(receiverSocket).emit("receive-message", populatedMessage);
      io.to(receiverSocket).emit(
        "conversation-updated",
        formattedConvoForReceiver,
      );
    }
    const senderSocket = onlineUsers.get(msg.from);
    if (senderSocket) {
      io.to(senderSocket).emit("conversation-updated", formattedConvoForSender);
    }
    socket.emit("receive-message", populatedMessage);
  });

  socket.on(
    "send-reaction",
    async ({ messageId, type, userId, conversationId }) => {
      console.log("send-reaction");
      console.log("messageId", messageId);
      console.log("type", type);
      console.log("userId", userId);
      console.log("send-reaction conversationId", conversationId);
      const sockets = await io.in(conversationId).fetchSockets();
      console.log(
        "SOCKETS IN ROOM:",
        sockets.map((s) => s.userId),
      );

      const message = await Message.findById(messageId);
      if (!message) return;

      // Add reaction or update if user already reacted
      const existing = message.reactions.find(
        (r) => r.user.toString() === userId,
      );

      if (existing) {
        if (existing.type === type) {
          message.reactions = message.reactions.filter(
            (r) => r.user.toString() !== userId,
          );
        } else {
          existing.type = type; // update reaction
        }
      } else {
        message.reactions.push({ user: userId, type });
      }

      await message.save();

      io.to(conversationId).emit("reaction-updated", message);
    },
  );
  socket.on("delete-msg", async ({ messageId, conversationId, type }) => {
    console.log("delete-msg messageId", messageId);
    console.log("delete-msg type", type);
    const message = await Message.findById(messageId);
    if (!message) return;

    // delete for everyone
    if (type === "everyone") {
      if (message.from.toString() !== socket.userId) return;

      message.isDeleted = true;
      message.text = null;
      await message.save();
      //   let convo = await Conversation.findById(conversationId).populate("lastMessage");
      //  if(convo.lastMessage._id === messageId){

      //  }
      io.to(conversationId).emit("message-deleted", {
        message,
        type: "everyone",
      });
    }

    // delete for me
    if (type === "me") {
      message.hiddenFor.push(socket.userId);
      await message.save();

      socket.emit("message-deleted", {
        message,
        type: "me",
      });
    }
  });
};
