import { AnimatePresence, motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuth } from "../Context/AuthContext";

export default function MessageInput() {
  const { user } = useAuth();
  const [text, setText] = useState("");

  const repliedMessage = useChatStore((s) => s.repliedMessage);
  const socket = useChatStore((s) => s.socket);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const setRepliedMessage = useChatStore((s) => s.setRepliedMessage);
  const activeChatUser = useChatStore((s) => s.activeChatUser);
  const conversationId = activeChatUser.id;
  const to = activeChatUser.user.id;

  const textareaRef = useRef(null);
  const lineHeight = 24; // تقريباً ارتفاع السطر الواحد بالـ px
  const maxLines = 4; // الحد الأقصى

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset
      const scrollHeight = textareaRef.current.scrollHeight;

      // نحسب ارتفاع أقصى
      const maxHeight = lineHeight * maxLines;

      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight,
      )}px`;

      // لو النص أقل من سطر واحد، نمنع Scroll
      textareaRef.current.style.overflowY =
        scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [text]);
  const typingTimeoutRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);
  const handleChange = (e) => {
    setText(e.target.value);

    // user started typing
    socket?.emit("typing", { conversationId, to });

    // reset stop-typing timer
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop-typing", { conversationId, to });
    }, 1000);
  };
  const handleSend = () => {
    if (!conversationId || !to) return;

    sendMessage({
      fromUserId: user?.id,
      toUserId: to,
      conversationId,
      text,
      repliedMessage,
    });

    setText(""); // ✅ UI يمسح النص
    setRepliedMessage(null); // ✅ UI يمسح الرد
  };
  return (
    <div className="relative w-full p-4 bg-gray-100">
      {/* Reply box */}
      <AnimatePresence>
        {repliedMessage && (
          <motion.div
            key={repliedMessage.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-2 p-2 rounded-xl bg-gray-200 border-l-4 border-blue-400 flex justify-between items-start"
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-600 font-semibold">
                {repliedMessage.from.username}
              </span>
              <span className="text-sm text-gray-800 truncate max-w-xs">
                {repliedMessage.text}
              </span>
            </div>
            <button
              className="text-gray-400 ml-2 hover:text-gray-600"
              onClick={() => setRepliedMessage(null)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative w-full"
      >
        <button
          type="button"
          onClick={handleSend}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400 cursor-pointer"
        >
          <SendHorizontal size={18} />
        </button>
        <textarea
          ref={textareaRef}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-4 pr-10 text-sm outline-none resize-none break-words"
          placeholder="Type a message..."
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1} // يبان كسطر واحد في البداية
        />
      </motion.div>
    </div>
  );
}
