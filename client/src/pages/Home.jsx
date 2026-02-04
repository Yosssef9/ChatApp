import { Search, X } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";

import { useState, useEffect, useRef } from "react";
import api from "../api/api";
import MessageInput from "../components/MessageInput";
import MessageList from "../components/MessageList";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import EmptyChatView from "../components/EmptyChatView";
import useUserSearch from "../hooks/useUserSearch";
import useChatSocket from "../hooks/useChatSocket";
export default function Home() {
  const { user } = useAuth();
  console.log("user", user);
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  const [searchInput, setSearchInput] = useState("");
  const messageListRef = useRef(null);

  const socketRef = useRef(null);

  // UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState(null);

  // chat states
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [recentChats, setRecentChats] = useState([]);
  const [isLoadingRecentChats, setIsLoadingRecentChats] = useState(false);
  const [repliedMessage, setRepliedMessage] = useState(null);

  // // ✅ search hook
  const { results, isLoadingSearching } = useUserSearch(searchInput, 300);

  // // ✅ socket hook (كل السوكيت هنا)
  const {
    onlineUsers,
    typingUsers,
    usersInChat,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
  } = useChatSocket({
    userId: user?.id,
    socketUrl,
    activeChatUser,
    setMessages,
    setRecentChats,
    socketRef,
  });
  // ✅ fetch recent chats (لسه API مش سوكيت)
  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        setIsLoadingRecentChats(true);
        const res = await api.get("/users/getRecentChatsUsers", {
          withCredentials: true,
        });
        setRecentChats(res.data);
      } catch (err) {
        console.error("Failed to fetch recent chats:", err);
      } finally {
        setIsLoadingRecentChats(false);
      }
    };

    fetchRecentChats();
  }, []);

  // ✅ send message (صار صغير)
  const sendMessage = () => {
    if (!activeChatUser) return;

    socketSendMessage({
      toUserId: activeChatUser.user.id,
      conversationId: activeChatUser.id,
      text,
      repliedMessage,
    });

    setText("");
    setRepliedMessage(null);
  };

  // ✅ open chat + fetch messages
  const getUserMessages = async (clickedConversation) => {
    // ✅ صح: صفّر unseen في recentChats
    setRecentChats((prev) =>
      prev.map((c) =>
        c.id === clickedConversation.id ? { ...c, unSeenMsgsNumber: 0 } : c,
      ),
    );

    setRepliedMessage(null);
    setActiveChatUser(clickedConversation);

    if (window.innerWidth < 768) setIsSidebarOpen(false);
    setTimeout(() => {
      messageListRef.current?.scrollToBottom();
    }, 50); // small delay to wait for messages to render
    // ✅ join conversation via hook
    joinConversation({
      conversationId: clickedConversation.id,
      otherUserId: clickedConversation.user.id,
    });

    // ✅ fetch messages via API
    try {
      const res = await api.get(
        `/messages/getMessages?from=${user.id}&to=${clickedConversation.user.id}`,
        { withCredentials: true },
      );
      console.log("getUserMessages res", res);
      setMessages(res.data);
    } catch (err) {
      console.error("getMessages error:", err);
    }
  };

  // ✅ leave conversation لما activeChatUser يتغير أو الصفحة تتقفل
  useEffect(() => {
    return () => {
      if (activeChatUser?.id) {
        leaveConversation({
          conversationId: activeChatUser.id,
          otherUserId: activeChatUser.user.id,
        });
      }
    };
  }, [activeChatUser, leaveConversation]);

  const sideBarHandlers = useSwipeable({
    onSwipedRight: () => setIsSidebarOpen(true),
    onSwipedLeft: () => setIsSidebarOpen(false),
    trackTouch: true,
    delta: 25, // المسافة المطلوبة للسحب
    preventDefaultTouchmoveEvent: true, // يمنع scroll أثناء السحب
  });

  return (
    <div className="flex h-screen gap-5 ">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Invisible swipe area for opening */}
      {!isSidebarOpen && (
        <div
          {...sideBarHandlers}
          className="fixed top-0 left-0 z-40 h-screen w-24"
        />
      )}
      {/* Sidebar */}
      <div
        {...sideBarHandlers}
        className={`
    fixed md:static z-51
    flex flex-col p-4 gap-5
    h-screen
    bg-gray-100
    transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    sm:w-72 md:w-96
  `}
      >
        {/* ❌ Close Button (Mobile only) */}
        <button
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="
    md:hidden
    self-end
    p-2
    rounded-full
    text-gray-600
    hover:bg-gray-200
    hover:text-gray-900
    focus:outline-none
    focus:ring-2
    focus:ring-gray-300
    transition
    duration-200
    active:scale-95
  "
        >
          <X size={20} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-blue-700 p-3 rounded-xl shadow-md">
          <div className="relative">
            <img
              src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
              className="h-14 w-14 rounded-full border-2 border-white"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <h1 className="text-white font-semibold">{user.username}</h1>
        </div>

        {/* Search + Chat List */}
        <div className="flex flex-col bg-white py-5 rounded-2xl gap-6 flex-1 min-h-0">
          {/* Search */}
          <div className="relative w-full max-w-sm p-4">
            <Search
              size={18}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none
             placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
             transition-shadow duration-200 hover:shadow-sm"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Chat List */}

          <ChatList
            recentChats={recentChats}
            results={results}
            searchInput={searchInput}
            activeChatUser={activeChatUser}
            getUserMessages={getUserMessages}
            typingUsers={typingUsers}
            isLoadingSearching={isLoadingSearching}
            isLoadingRecentChats={isLoadingRecentChats}
            onlineUsersMap={onlineUsers}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChatUser ? (
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
      ) : (
        <EmptyChatView />
      )}
    </div>
  );
}
