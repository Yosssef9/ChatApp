import { useRef, useState } from "react";
import { IoMdHappy, IoIosArrowDown } from "react-icons/io";
import { BsCheck2, BsCheck2All } from "react-icons/bs";
import { AnimatePresence } from "framer-motion";
import EmojiPicker from "./EmojiPicker";
import ReactionsBar from "./ReactionsBar";
import { useClickOutside } from "../hooks/useClickOutside";
import { useAuth } from "../Context/AuthContext";
import { motion } from "framer-motion";

export default function MessageBubble({
  msg,
  isMine,
  isFirstMessage,
  isPickerOpen,
  openPicker,
  emojis,
  onReact,
}) {
  const pickerRef = useRef(null);
  const { user } = useAuth();

  useClickOutside(pickerRef, () => openPicker(null));
  const myReaction = msg.reactions.find((r) => r.user === user.id);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex group ${
        isMine ? "justify-end" : "justify-start"
      } relative`}
    >
      <div className="flex flex-col">
        <div className=" flex">
          {/* Emoji button (isMine) */}
          {isMine && (
            <EmojiButton
              isPickerOpen={isPickerOpen}
              msgId={msg.id}
              openPicker={openPicker}
            />
          )}
          {/* Message bubble */}
          <div
            className={`p-2 rounded-lg max-w-xs relative ${
              isMine ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Arrow */}
            <MsgArrow isMine={isMine} isHovered={isHovered} />

            <p>{msg.text}</p>

            <div className="flex justify-end gap-1 text-xs">
              {isMine && (
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
          {!isMine && (
            <EmojiButton
              isPickerOpen={isPickerOpen}
              msgId={msg.id}
              openPicker={openPicker}
            />
          )}
        </div>

        {/* Reactions */}
        <ReactionsBar reactions={msg.reactions} isMine={isMine} />
      </div>

      {/* Emoji Picker */}

      <AnimatePresence>
        {isPickerOpen && (
          <EmojiPicker
            ref={pickerRef}
            emojis={emojis}
            isMine={isMine}
            myReaction={myReaction}
            isFirstMessage={isFirstMessage}
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

const MsgArrow = ({ isMine, isHovered }) => (
  <AnimatePresence>
    {isHovered && (
      <motion.span
        initial={{ opacity: 0, y: -4, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`absolute top-1 left-1 ${
          isMine ? "text-white" : "text-gray-700"
        } cursor-pointer z-10`}
      >
        <IoIosArrowDown size={16} />
      </motion.span>
    )}
  </AnimatePresence>
);
