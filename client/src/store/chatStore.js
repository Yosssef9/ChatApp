import { create } from "zustand";
let typingTimeout = null;

export const useChatStore = create((set, get) => ({
  // 🔥 STATE
  activeChatUser: null,
  messages: [],
  recentChats: [],
  typingUsers: {},
  onlineUsers: {},
  usersInChat: {},
  socket: null,
  repliedMessage: null,
  isLoadingRecentChats: false,
  isDeleteOpen: false,
  deleteMessageId: null,
  deleteIsMine: false,
  isForwardOpen: false,
  forwardMessageId: null,
  isEditOpen: false,

  editedMessage: null,
  openForward: (messageId) =>
    set({ isForwardOpen: true, forwardMessageId: messageId }),
  closeForward: () => set({ isForwardOpen: false, forwardMessageId: null }),

  openDelete: (messageId, isMine) =>
    set({
      isDeleteOpen: true,
      deleteMessageId: messageId,
      deleteIsMine: isMine,
    }),

  closeDelete: () =>
    set({ isDeleteOpen: false, deleteMessageId: null, deleteIsMine: false }),
  // 🔥 ACTIONS
  setActiveChatUser: (chat) => set({ activeChatUser: chat }),

  setMessages: (msgs) => set({ messages: msgs }),
  openEdit: (msg) => set({ isEditOpen: true, editedMessage: msg }),
  closeEdit: () => set({ isEditOpen: false, editedMessage: null }),
  setRecentChats: (recentChats) => set({ recentChats: recentChats }),
  updateRecentChat: (updatedConvo) =>
    set((state) => {
      const exists = state.recentChats.find((c) => c.id === updatedConvo.id);

      return {
        recentChats: exists
          ? state.recentChats.map((c) =>
              c.id === updatedConvo.id ? updatedConvo : c,
            )
          : [updatedConvo, ...state.recentChats],
      };
    }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  updateMessage: (updated) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === updated.id ? updated : m)),
    })),
  markSeen: (userId) =>
    set((state) => ({
      messages: Array.isArray(state.messages)
        ? state.messages.map((msg) =>
            msg.from === userId ? { ...msg, isSeen: true } : msg,
          )
        : [],
    })),
  resetUnseen: (conversationId) =>
    set((state) => ({
      recentChats: state.recentChats.map((c) =>
        c.id === conversationId ? { ...c, unSeenMsgsNumber: 0 } : c,
      ),
    })),
  setOnlineUsersFromArray: (usersArray) =>
    set(() => {
      const map = {};
      for (const id of usersArray || []) map[id] = true;
      return { onlineUsers: map };
    }),

  // ✅ Typing per conversation
  setTypingUsers: (conversationId, value) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: value },
    })),

  // ✅ In chat per conversation
  setUsersInChat: (conversationId, value) =>
    set((state) => ({
      usersInChat: { ...state.usersInChat, [conversationId]: value },
    })),

  setSocket: (socket) => set({ socket }),
  setIsLoadingRecentChats: (value) => set({ isLoadingRecentChats: value }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  setRepliedMessage: (msg) => set({ repliedMessage: msg }),
  sendMessage: ({
    fromUserId,
    toUserId,
    conversationId,
    text,
    repliedMessage,
    type,
    sourceMessageId,
  }) => {
    console.log("sendMessage chatStore");
    console.log("sendMessage fromUserId", fromUserId);
    console.log("sendMessage toUserId", toUserId);
    const socket = get().socket;
    const setRepliedMessage = get().setRepliedMessage;
    const activeChatUser = get().activeChatUser;
    if (!activeChatUser) return;
    console.log("sendMessage activeChatUser", activeChatUser);
    if (!socket || !fromUserId || !toUserId) return;
    if (type !== "forward" && !text?.trim()) return;
    console.log("sendMessage chatStore 2");

    socket.emit("send-message", {
      msg: { from: fromUserId, to: toUserId, text },
      conversationId,
      repliedMessage: repliedMessage || null,
      meta: { type, sourceMessageId },
    });
    setRepliedMessage(null);
  },
  joinConversation: ({ conversationId, userId, otherUserId }) => {
    const socket = get().socket;

    if (!socket || !userId) return;
    socket.emit("join-conversation", { conversationId, userId, otherUserId });
  },
  updateTypingStatus: ({ conversationId, to }) => {
    const socket = get().socket;
    if (!socket || !conversationId || !to) return;

    // user started typing
    socket.emit("typing", { conversationId, to });

    // reset stop-typing timer
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop-typing", { conversationId, to });
    }, 1000);
  },
  editMessage: ({ messageId, conversationId, newText }) => {
    console.log("chatstore editMessage tttttttttttttt");
    const socket = get().socket;
    if (!socket) return;

    socket.emit("edit-message", { messageId, conversationId, newText });
  },
}));
