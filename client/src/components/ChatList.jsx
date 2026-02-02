import ChatItem from "./ChatItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatList({
  recentChats,
  results,
  searchInput,
  activeChatUser,
  getUserMessages,
  typingUsers,
  isLoadingSearching,
  isLoadingRecentChats,
  onlineUsersMap,
}) {
  const renderChats = (chats) =>
    chats.map((conversation) => (
      <motion.div
        key={conversation.user.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        layout
      >
        <ChatItem
          key={conversation.user.id}
          conversation={conversation}
          onClick={getUserMessages}
          isActive={conversation.user.id === activeChatUser?.user?.id}
          isTyping={typingUsers[conversation.id] || false}
          isOnline={onlineUsersMap.has(conversation.user.id)}
        />
      </motion.div>
    ));

  const isLoading =
    isLoadingSearching || (searchInput.length === 0 && isLoadingRecentChats);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
      <AnimatePresence>
        {searchInput.length === 0 ? (
          recentChats.length > 0 ? (
            renderChats(recentChats)
          ) : (
            <div className="text-gray-400 text-center py-2">
              No recent chats
            </div>
          )
        ) : results.length > 0 ? (
          renderChats(results)
        ) : (
          <div className="text-gray-400 text-center py-2">No users found</div>
        )}
      </AnimatePresence>
    </div>
  );
}
