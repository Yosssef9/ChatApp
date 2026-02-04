import EmptyChatView from "./EmptyChatView";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  activeChatUser,
  messages,
  setMessages,
  user,
  typingUsers,
  onlineUsers,
  setIsSidebarOpen,
  usersInChat,
  socketRef,
  repliedMessage,
  setRepliedMessage,
  text,
  setText,
  sendMessage,
}) {
  if (!activeChatUser) return <EmptyChatView />;
  return (
    <div className="flex-1 flex flex-col bg-gray-50  rounded-2xl shadow-inner overflow-hidden">
      <ChatHeader
        setIsSidebarOpen={setIsSidebarOpen}
        activeChatUser={activeChatUser}
        onlineUsers={onlineUsers}
        usersInChat={usersInChat}
      />
      <MessageList
        socket={socketRef.current}
        messages={messages}
        setMessages={setMessages}
        currentUserId={user.id}
        activeChatUser={activeChatUser}
        isTyping={typingUsers[activeChatUser.id] || false}
        repliedMessage={repliedMessage}
        setRepliedMessage={setRepliedMessage}
      />
      <MessageInput
        socketRef={socketRef}
        repliedMessage={repliedMessage}
        setRepliedMessage={setRepliedMessage}
        text={text}
        onChange={(value) => setText(value)}
        onSend={sendMessage}
        conversationId={activeChatUser.id}
        to={activeChatUser.user.id}
      />
    </div>
  );
}
