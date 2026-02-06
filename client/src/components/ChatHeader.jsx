import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Ellipsis } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

export default function ChatHeader({
  setIsSidebarOpen,
  // activeChatUser,
  // onlineUsers,
  // usersInChat,
}) {
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const usersInChat = useChatStore((s) => s.usersInChat);
  const activeChatUser = useChatStore((s) => s.activeChatUser);
  const isOnline = !!onlineUsers[activeChatUser.user.id];

  return (
    <>
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
                isOnline ? "bg-green-500" : "bg-gray-400"
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
    </>
  );
}
