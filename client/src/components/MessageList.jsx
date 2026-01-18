import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import MessageBubble from "./MessageBubble";
import TypingDots from "./TypingDots";
import { EMOJI_TO_REACTION } from "../Constants/reactions.js";

export default function MessageList({
  socket,
  messages,
  setMessages,
  activeChatUser,
  currentUserId,
  isTyping,
}) {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const [openPickerId, setOpenPickerId] = useState(null);

  const emojis = Object.keys(EMOJI_TO_REACTION);

  const handleEmojiClick = (msgId, emoji) => {
    const reactionName = EMOJI_TO_REACTION[emoji];
    if (!reactionName) return;

    socket.emit("send-reaction", {
      messageId: msgId,
      type: reactionName,
      userId: user.id,
      conversationId: activeChatUser.id,
      reciverId: activeChatUser.user.id,
    });

    setOpenPickerId(null);
  };

  useEffect(() => {
    socket.on("reaction-updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
      );
    });

    return () => socket.off("reaction-updated");
  }, [socket, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isMine={msg.from === currentUserId}
          isFirstMessage={i === 0}
          isPickerOpen={openPickerId === msg.id}
          openPicker={setOpenPickerId}
          emojis={emojis}
          onReact={handleEmojiClick}
        />
      ))}

      {isTyping && <TypingDots />}
      <div ref={bottomRef} />
    </div>
  );
}
