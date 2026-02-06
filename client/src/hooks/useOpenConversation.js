import { useCallback } from "react";
import api from "@/api/api";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";

export default function useOpenConversation({ userId, joinConversation }) {
  const resetUnseen = useChatStore((s) => s.resetUnseen);
  const setActiveChatUser = useChatStore((s) => s.setActiveChatUser);
  const setMessages = useChatStore((s) => s.setMessages);
  const setRepliedMessage = useChatStore((s) => s.setRepliedMessage);
  const setIsSidebarOpen = useUIStore((s) => s.setIsSidebarOpen);

  const openConversation = useCallback(
    async (clickedConversation) => {
      // 1) UI + store updates
      resetUnseen(clickedConversation.id);
      setRepliedMessage(null);
      setActiveChatUser(clickedConversation);

      if (window.innerWidth < 768) setIsSidebarOpen(false);

      // 2) join socket room
      joinConversation({
        conversationId: clickedConversation.id,
        otherUserId: clickedConversation.user.id,
      });

      // 3) fetch messages
      try {
        const res = await api.get(
          `/messages/getMessages?from=${userId}&to=${clickedConversation.user.id}`,
          { withCredentials: true },
        );
        setMessages(res.data);
      } catch (err) {
        console.error("getMessages error:", err);
      }
    },
    [
      userId,
      joinConversation,
      resetUnseen,
      setRepliedMessage,
      setActiveChatUser,
      setIsSidebarOpen,
      setMessages,
    ],
  );

  return { openConversation };
}
