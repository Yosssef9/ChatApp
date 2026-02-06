import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import TypingDots from "./TypingDots";
import { EMOJI_TO_REACTION } from "../Constants/reactions.js";
import { useChatStore } from "@/store/chatStore";

export default function MessageList({
  // socket,
  // messages,
  // setMessages,
  // activeChatUser,
  currentUserId,
  // isTyping,
  // setRepliedMessage,
}) {
  const messageRefs = useRef({});
  const messages = useChatStore((s) => s.messages);
  const socket = useChatStore((s) => s.socket);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const activeChatUser = useChatStore((s) => s.activeChatUser);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const isTyping = typingUsers[activeChatUser.id];
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
      // setMessages((prev) =>
      //   prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
      // );
      console.log("onReactionUpdated updatedMessage", updatedMessage);

      updateMessage(updatedMessage);
    };

    socket.on("reaction-updated", onReactionUpdated);
    return () => socket.off("reaction-updated", onReactionUpdated);
  }, [socket, updateMessage]);

  useEffect(() => {
    if (!socket) return;

    const onMessageDeleted = ({ updatedMessage }) => {
      // setMessages((prev) =>
      //   prev.map((m) => (m.id === message.id ? message : m)),
      // );
      console.log("onMessageDeleted updatedMessage", updatedMessage);
      updateMessage(updatedMessage);
    };

    socket.on("message-deleted", onMessageDeleted);
    return () => socket.off("message-deleted", onMessageDeleted);
  }, [socket, updateMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
      {messages.map((msg, i) => (
        <div key={msg.id} ref={(el) => (messageRefs.current[msg.id] = el)}>
          <MessageBubble
            msg={msg}
            isMine={msg.from === currentUserId}
            isFirstOrSecondMessage={i === 0 || i === 1}
            isPickerOpen={openPickerId === msg.id}
            openPicker={setOpenPickerId}
            emojis={emojis}
            onReact={handleEmojiClick}
            onDeleteMsg={handleDeleteMsg}
            // setRepliedMessage={setRepliedMessage}
            scrollToMessage={(repliedId) => {
              const el = messageRefs.current[repliedId];
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                // Optional: highlight briefly
                el.classList.add(
                  "bg-gray-200",
                  "transition-colors",
                  "duration-1000",
                );

                setTimeout(() => {
                  el.classList.remove("bg-gray-200");
                }, 500);
              }
            }}
          />
        </div>
      ))}

      {isTyping && <TypingDots />}
      <div ref={bottomRef} />
    </div>
  );
}
