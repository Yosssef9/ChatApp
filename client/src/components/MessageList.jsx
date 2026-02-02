import { useEffect, useRef, useState } from "react";
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
  setRepliedMessage,
}) {
  const bottomRef = useRef(null);
  const [openPickerId, setOpenPickerId] = useState(null);
  console.log("MessageList socket", socket);

  const emojis = Object.keys(EMOJI_TO_REACTION);

  const handleEmojiClick = (msgId, emoji) => {
    if (!socket || !activeChatUser) return;

    const reactionName = EMOJI_TO_REACTION[emoji];
    if (!reactionName) return;

    socket.emit("send-reaction", {
      messageId: msgId,
      type: reactionName,
      userId: currentUserId,
      conversationId: activeChatUser.id,
    });

    setOpenPickerId(null);
  };

  const handleDeleteMsg = (msgId, type) => {
    if (!socket || !activeChatUser) return;

    socket.emit("delete-msg", {
      messageId: msgId,
      type,
      conversationId: activeChatUser.id,
    });
  };

  useEffect(() => {
    if (!socket) return;

    const onReactionUpdated = (updatedMessage) => {
      console.log("onReactionUpdated updatedMessage", updatedMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
      );
    };

    socket.on("reaction-updated", onReactionUpdated);
    return () => socket.off("reaction-updated", onReactionUpdated);
  }, [socket, setMessages]);

  useEffect(() => {
    if (!socket) return;

    const onMessageDeleted = ({ message }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m)),
      );
    };

    socket.on("message-deleted", onMessageDeleted);
    return () => socket.off("message-deleted", onMessageDeleted);
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
          isFirstOrSecondMessage={i === 0 || i === 1}
          isPickerOpen={openPickerId === msg.id}
          openPicker={setOpenPickerId}
          emojis={emojis}
          onReact={handleEmojiClick}
          onDeleteMsg={handleDeleteMsg}
          setRepliedMessage={setRepliedMessage}
        />
      ))}

      {isTyping && <TypingDots />}
      <div ref={bottomRef} />
    </div>
  );
}
