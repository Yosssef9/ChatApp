import { Search, Ellipsis, SendHorizontal } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

import { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { io } from "socket.io-client";
import MessageInput from "../components/MessageInput";
import ChatItem from "../components/ChatItem";
import MessageList from "../components/MessageList";
import ChatList from "../components/ChatList";
import { Menu } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  console.log("user", user);
  const socketRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  console.log("typingUsers", typingUsers);
  const [searchInput, setSearchInput] = useState("");
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [recentChats, setRecentChats] = useState([]);
  console.log("activeChatUser:", activeChatUser);
  console.log("recentChats:", recentChats);
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchInput) {
        setResults([]);
        return;
      }
      try {
        const res = await api.get(`/users/searchUsers?q=${searchInput}`, {
          withCredentials: true,
        });
        setResults(res.data);
        console.log("searchUsers:", res);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    // debounce 300ms
    const timeoutId = setTimeout(fetchResults, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    socketRef.current.emit("user-online", user.id);

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (msg) => {
      // هل الرسالة تخص الشات المفتوح؟
      const isCurrentChat =
        activeChatUser &&
        (msg.from === activeChatUser.user.id ||
          msg.to === activeChatUser.user.id);

      if (isCurrentChat) {
        // أضف الرسالة للشات المفتوح فقط
        setMessages((prev) => [...prev, msg]);
      }
      // غير كده → ما تعرضهاش هنا
    };
    const socket = socketRef.current;
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [activeChatUser]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current || !activeChatUser) return;
    console.log("sendMessage activeChatUser :", activeChatUser);
    const msg = {
      from: user.id,
      to: activeChatUser.user.id,
      text,
    };
    console.log(msg);

    socketRef.current.emit("send-message", {
      msg,
      conversationId: activeChatUser.id,
    });
    setText("");
  };

  const getUserMessages = async (clickedConversation) => {
    clickedConversation.unSeenMsgsNumber = 0;
    console.log("clickedConversation", clickedConversation);
    setActiveChatUser(clickedConversation);
    socketRef.current.emit("join-conversation", {
      conversationId: clickedConversation.id,
      userId: user.id,
      otherUserId: clickedConversation.user.id,
    });
    try {
      const res = await api.get(
        `/messages/getMessages?from=${user.id}&to=${clickedConversation.user.id}`,
        {
          withCredentials: true,
        }
      );
      console.log("getUSerMessages res", res);
      setMessages(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Cleanup function will leave the previous conversation
    return () => {
      if (activeChatUser?.id) {
        socket.emit("leave-conversation", {
          conversationId: activeChatUser.id,
        });
        console.log("Left conversation", activeChatUser.id);
      }
    };
  }, [activeChatUser]);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const res = await api.get("/users/getRecentChatsUsers", {
          withCredentials: true,
        });
        setRecentChats(res.data);
        console.log("setRecentChats res", res);
      } catch (err) {
        console.error("Failed to fetch recent chats:", err);
      }
    };
    fetchRecentChats();
  }, []);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) return;

    socket.on("conversation-updated", (updatedConvo) => {
      console.log("unSeenMsgsNumber", updatedConvo.unSeenMsgsNumber);
      setRecentChats((prev) => {
        const exists = prev.find((c) => c.id === updatedConvo.id);
        if (exists) {
          // حدث الشات الموجود
          return prev.map((c) => (c.id === updatedConvo.id ? updatedConvo : c));
        } else {
          // أضف الشات الجديد إذا مش موجود
          return [updatedConvo, ...prev];
        }
      });
    });

    return () => {
      socket.off("conversation-updated");
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) return;

    socket.on("messages-seen", ({ conversationId }) => {
      if (conversationId !== activeChatUser?.id) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.from === user.id ? { ...msg, isSeen: true } : msg
        )
      );
    });

    return () => socket.off("messages-seen");
  }, [user.id, activeChatUser]);
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleTyping = ({ conversationId }) => {
      console.log("handleTyping conversationId", conversationId);
      setTypingUsers((prev) => ({ ...prev, [conversationId]: true }));
      console.log("handleTyping typingUsers", typingUsers);
    };

    const handleStopTyping = ({ conversationId }) => {
      console.log("handleStopTyping conversationId", conversationId);

      setTypingUsers((prev) => ({ ...prev, [conversationId]: false }));
      console.log("handleStopTyping typingUsers", typingUsers);
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, []);

  return (
    <div className="flex h-screen gap-5 ">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={`
    fixed md:static z-40
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
          className="md:hidden self-end p-2 hover:bg-gray-200 rounded-lg"
          onClick={() => setIsSidebarOpen(false)}
        >
          ✕
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <img
            src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
            alt=""
            className="h-16"
          />
          <h1 className="font-bold">{user.username}</h1>
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
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Search..."
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
          />
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChatUser ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gray-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-300"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>

              <img
                src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
                className="h-16"
              />
              <h1 className="font-bold">{activeChatUser.user.username}</h1>
            </div>

            <Ellipsis />
          </div>

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId={user.id}
            isTyping={typingUsers[activeChatUser.id] || false}
          />

          {/* Input at bottom */}
          <MessageInput
            text={text}
            onChange={(value) => setText(value)}
            onSend={sendMessage}
            socketRef={socketRef}
            conversationId={activeChatUser.id}
            to={activeChatUser.user.id}
          />
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center">
          select user to start chat
        </div>
      )}
    </div>
  );
}
