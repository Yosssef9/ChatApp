import { useEffect } from "react";
import api from "../api/api";
import { useChatStore } from "@/store/chatStore";

export default function useRecentChats() {
  const setRecentChats = useChatStore((s) => s.setRecentChats);
  const setIsLoadingRecentChats = useChatStore(
    (s) => s.setIsLoadingRecentChats,
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoadingRecentChats(true);
        const res = await api.get("/users/getRecentChatsUsers", {
          withCredentials: true,
        });
        if (alive) setRecentChats(res.data);
        console.log("useRecentChats res", res);
      } catch (e) {
        console.error("recent chats error:", e);
      } finally {
        if (alive) setIsLoadingRecentChats(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [setRecentChats, setIsLoadingRecentChats]);
}
