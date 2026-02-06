import useRecentChats from "../hooks/useRecentChats";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  useRecentChats();

  return (
    <div className="flex h-screen gap-5 ">
      <Sidebar />

      <ChatWindow />
    </div>
  );
}
