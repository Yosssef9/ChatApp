const onlineUsers = new Map();

export const presenceSocket = (io, socket) => {
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log("onlineUsers :", onlineUsers);
  });

  socket.on("disconnect", () => {
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        console.log("onlineUsers :", onlineUsers);

        break;
      }
    }
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
};

export const getOnlineUsers = () => onlineUsers;
