import { useState } from "react";

const LiveChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://swastprova-2.onrender.com";

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      { text: userMessage, sender: "You" },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      // 🔥 IMPORTANT: check response first
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          text: data.reply || "No response received",
          sender: "Swastprova AI",
        },
      ]);
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          text: "❌ Failed to connect with AI (Server Issue)",
          sender: "System",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>💬 Swastprova AI</h1>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}

        {loading && (
          <div style={styles.message}>
            🤖 Thinking...
          </div>
        )}
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Ask Swastprova..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
  },

  chatBox: {
    height: "450px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "15px",
    overflowY: "auto",
    background: "#fff",
  },

  message: {
    padding: "10px",
    marginBottom: "10px",
    background: "#eff6ff",
    borderRadius: "10px",
    whiteSpace: "pre-wrap",
  },

  inputArea: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
};

export default LiveChat;