import { useAuth } from "@/Context/AuthContext";
import useChatSocket from "@/hooks/useChatSocket";

export default function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketUrl = import.meta.env.VITE_SOCKET_URL;

  // ✅ connect + listeners هنا فقط
  useChatSocket({
    userId: user?.id,
    socketUrl,
  });

  return children;
}
