import { BsCheck2, BsCheck2All } from "react-icons/bs";
import TypingDots from "./TypingDots";
import { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUserId, isTyping }) {
  console.log("messages", messages);
  console.log("isTyping", isTyping);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
      {messages.map((msg) => {
        const isMine = msg.from === currentUserId;
        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs wrap-break-word whitespace-pre-wrap ${
                isMine ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              <p>{msg.text}</p>
              <div className="flex items-center justify-end gap-1 ">
                {/* ✅ Seen / Delivered indicator */}
                {isMine && (
                  <span
                    className={`${
                      msg.isSeen ? "text-cyan-300" : "text-white/60"
                    } text-base `}
                  >
                    {msg.isSeen ? <BsCheck2All /> : <BsCheck2 />}
                  </span>
                )}
                <span className="text-gray-300 text-xs">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      {isTyping && <TypingDots />}
      <div ref={bottomRef} />
    </div>
  );
}
