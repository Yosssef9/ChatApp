import { useEffect, useState } from "react";
import { io } from "socket.io-client";

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
    <div className="flex flex-col gap-5 justify-center items-center min-h-screen">
      <h1>React + Socket.IO Chat</h1>
      <div className="">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Type your name..."
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
      </div>

      <button
        className="bg-blue-900 text-white px-4 py-2 rounded-3xl"
        onClick={sendMessage}
      >
        Send
      </button>

      <ul>
        {messages.map((msg, index) => (
          <li key={msg._id || index}>
            <strong>{msg.username}:</strong> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
