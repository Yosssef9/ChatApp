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

  socket.on(
    "send-message",
    async ({ msg, conversationId, repliedMessage, meta }) => {
      console.log("send-message conversationId", conversationId);
      console.log("send-message msg", msg);
      console.log("send-message repliedMessage", repliedMessage);
      console.log("send-message meta", meta);

      const fromUserId = socket.userId; // ✅ safer
      const toUserId = msg.to;

      // 1- هل المستقبل جوه الشات؟
      const socketsInRoom = await io.in(conversationId).fetchSockets();
      const isReceiverInChat = socketsInRoom.some((s) => s.userId === toUserId);

      // 2- Decide text + forward fields
      let textToSend = msg.text;
      let forwardFields = {};

      if (meta?.type === "forward") {
        const original = await Message.findById(meta.sourceMessageId);
        if (!original || original.isDeleted) return;

        const forwardedText = original.text || "";
        textToSend = forwardedText;

        forwardFields = {
          forwardedFrom: original.from,
          forwardedMessage: original._id,
          forwardedText: forwardedText,
        };
      }

      // 3- Create message
      const message = await Message.create({
        from: fromUserId,
        to: toUserId,
        text: textToSend,
        isSeen: isReceiverInChat,
        repliedMessage: repliedMessage?.id || null,
        ...forwardFields,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate("repliedMessage")
        .populate("forwardedFrom", "username");

      let convo = await Conversation.findById(conversationId);

      if (!convo) {
        convo = await Conversation.create({
          members: [fromUserId, toUserId],
          lastMessage: message._id,
        });
      } else {
        convo.lastMessage = message._id;
        await convo.save();
      }

      convo = await Conversation.findById(convo._id)
        .populate("members", "username")
        .populate("lastMessage");

      const receiverUser = convo.members.find(
        (m) => m._id.toString() === toUserId,
      );
      const senderUser = convo.members.find(
        (m) => m._id.toString() === fromUserId,
      );

      const unSeenMsgsNumber = await Message.countDocuments({
        from: fromUserId,
        to: toUserId,
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

      const formattedConvoForSender = {
        ...formattedConvoForReceiver,
        user: {
          id: receiverUser._id,
          username: receiverUser.username,
        },
        unSeenMsgsNumber: 0,
      };

      const onlineUsers = getOnlineUsers();
      const receiverSocket = onlineUsers.get(toUserId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", populatedMessage);
        io.to(receiverSocket).emit(
          "conversation-updated",
          formattedConvoForReceiver,
        );
      }

      const senderSocket = onlineUsers.get(fromUserId);
      if (senderSocket) {
        io.to(senderSocket).emit(
          "conversation-updated",
          formattedConvoForSender,
        );
      }

      socket.emit("receive-message", populatedMessage);
    },
  );
  socket.on("edit-message", async ({ messageId, conversationId, newText }) => {
    console.log("edit-message", { messageId, conversationId, newText });

    const editorId = socket.userId; // ✅ زي ما بتعمل في send-message
    if (!editorId) return;
    if (!messageId || !conversationId) return;

    const trimmed = (newText || "").trim();
    if (!trimmed) return; // ممنوع رسالة فاضية

    const message = await Message.findById(messageId);
    if (!message) return;

    // ✅ بس صاحب الرسالة يقدر يعدّل
    if (message.from.toString() !== editorId) return;

    // ✅ ممنوع تعديل رسالة محذوفة للجميع
    if (message.isDeleted) return;

    // ✅ (اختياري) لو الرسالة forward أو reply عادي لا مشكلة

    // (اختياري) حفظ تاريخ التعديلات
    message.editHistory = message.editHistory || [];
    message.editHistory.push({
      text: message.text || "",
      editedAt: new Date(),
    });

    message.text = trimmed;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // ✅ رجّع نفس الشكل اللي بتستخدمه في receive-message
    const populatedMessage = await Message.findById(message._id)
      .populate("repliedMessage")
      .populate("forwardedFrom", "username");

    // ✅ ابعت تحديث للغرفة كلها (زي reaction-updated)
    io.to(conversationId).emit("message-updated", populatedMessage);

    // ✅ لو دي كانت آخر رسالة: حدّث Conversation + ابعت conversation-updated للطرفين
    let convo = await Conversation.findById(conversationId).populate(
      "members",
      "username",
    );

    if (convo?.lastMessage?.toString() === messageId) {
      // lastMessage هو ObjectId أصلاً للرسالة، مش نص
      // بس لازم نعمل save عشان updatedAt يتغير
      convo.lastMessage = message._id;
      await convo.save();

      // اعمل populate للـ lastMessage عشان lastMessage.text يبان
      convo = await Conversation.findById(convo._id)
        .populate("members", "username")
        .populate("lastMessage");

      const fromUserId = message.from.toString();
      const toUserId = message.to.toString();

      const receiverUser = convo.members.find(
        (m) => m._id.toString() === toUserId,
      );
      const senderUser = convo.members.find(
        (m) => m._id.toString() === fromUserId,
      );

      const unSeenMsgsNumber = await Message.countDocuments({
        from: fromUserId,
        to: toUserId,
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

      const formattedConvoForSender = {
        ...formattedConvoForReceiver,
        user: {
          id: receiverUser?._id,
          username: receiverUser?.username,
        },
        unSeenMsgsNumber: 0,
      };

      const onlineUsers = getOnlineUsers();
      const receiverSocket = onlineUsers.get(toUserId);
      const senderSocket = onlineUsers.get(fromUserId);

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "conversation-updated",
          formattedConvoForReceiver,
        );
      }
      if (senderSocket) {
        io.to(senderSocket).emit(
          "conversation-updated",
          formattedConvoForSender,
        );
      }
    }
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
        updatedMessage: message,
        type: "everyone",
      });
    }

    // delete for me
    if (type === "me") {
      message.hiddenFor.push(socket.userId);
      await message.save();

      socket.emit("message-deleted", {
        updatedMessage: message,
        type: "me",
      });
    }
  });
};
