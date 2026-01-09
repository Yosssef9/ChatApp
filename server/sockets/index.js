import { chatSocket } from "./chatSocket.js";
import { presenceSocket } from "./presenceSocket.js";
import { getOnlineUsers } from "./presenceSocket.js";

export const initSockets = (io) => {
  io.on("connection", (socket) => {
    socket.on("typing", ({ conversationId, to }) => {
      console.log("typing conversationId :", conversationId);
      socket.to(conversationId).emit("user-typing", {
        userId: socket.userId,
        conversationId,
      });

      const onlineUsers = getOnlineUsers();
      const receiverSocket = onlineUsers.get(to);

      if (receiverSocket) {
        io.to(receiverSocket).emit("user-typing", { conversationId });
      }
    });

    socket.on("stop-typing", ({ conversationId, to }) => {
      console.log("stop-typing conversationId :", conversationId);

      socket.to(conversationId).emit("user-stop-typing", {
        userId: socket.userId,
        conversationId,
      });
      const onlineUsers = getOnlineUsers();
      const receiverSocket = onlineUsers.get(to);

      if (receiverSocket) {
        io.to(receiverSocket).emit("user-stop-typing", { conversationId });
      }
    });
    chatSocket(io, socket);
    presenceSocket(io, socket);
  });
};
