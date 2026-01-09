import { motion } from "framer-motion";

export default function TypingDots() {
  const dotVariants = {
    animate: {
      y: [0, -5, 0], // bounce up 5px
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
  };
  return (
    <div className="flex items-center gap-1 px-3 py-3 my-2 bg-gray-200 rounded-2xl shadow-sm w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-gray-500 rounded-full"
          variants={dotVariants}
          animate="animate"
          transition={{
            delay: i * 0.2,
            y: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 0.6,
              ease: "easeInOut",
            },
          }}
        />
      ))}{" "}
    </div>
  );
}
