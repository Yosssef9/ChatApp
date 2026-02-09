import useUserSearch from "@/hooks/useUserSearch";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import SearchUsersInput from "./SearchUsersInput";
import ChatList from "./ChatList";
import { useChatStore } from "@/store/chatStore";
import { useAuth } from "../Context/AuthContext";

export default function ForwardDialog({ isOpen, onClose, messageToForwardId }) {
  const [searchInput, setSearchInput] = useState("");
  const sendMessage = useChatStore((s) => s.sendMessage);
  const { user } = useAuth();

  const { results, isLoadingSearching } = useUserSearch(searchInput, 300);
  // ✅ store selected conversation ids
  const [selectedConvos, setSelectedConvos] = useState([]);

  const toggleSelectConversation = (conversation) => {
    setSelectedConvos((prev) => {
      const exists = prev.some((c) => c.id === conversation.id);
      if (exists) return prev.filter((c) => c.id !== conversation.id);
      return [...prev, conversation];
    });
  };

  const sendForward = () => {
    console.log("sendForward selectedConvos", selectedConvos);
    if (selectedConvos.length === 0) return;

    selectedConvos.forEach((convo) => {
      sendMessage({
        fromUserId: user?.id,
        toUserId: convo.user.id,
        conversationId: convo.id,

        text: " ",
        repliedMessage: null,
        type: "forward",

        sourceMessageId: messageToForwardId,
      });
    });

    onClose();
    setSelectedConvos([]);
    setSearchInput("");
  };
  const selectedIds = new Set(selectedConvos.map((c) => c.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Dialog */}
          <motion.div
            className={[
              "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "bg-white rounded-2xl shadow-xl",
              "w-[92vw] max-w-sm sm:w-[420px]",
              "max-h-[85vh]",
              "p-4 sm:p-5",
              "flex flex-col",
            ].join(" ")}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Forward to</div>
              <div className="text-sm text-gray-500">
                Selected: {selectedConvos.length}
              </div>
            </div>

            <SearchUsersInput
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />

            <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-gray-100 mt-3">
              <ChatList
                results={results}
                searchInput={searchInput}
                onClick={() => {}}
                isLoadingSearching={isLoadingSearching}
                selectedConversationIds={selectedIds}
                toggleSelectConversation={toggleSelectConversation}
                disableActive={true}
              />
            </div>

            <div className="mt-3 flex gap-2 pt-3 border-t">
              <button
                className={`flex-1 px-4 py-2 rounded text-white ${
                  selectedIds.size
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed"
                }`}
                disabled={!selectedIds.size}
                onClick={sendForward}
              >
                Send
              </button>
              <button
                className="flex-1 px-4 py-2 border rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => {
                  onClose();
                  setSelectedConvos([]);
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
