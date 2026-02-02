import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const sameSet = (a, b) => {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
};

export default function useChatSocket({
  socketRef,
  userId,
  socketUrl,
  activeChatUser,
  setMessages,
  setRecentChats,
}) {
  // Keep latest active chat in a ref (avoid stale closure)
  const activeChatRef = useRef(activeChatUser);
  useEffect(() => {
    activeChatRef.current = activeChatUser;
  }, [activeChatUser]);

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [usersInChat, setUsersInChat] = useState({});

  // 1) CONNECT / DISCONNECT (safe)
  useEffect(() => {
    if (!userId || !socketUrl) return;

    const s = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = s;
    s.emit("user-online", userId);

    return () => {
      // disconnect the same instance we created
      s.disconnect();
      // only clear ref if it still points to this instance
      if (socketRef.current === s) socketRef.current = null;
    };
  }, [userId, socketUrl, socketRef]);

  // 2) receive-message
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleReceiveMessage = (msg) => {
      const active = activeChatRef.current;
      const isCurrentChat =
        active && (msg.from === active.user.id || msg.to === active.user.id);

      if (isCurrentChat) setMessages((prev) => [...prev, msg]);
    };

    s.on("receive-message", handleReceiveMessage);
    return () => s.off("receive-message", handleReceiveMessage);
  }, [setMessages, socketRef]);

  // 3) online-users (prevent extra renders)
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleOnlineUsers = (usersArray) => {
      const next = new Set(usersArray);
      setOnlineUsers((prev) => (sameSet(prev, next) ? prev : next));
    };

    s.on("online-users", handleOnlineUsers);
    return () => s.off("online-users", handleOnlineUsers);
  }, [socketRef]);

  // 4) user in chat / left chat
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleInChat = ({ conversationId }) => {
      setUsersInChat((prev) =>
        prev[conversationId] === true
          ? prev
          : { ...prev, [conversationId]: true },
      );
    };

    const handleLeftChat = ({ conversationId }) => {
      setUsersInChat((prev) =>
        prev[conversationId] === false
          ? prev
          : { ...prev, [conversationId]: false },
      );
    };

    s.on("user-in-chat", handleInChat);
    s.on("user-left-chat", handleLeftChat);

    return () => {
      s.off("user-in-chat", handleInChat);
      s.off("user-left-chat", handleLeftChat);
    };
  }, [socketRef]);

  // 5) conversation-updated
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleUpdated = (updatedConvo) => {
      setRecentChats((prev) => {
        const exists = prev.find((c) => c.id === updatedConvo.id);
        return exists
          ? prev.map((c) => (c.id === updatedConvo.id ? updatedConvo : c))
          : [updatedConvo, ...prev];
      });
    };

    s.on("conversation-updated", handleUpdated);
    return () => s.off("conversation-updated", handleUpdated);
  }, [setRecentChats, socketRef]);

  // 6) messages-seen
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleSeen = ({ conversationId }) => {
      const active = activeChatRef.current;
      if (conversationId !== active?.id) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.from === userId ? { ...msg, isSeen: true } : msg,
        ),
      );
    };

    s.on("messages-seen", handleSeen);
    return () => s.off("messages-seen", handleSeen);
  }, [userId, setMessages, socketRef]);

  // 7) typing / stop typing
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleTyping = ({ conversationId }) => {
      setTypingUsers((prev) =>
        prev[conversationId] === true
          ? prev
          : { ...prev, [conversationId]: true },
      );
    };

    const handleStopTyping = ({ conversationId }) => {
      setTypingUsers((prev) =>
        prev[conversationId] === false
          ? prev
          : { ...prev, [conversationId]: false },
      );
    };

    s.on("user-typing", handleTyping);
    s.on("user-stop-typing", handleStopTyping);

    return () => {
      s.off("user-typing", handleTyping);
      s.off("user-stop-typing", handleStopTyping);
    };
  }, [socketRef]);

  // 8) Auto join/leave current conversation (single source of truth)
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !userId || !activeChatUser) return;

    const room = activeChatUser.id;
    const otherUserId = activeChatUser.user.id;

    const join = () =>
      s.emit("join-conversation", {
        conversationId: room,
        userId,
        otherUserId,
      });

    if (!s.connected) s.once("connect", join);
    else join();

    return () => {
      s.emit("leave-conversation", {
        conversationId: room,
        userId,
        otherUserId,
      });
      s.off("connect", join); // safety
    };
  }, [userId, activeChatUser, socketRef]);

  // helpers (optional)
  const joinConversation = useCallback(
    ({ conversationId, otherUserId }) => {
      const s = socketRef.current;
      if (!s || !userId) return;
      s.emit("join-conversation", { conversationId, userId, otherUserId });
    },
    [userId, socketRef],
  );

  const leaveConversation = useCallback(
    ({ conversationId, otherUserId }) => {
      const s = socketRef.current;
      if (!s || !userId) return;
      s.emit("leave-conversation", { conversationId, userId, otherUserId });
    },
    [userId, socketRef],
  );

  const sendMessage = useCallback(
    ({ toUserId, conversationId, text, repliedMessage }) => {
      const s = socketRef.current;
      if (!s || !userId) return;
      if (!text?.trim()) return;

      const msg = { from: userId, to: toUserId, text };
      s.emit("send-message", {
        msg,
        conversationId,
        repliedMessage: repliedMessage || null,
      });
    },
    [userId, socketRef],
  );

  return {
    onlineUsers,
    typingUsers,
    usersInChat,
    joinConversation,
    leaveConversation,
    sendMessage,
  };
}
