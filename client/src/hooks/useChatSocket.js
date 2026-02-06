import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useChatStore } from "@/store/chatStore";

export default function useChatSocket({ userId, socketUrl }) {
  const socket = useChatStore((s) => s.socket);

  const setSocket = useChatStore((s) => s.setSocket);
  const addMessage = useChatStore((s) => s.addMessage);
  const markSeen = useChatStore((s) => s.markSeen);
  const activeChatUser = useChatStore((s) => s.activeChatUser);

  const setOnlineUsersFromArray = useChatStore(
    (s) => s.setOnlineUsersFromArray,
  );
  const setTypingUsers = useChatStore((s) => s.setTypingUsers);
  const setUsersInChat = useChatStore((s) => s.setUsersInChat);
  const updateRecentChat = useChatStore((s) => s.updateRecentChat);

  // ✅ avoid stale closure
  const activeChatRef = useRef(activeChatUser);
  useEffect(() => {
    activeChatRef.current = activeChatUser;
  }, [activeChatUser]);

  // 1) CONNECT / DISCONNECT
  useEffect(() => {
    if (!userId || !socketUrl) return;
    if (socket) return;
    const s = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    setSocket(s);
    s.emit("user-online", userId);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [userId, socketUrl, setSocket]);

  // 2) receive-message
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      const active = activeChatRef.current;
      const isCurrentChat =
        active && (msg.from === active.user.id || msg.to === active.user.id);

      if (isCurrentChat) addMessage(msg);
    };

    socket.on("receive-message", handleReceiveMessage);
    return () => socket.off("receive-message", handleReceiveMessage);
  }, [socket, addMessage]);

  // 3) online-users
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (usersArray) => {
      setOnlineUsersFromArray(usersArray);
    };

    socket.on("online-users", handleOnlineUsers);
    return () => socket.off("online-users", handleOnlineUsers);
  }, [socket, setOnlineUsersFromArray]);

  // 4) user in chat / left chat
  useEffect(() => {
    if (!socket) return;

    const handleInChat = ({ conversationId }) => {
      setUsersInChat(conversationId, true);
    };

    const handleLeftChat = ({ conversationId }) => {
      setUsersInChat(conversationId, false);
    };

    socket.on("user-in-chat", handleInChat);
    socket.on("user-left-chat", handleLeftChat);

    return () => {
      socket.off("user-in-chat", handleInChat);
      socket.off("user-left-chat", handleLeftChat);
    };
  }, [socket, setUsersInChat]);

  // 5) conversation-updated
  useEffect(() => {
    if (!socket) return;

    const handleUpdated = (updatedConvo) => {
      updateRecentChat(updatedConvo);
    };

    socket.on("conversation-updated", handleUpdated);
    return () => socket.off("conversation-updated", handleUpdated);
  }, [socket, updateRecentChat]);

  // 6) messages-seen
  useEffect(() => {
    if (!socket) return;

    const handleSeen = ({ conversationId }) => {
      const active = activeChatRef.current;
      if (conversationId !== active?.id) return;

      markSeen(userId);
    };

    socket.on("messages-seen", handleSeen);
    return () => socket.off("messages-seen", handleSeen);
  }, [socket, markSeen, userId]);

  // 7) typing / stop typing
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ conversationId }) => {
      setTypingUsers(conversationId, true);
    };

    const handleStopTyping = ({ conversationId }) => {
      setTypingUsers(conversationId, false);
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [socket, setTypingUsers]);

  // 8) Auto join/leave current conversation
  useEffect(() => {
    if (!socket || !userId || !activeChatUser) return;

    const room = activeChatUser.id;
    const otherUserId = activeChatUser.user.id;

    const join = () =>
      socket.emit("join-conversation", {
        conversationId: room,
        userId,
        otherUserId,
      });

    if (!socket.connected) socket.once("connect", join);
    else join();

    return () => {
      socket.emit("leave-conversation", {
        conversationId: room,
        userId,
        otherUserId,
      });
      socket.off("connect", join);
    };
  }, [socket, userId, activeChatUser]);

  // helpers

  return {};
}
