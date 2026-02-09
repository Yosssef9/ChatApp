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
import { FiCornerUpRight, FiEdit2 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { BiReply } from "react-icons/bi"; // مثال

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
  const openEdit = useChatStore((s) => s.openEdit);

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
          onPointerDown={() => setShowArrow(true)}
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
            className={`p-2 rounded-lg max-w-xs relative  ${
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
                      icon: <BiReply />,

                      onClick: () => setRepliedMessage(msg),
                    },
                    ...(isMine && !isHiddenOrDeleted
                      ? [
                          {
                            label: "Edit",
                            icon: <FiEdit2 />,
                            onClick: () => {
                              openEdit(msg);
                            },
                          },
                        ]
                      : []),

                    {
                      label: "Forward",
                      icon: <FiCornerUpRight />,

                      onClick: () => openForward(msg.id),
                    },
                    {
                      label: "Delete",
                      icon: <MdDelete />,
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
            <div className="flex items-center justify-end gap-2 text-xs">
              {msg.isEdited && !isHiddenOrDeleted && (
                <span
                  className={`text-sm ${isMine ? "text-white/70" : "text-gray-500"}`}
                >
                  edited
                </span>
              )}
              <div className="flex items-center gap-1">
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
        onClick={(e) => {
          e.stopPropagation(); // ✅ مهم
          openPicker(isPickerOpen ? null : msgId);
        }}
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
      initial={{ opacity: 0, scale: 0.96, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -6 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className={[
        "absolute z-[9999] w-44 bg-white rounded-xl shadow-xl overflow-hidden",
        "border border-gray-100",
        "backdrop-blur-sm",
        isFirstOrSecondMessage ? "top-full mt-2" : "bottom-full mb-2",
        isMine ? "right-2" : "left-2",
      ].join(" ")}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((option, idx) => {
        const isDelete = option.label === "Delete";

        return (
          <button
            key={option.label}
            type="button"
            className={[
              "w-full flex items-center justify-between gap-3 cursor-pointer",
              "px-3 py-2 text-sm",
              "transition",
              "focus:outline-none focus:bg-gray-100",
              isDelete
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-700 hover:bg-gray-100",
              idx !== options.length - 1 ? "border-b border-gray-100" : "",
            ].join(" ")}
            onClick={() => {
              option.onClick?.();
              onClose?.();
            }}
          >
            <span className="font-medium">{option.label}</span>

            {option.icon && (
              <span className="text-base opacity-80">{option.icon}</span>
            )}
          </button>
        );
      })}
    </motion.div>
  );
};
