import ChatItem from "./ChatItem";

export default function ChatList({
  recentChats,
  results,
  searchInput,
  activeChatUser,
  getUserMessages,
  typingUsers,
}) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden ">
      {searchInput.length === 0 ? (
        recentChats.length > 0 ? (
          recentChats.map((conversation) => (
            <ChatItem
              key={conversation.user.id}
              conversation={conversation}
              onClick={getUserMessages}
              isActive={conversation.user.id === activeChatUser?.user?.id}
              isTyping={typingUsers[conversation.id] || false}
            />
          ))
        ) : (
          <div>No recent chats</div>
        )
      ) : results.length > 0 ? (
        results.map((conversation) => (
          <ChatItem
            key={conversation.user.id}
            conversation={conversation}
            onClick={getUserMessages}
            isActive={conversation.user.id === activeChatUser?.id}
            isTyping={typingUsers[conversation.id] || false}
          />
        ))
      ) : (
        <div>No users found</div>
      )}
    </div>
  );
}
