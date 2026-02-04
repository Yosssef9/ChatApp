import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  // 🔥 STATE
  activeChatUser: null,
  messages: [],
  typingUsers: {},
  onlineUsers: {},
  socket: null,
  repliedMessage: null,

  // 🔥 ACTIONS
  setActiveChatUser: (chat) => set({ activeChatUser: chat }),

  setMessages: (msgs) => set({ messages: msgs }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  updateMessage: (updated) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === updated.id ? updated : m)),
    })),

  setSocket: (socket) => set({ socket }),

  setTypingUsers: (users) => set({ typingUsers: users }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  setRepliedMessage: (msg) => set({ repliedMessage: msg }),
}));
