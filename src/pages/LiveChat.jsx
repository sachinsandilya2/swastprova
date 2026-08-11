import { useState } from "react";

const LiveChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://swastprova-2.onrender.com";

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // User message show
    setMessages((prev) => [
      ...prev,
      {
        text: userMessage,
        sender: "You",
        type: "user",
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      console.log("📡 Sending message to:", `${API_URL}/chat`);

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      console.log("📡 Server status:", response.status);

      // Response ko pehle text ke form mein read karo
      const rawText = await response.text();

      console.log("📦 Server response:", rawText);

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned invalid response: ${rawText.substring(0, 200)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message || `Server Error: ${response.status}`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message || "AI request failed"
        );
      }

      if (!data?.reply) {
        throw new Error("AI returned empty response");
      }

      // AI response
      setMessages((prev) => [
        ...prev,
        {
          text: data.reply,
          sender: "Swastprova AI",
          type: "ai",
        },
      ]);
    } catch (error) {
      console.error("❌ CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          text: `❌ ${error.message || "Failed to connect with AI"}`,
          sender: "System",
          type: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.aiIcon}>🤖</div>

          <div>
            <h1 style={styles.title}>
              Swastprova AI
            </h1>

            <p style={styles.subtitle}>
              Your health & wellness assistant
            </p>
          </div>
        </div>

        {/* Chat Box */}
        <div style={styles.chatBox}>

          {messages.length === 0 && (
            <div style={styles.welcome}>
              <div style={styles.welcomeIcon}>
                💙
              </div>

              <h2>
                Hello! I'm Swastprova AI
              </h2>

              <p>
                Ask me about health awareness, mental wellness,
                personal growth or general guidance.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent:
                  msg.type === "user"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.message,
                  ...(msg.type === "user"
                    ? styles.userMessage
                    : {}),
                  ...(msg.type === "error"
                    ? styles.errorMessage
                    : {}),
                }}
              >
                <strong style={styles.sender}>
                  {msg.sender}
                </strong>

                <div style={styles.messageText}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div style={styles.messageRow}>
              <div style={styles.message}>
                <strong style={styles.sender}>
                  Swastprova AI
                </strong>

                <div style={styles.thinking}>
                  🤖 Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={styles.inputArea}>
          <input
            type="text"
            placeholder="Ask Swastprova AI..."
            value={message}
            disabled={loading}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            style={styles.input}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            style={{
              ...styles.button,
              opacity:
                loading || !message.trim()
                  ? 0.6
                  : 1,
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        <p style={styles.note}>
          Swastprova AI provides general information and is not a
          replacement for a qualified healthcare professional.
        </p>

      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "50px 20px",
    background:
      "linear-gradient(135deg, #eff6ff, #f5f3ff, #fdf2f8)",
  },

  container: {
    maxWidth: "850px",
    margin: "auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },

  aiIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    fontSize: "28px",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.25)",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1.8rem",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
  },

  chatBox: {
    height: "500px",
    padding: "20px",
    overflowY: "auto",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.08)",
  },

  welcome: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#475569",
  },

  welcomeIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  messageRow: {
    display: "flex",
    marginBottom: "14px",
  },

  message: {
    maxWidth: "75%",
    padding: "13px 16px",
    borderRadius: "16px",
    background: "#f1f5f9",
    color: "#0f172a",
  },

  userMessage: {
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
  },

  errorMessage: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  sender: {
    display: "block",
    marginBottom: "5px",
    fontSize: "0.85rem",
  },

  messageText: {
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
  },

  thinking: {
    color: "#64748b",
    fontStyle: "italic",
  },

  inputArea: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  input: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "15px",
    background: "white",
  },

  button: {
    padding: "14px 24px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },

  note: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
    marginTop: "15px",
  },
};

export default LiveChat;