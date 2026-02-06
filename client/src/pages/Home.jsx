import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import { useState } from "react";

import useUserSearch from "../hooks/useUserSearch";
import { useChatStore } from "@/store/chatStore";
import useRecentChats from "../hooks/useRecentChats";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import useOpenConversation from "@/hooks/useOpenConversation";

export default function Home() {
  const { user } = useAuth();
  console.log("user", user);
  const [searchInput, setSearchInput] = useState("");

  // UI states

  const joinConversation = useChatStore((s) => s.joinConversation);

  // chat states

  // // ✅ search hook
  const { results, isLoadingSearching } = useUserSearch(searchInput, 300);

  // // ✅ socket hook (كل السوكيت هنا)

  useRecentChats();
  const { openConversation } = useOpenConversation({
    userId: user.id,
    joinConversation,
  });

  return (
    <div className="flex h-screen gap-5 ">
      <Sidebar
        user={user}
        results={results}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        openConversation={openConversation}
        isLoadingSearching={isLoadingSearching}
      />

      {/* Main Chat Area */}
      <ChatWindow user={user} />
    </div>
  );
}
