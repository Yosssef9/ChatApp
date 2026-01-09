import { motion, AnimatePresence } from "framer-motion";

export default function LoadingOverlay() {
  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black flex justify-center items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full"
          />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
