import { Search, Ellipsis, X } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";

import { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { io } from "socket.io-client";
import MessageInput from "../components/MessageInput";
import ChatItem from "../components/ChatItem";
import MessageList from "../components/MessageList";
import ChatList from "../components/ChatList";
import { Menu } from "lucide-react";
import useUserSearch from "../hooks/useUserSearch";
import useChatSocket from "../hooks/useChatSocket";
export default function Home() {
  const { user } = useAuth();
  console.log("user", user);
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  const [searchInput, setSearchInput] = useState("");

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
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl text-white">
            <div className="flex items-center gap-2">
              <button
                aria-label="Open sidebar"
                onClick={() => setIsSidebarOpen(true)}
                className="
    md:hidden
    p-2
    z-50
    rounded-full
    text-white
    hover:bg-gray-200
    hover:text-gray-400
    focus:outline-none
    focus:ring-2
    focus:ring-gray-300
    transition
    duration-200
    active:scale-95
  "
              >
                <Menu size={22} />
              </button>
              <div className="relative">
                <img
                  src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
                  className="h-16 w-16 rounded-full border-2 border-white"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 ${
                    onlineUsers.has(activeChatUser.user.id)
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }  border-2 border-border-white rounded-full`}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="font-semibold text-white">
                  {activeChatUser.user.username}
                </h1>

                <AnimatePresence>
                  {usersInChat[activeChatUser.id] && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="text-xs text-green-300"
                    >
                      Viewing chat
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Ellipsis />
          </div>

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
            repliedMessage={repliedMessage}
            setRepliedMessage={setRepliedMessage}
            text={text}
            onChange={(value) => setText(value)}
            onSend={sendMessage}
            socketRef={socketRef}
            conversationId={activeChatUser.id}
            to={activeChatUser.user.id}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <img
                src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
                className="h-24 w-24 opacity-70"
              />
              <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Chat
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-700">
              Start a conversation
            </h2>

            <p className="text-sm text-gray-500 max-w-xs">
              Select a user from the left panel to view messages or send a new
              one
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
