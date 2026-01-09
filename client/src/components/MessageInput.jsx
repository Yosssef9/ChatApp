import { SendHorizontal } from "lucide-react";
import { useRef, useEffect } from "react";

export default function MessageInput({
  text,
  onChange,
  onSend,
  conversationId,
  to,
  socketRef,
}) {
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
        maxHeight
      )}px`;

      // لو النص أقل من سطر واحد، نمنع Scroll
      textareaRef.current.style.overflowY =
        scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [text]);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);

    // user started typing
    socketRef.current.emit("typing", { conversationId, to });

    // reset stop-typing timer
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop-typing", { conversationId, to });
    }, 1000);
  };

  return (
    <div className="relative w-full p-4 bg-gray-100">
      <button
        type="button"
        onClick={onSend}
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
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
        rows={1} // يبان كسطر واحد في البداية
      />
    </div>
  );
}
