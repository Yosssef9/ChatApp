import { useRef, useState } from "react";
import { IoMdHappy, IoIosArrowDown } from "react-icons/io";
import { BsCheck2, BsCheck2All } from "react-icons/bs";
import { AnimatePresence } from "framer-motion";
import EmojiPicker from "./EmojiPicker";
import ReactionsBar from "./ReactionsBar";
import { useClickOutside } from "../hooks/useClickOutside";
import { useAuth } from "../Context/AuthContext";
import { motion } from "framer-motion";
import { useChatStore } from "@/store/chatStore";

import { FiCornerUpRight } from "react-icons/fi";

export default function MessageBubble({
  msg,
  isMine,
  isFirstOrSecondMessage,
  isPickerOpen,
  openPicker,
  emojis,
  onReact,
  // onDeleteMsg,
  // setRepliedMessage,
  scrollToMessage,
}) {
  // console.log("MessageBubble msg", msg);
  const pickerRef = useRef(null);
  const { user } = useAuth();
  const setRepliedMessage = useChatStore((s) => s.setRepliedMessage);

  useClickOutside(pickerRef, () => openPicker(null));
  const myReaction = msg.reactions.find((r) => r.user === user.id);
  const [showArrow, setShowArrow] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isHiddenForMe = msg.hiddenFor.some((userId) => userId === user.id);
  const isHiddenOrDeleted = msg.isDeleted || isHiddenForMe;
  const openForward = useChatStore((s) => s.openForward);
  const openDelete = useChatStore((s) => s.openDelete);

  return (
    <div
      className={`flex group ${
        isMine ? "justify-end" : "justify-start"
      } relative`}
    >
      <div className="flex flex-col">
        <div
          className="flex"
          onMouseEnter={() => setShowArrow(true)}
          onMouseLeave={() => setShowArrow(false)}
        >
          {/* Emoji button (isMine) */}
          {isMine && !isHiddenOrDeleted && (
            <EmojiButton
              isPickerOpen={isPickerOpen}
              msgId={msg.id}
              openPicker={openPicker}
            />
          )}
          {/* Message bubble */}
          <div
            className={`p-2 rounded-lg max-w-xs relative z-0 ${
              isMine ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setShowArrow(true)}
          >
            {/* Context Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <ContextMenu
                  isMine={isMine}
                  isFirstOrSecondMessage={isFirstOrSecondMessage}
                  onClose={() => setIsMenuOpen(false)}
                  options={[
                    {
                      label: "Reply",
                      onClick: () => setRepliedMessage(msg),
                    },
                    {
                      label: "Forward",
                      onClick: () => openForward(msg.id),
                    },
                    {
                      label: "Delete",
                      onClick: () => openDelete(msg.id, isMine),
                    },
                  ]}
                />
              )}
            </AnimatePresence>

            {/* Replied message */}
            {msg.repliedMessage && (
              <div
                className={`mb-2 p-2 rounded-md cursor-pointer flex flex-col gap-1 text-xs
      ${
        isMine
          ? "bg-blue-100/70 border-r-4 border-blue-600"
          : "bg-gray-100 border-l-4 border-gray-400"
      }
      hover:opacity-90 transition`}
                onClick={() => {
                  if (scrollToMessage) scrollToMessage(msg.repliedMessage.id);
                }}
              >
                {/* Sender */}
                <span
                  className={`font-semibold ${
                    isMine ? "text-blue-700" : "text-gray-600"
                  }`}
                >
                  {isMine ? "You" : msg.repliedMessage.senderName || "User"}
                </span>

                {/* Text */}
                <span className="text-gray-700 truncate max-w-[220px]">
                  {msg.repliedMessage.text}
                </span>
              </div>
            )}
            {/* Forward label */}
            {msg.forwardedMessage && !isHiddenOrDeleted && (
              <div
                className={`text-[11px] mb-1 flex items-center gap-1 opacity-80
      ${isMine ? "text-white/80" : "text-gray-600"}
    `}
              >
                <FiCornerUpRight size={12} />
                <span className="italic">Forwarded</span>

                {/* {msg.forwardedFrom?.username && (
                  <span className="italic">
                    from {msg.forwardedFrom.username}
                  </span>
                )} */}
              </div>
            )}

            {/* Main message text */}
            {isHiddenOrDeleted ? (
              <p className="italic text-gray-400">This message was deleted</p>
            ) : (
              <p className="break-words max-w-[220px]">{msg.text}</p>
            )}
            {/* Arrow */}
            {!isHiddenOrDeleted && (
              <MsgArrow
                isMine={isMine}
                showArrow={showArrow || isMenuOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
              />
            )}
            <div className="flex justify-end gap-1 text-xs">
              {isMine && !isHiddenOrDeleted && (
                <span
                  className={msg.isSeen ? "text-cyan-300" : "text-white/60"}
                >
                  {msg.isSeen ? <BsCheck2All /> : <BsCheck2 />}
                </span>
              )}
              <span className="text-gray-300">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          {/* Emoji button (!isMine) */}
          {!isMine && !isHiddenOrDeleted && (
            <EmojiButton
              isPickerOpen={isPickerOpen}
              msgId={msg.id}
              openPicker={openPicker}
            />
          )}
        </div>

        {/* Reactions */}
        {!isHiddenOrDeleted && (
          <ReactionsBar reactions={msg.reactions} isMine={isMine} />
        )}
      </div>

      {/* Emoji Picker */}

      <AnimatePresence>
        {isPickerOpen && !isHiddenOrDeleted && (
          <EmojiPicker
            ref={pickerRef}
            emojis={emojis}
            isMine={isMine}
            myReaction={myReaction}
            isFirstOrSecondMessage={isFirstOrSecondMessage}
            onSelect={(emoji) => onReact(msg.id, emoji)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
const EmojiButton = ({ isPickerOpen, msgId, openPicker }) => {
  return (
    <span className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out mx-2 flex items-center cursor-pointer">
      <IoMdHappy
        size={22}
        onClick={() => openPicker(isPickerOpen ? null : msgId)}
      />
    </span>
  );
};

const MsgArrow = ({ isMine, showArrow, onClick }) => (
  <AnimatePresence>
    {showArrow && (
      <motion.span
        initial={{ opacity: 0, y: -4, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`absolute top-1  ${
          isMine ? "text-white left-1" : "text-gray-700 right-1"
        } cursor-pointer z-50`}
        onClick={onClick}
      >
        <IoIosArrowDown size={16} />
      </motion.span>
    )}
  </AnimatePresence>
);

// Context Menu
const ContextMenu = ({ onClose, options, isMine, isFirstOrSecondMessage }) => {
  const ref = useRef(null);

  // Close menu when clicking outside
  useClickOutside(ref, onClose);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -5 }}
      transition={{ duration: 0.15 }}
      className={`absolute ${isFirstOrSecondMessage ? "top-full mt-2" : "bottom-full mb-2"} z-[9999] w-36 bg-white rounded-md shadow-lg overflow-hidden pointer-events: auto;
        ${isMine ? "right-16" : "left-0"}`}
      // style={{ outline: "1px solid black" }}
    >
      {options.map((option) => {
        const isDelete = option.label === "Delete";
        return (
          <div
            key={option.label}
            className={`px-4 py-2 text-sm cursor-pointer ${
              isDelete
                ? "text-red-500 hover:bg-red-100"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              option.onClick();
              onClose();
            }}
          >
            {option.label}
          </div>
        );
      })}
    </motion.div>
  );
};
