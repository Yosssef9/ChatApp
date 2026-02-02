import { forwardRef } from "react";
import { motion } from "framer-motion";
import { REACTION_TO_EMOJI } from "../Constants/reactions.js";

const EmojiPicker = forwardRef(
  ({ emojis, onSelect, isMine, isFirstOrSecondMessage, myReaction }, ref) => {
    const selectedEmoji = myReaction
      ? REACTION_TO_EMOJI[myReaction.type]
      : null;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute z-40 flex gap-2 p-2 bg-white shadow rounded-lg
          ${isFirstOrSecondMessage ? "top-full mt-2" : "bottom-full mb-2"}
          ${isMine ? "right-0" : "left-0"}
        `}
      >
        {emojis.map((emoji) => {
          const isSelected = emoji === selectedEmoji;
          return (
            <motion.span
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`cursor-pointer text-xl p-1 rounded-full transition ${
                isSelected
                  ? "bg-blue-100 ring-2 ring-blue-400"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </motion.span>
          );
        })}
      </motion.div>
    );
  },
);

export default EmojiPicker;
