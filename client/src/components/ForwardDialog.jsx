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

        // forward: النص مش مطلوب هنا لو السيرفر هيجيب النص من sourceMessageId
        text: " ", // 👈 مهم لو عندك validation text.trim() (هقولك تحسنها تحت)
        repliedMessage: null,
        type: "forward",

        // لازم كمان تبعت id بتاع الرسالة اللي بتعملها forward
        // هنضيفه في sendMessage function في الستور (الخطوة الجاية)
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
            className="fixed z-50 top-1/2 left-1/2 -translate-x-[50%]  sm:-translate-x-[10%] -translate-y-1/2 rounded-lg shadow-lg w-80 max-w-full p-5 bg-white"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex flex-col bg-white py-5 rounded-2xl gap-6 flex-1 min-h-0">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Forward to</div>
                <div className="text-sm text-gray-500">
                  Selected: {selectedConvos.length}
                </div>
              </div>
              {/* Search */}
              <SearchUsersInput
                searchInput={searchInput}
                setSearchInput={setSearchInput}
              />

              {/* Chat List */}

              <ChatList
                results={results}
                searchInput={searchInput}
                onClick={() => {}}
                isLoadingSearching={isLoadingSearching}
                selectedConversationIds={selectedIds} // ✅ NEW
                toggleSelectConversation={toggleSelectConversation} // ✅ NEW
                disableActive={true}
              />
            </div>

            {/* زر Cancel تحت */}
            <div className="flex gap-2 mt-3">
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
