import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Home from "./pages/home";

const socket = io("http://localhost:3000"); // Connect to Node server

function App() {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for messages from server
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("chat message", { username, text: message }); // Send message to server
      setMessage("");
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Home />
    </div>
  );
}

export default App;
