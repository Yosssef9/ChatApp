import { AnimatePresence, motion } from "framer-motion";

export default function DeleteDialog({
  msgId,
  onDeleteMsg,
  isOpen,
  onClose,
  isMine,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Dialog */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-[50%]  sm:-translate-x-[10%] -translate-y-1/2 rounded-lg shadow-lg w-80 max-w-full p-5 bg-white"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Delete Message
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Do you want to delete this message?
            </p>

            <div className="flex flex-col gap-4">
              {/* الزرين الأولين جنب بعض */}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    onDeleteMsg(msgId, "me");
                    onClose();
                  }}
                >
                  Delete for me
                </button>
                {isMine && (
                  <button
                    className="flex-1 px-4 py-2 border rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={() => {
                      onDeleteMsg(msgId, "everyone");
                      onClose();
                    }}
                  >
                    Delete for everyone
                  </button>
                )}
              </div>

              {/* زر Cancel تحت */}
              <button
                className="px-4 py-2 border rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
