import EmptyChatView from "./EmptyChatView";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "../Context/AuthContext";

export default function ChatWindow() {
  const { user } = useAuth();

  const activeChatUser = useChatStore((s) => s.activeChatUser);
  const setIsSidebarOpen = useUIStore((s) => s.setIsSidebarOpen);

  if (!activeChatUser) return <EmptyChatView />;
  return (
    <div className="flex-1 flex flex-col bg-gray-50  rounded-2xl shadow-inner overflow-hidden">
      <ChatHeader setIsSidebarOpen={setIsSidebarOpen} />

      <MessageList currentUserId={user.id} />

      <MessageInput />
    </div>
  );
}
