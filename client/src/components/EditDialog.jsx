import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";

export default function EditDialog({ isOpen, onClose, msg }) {
  const activeChatUser = useChatStore((s) => s.activeChatUser);
  const editMessage = useChatStore((s) => s.editMessage);

  const [text, setText] = useState("");

  const originalText = (msg?.text || "").trim();
  const trimmedNow = text.trim();

  const canSave = trimmedNow.length > 0 && trimmedNow !== originalText;

  const handleSave = () => {
    console.log("handleSave ttttttttttttttt");

    const conversationId = activeChatUser?.id;
    const messageId = msg?.id;
    console.log("handleSave conversationId", conversationId);
    console.log("handleSave messageId", messageId);
    console.log("handleSave canSave", canSave);
    console.log("handleSave msg", msg);
    if (!conversationId || !messageId) return;
    if (!canSave) return;
    console.log("handleSave after ttttttttttttttt");

    editMessage({
      messageId,
      conversationId,
      newText: text,
    });

    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       rounded-lg shadow-lg w-80 max-w-[90vw] p-5 bg-white"
            initial={{ opacity: 0, y: -40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-800">
              Edit Message
            </h3>

            <textarea
              className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />

            <div className="flex gap-2 mt-4">
              <button
                className={`flex-1 px-4 py-2 rounded text-white ${
                  canSave
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed"
                }`}
                disabled={!canSave}
                onClick={handleSave}
              >
                Save
              </button>

              <button
                className="flex-1 px-4 py-2 border rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
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
