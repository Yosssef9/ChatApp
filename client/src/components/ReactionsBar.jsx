import { motion, AnimatePresence } from "framer-motion";
import { REACTION_TO_EMOJI } from "../Constants/reactions.js";

export default function ReactionsBar({ reactions = [], isMine }) {
  if (!reactions.length) return null;

  // نفس groupReactions اللي كنت عامله
  const groupReactions = () => {
    const map = {};

    reactions.forEach((r) => {
      if (!map[r.type]) {
        map[r.type] = {
          emoji: REACTION_TO_EMOJI[r.type],
          count: 1,
        };
      } else {
        map[r.type].count += 1;
      }
    });

    return Object.values(map);
  };

  return (
    <AnimatePresence>
      {reactions.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`flex gap-1 mt-1 ${
            isMine ? "justify-end " : "justify-start"
          }`}
        >
          {groupReactions().map((r) => (
            <motion.div
              key={r.emoji}
              layout
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full shadow text-sm"
            >
              <span>{r.emoji}</span>

              {r.count > 1 && (
                <motion.span
                  key={r.count}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="text-xs text-gray-600"
                >
                  {r.count}
                </motion.span>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
