import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://swastprova-2.onrender.com";

const LiveChat = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    "मुझे सिर दर्द हो रहा है",
    "मुझे बहुत tension हो रही है",
    "मुझे पढ़ाई की बहुत tension है",
    "Swastprova क्या है?",
    "Swastprova unique कैसे है?",
    "Swastprova को use कैसे करें?",
  ];

  // -----------------------------------------
  // OFFLINE BASIC GUIDANCE
  // -----------------------------------------

  const getLocalResponse = (text) => {
    const q = text.toLowerCase();

    // CRISIS
    if (
      q.includes("suicide") ||
      q.includes("kill myself") ||
      q.includes("self harm") ||
      q.includes("marna chahta") ||
      q.includes("marna chahti") ||
      q.includes("khud ko nuksan") ||
      q.includes("आत्महत्या") ||
      q.includes("खुद को नुकसान")
    ) {
      return {
        type: "crisis",
        text:
          "मुझे अफसोस है कि आप अभी इतना कठिन महसूस कर रहे हैं। आप अकेले नहीं हैं। अगर आपको लगता है कि आप खुद को नुकसान पहुंचा सकते हैं या आप तत्काल खतरे में हैं, तो अभी किसी भरोसेमंद व्यक्ति के पास जाएँ और स्थानीय emergency service या nearest emergency department से मदद लें। Swastprova AI emergency care का replacement नहीं है।",
      };
    }

    // HEADACHE
    if (
      q.includes("headache") ||
      q.includes("head pain") ||
      q.includes("sar dard") ||
      q.includes("sir dard") ||
      q.includes("सिर दर्द") ||
      q.includes("सर दर्द")
    ) {
      return {
        type: "health",
        text:
          "अगर आपको हल्का सिर दर्द है, तो पहले पानी पिएँ, थोड़ी देर आराम करें और screen से break लें। अगर आपने लंबे समय से खाना नहीं खाया है तो हल्का भोजन करें। बहुत तेज़ या अचानक शुरू हुआ सिर दर्द, बार-बार होने वाला सिर दर्द, चोट के बाद दर्द, या साथ में कमजोरी/बेहोशी/बोलने में परेशानी जैसे symptoms हों तो medical professional से तुरंत संपर्क करें।\n\nअगर चाहें तो मैं आपको headache के common causes और prevention tips भी बता सकता हूँ।",
      };
    }

    // STRESS / TENSION
    if (
      q.includes("stress") ||
      q.includes("tension") ||
      q.includes("tensed") ||
      q.includes("pareshan") ||
      q.includes("परेशान") ||
      q.includes("टेंशन") ||
      q.includes("तनाव")
    ) {
      return {
        type: "health",
        text:
          "अगर आपको अभी tension या stress महसूस हो रहा है, तो 2–5 मिनट के लिए धीरे-धीरे breathing करें, थोड़ी देर screen से दूर रहें और जिस समस्या की वजह से tension है उसे छोटे steps में divide करें। किसी trusted friend, family member, mentor या counselor से बात करना भी मददगार हो सकता है।\n\nअगर stress लगातार बना हुआ है और आपकी sleep, पढ़ाई, काम या daily life को प्रभावित कर रहा है, तो qualified mental-health professional से बात करना बेहतर रहेगा।",
      };
    }

    // STUDY PRESSURE
    if (
      q.includes("study") ||
      q.includes("padhai") ||
      q.includes("exam") ||
      q.includes("college pressure") ||
      q.includes("study pressure") ||
      q.includes("पढ़ाई") ||
      q.includes("परीक्षा") ||
      q.includes("exam pressure")
    ) {
      return {
        type: "mentor",
        text:
          "पढ़ाई का pressure बहुत ज्यादा हो रहा है तो पहले पूरे syllabus को एक साथ देखने के बजाय छोटे tasks बनाइए। 25–50 मिनट focused study और फिर छोटा break ले सकते हैं। Sleep और regular meals को भी ignore न करें।\n\nअगर आपको career, study planning, motivation या personal guidance चाहिए, तो Swastprova पर आप approved mentor से session book कर सकते हैं।",
        action: "mentor",
      };
    }

    // SWASTPROVA WHAT IS IT
    if (
      q.includes("swastprova kya hai") ||
      q.includes("swastprova क्या है") ||
      q.includes("what is swastprova") ||
      q.includes("swastprova")
    ) {
      return {
        type: "platform",
        text:
          "Swastprova एक health, mental-wellness और mentorship platform है। इसका उद्देश्य users को health awareness, mental-wellness guidance और जरूरत पड़ने पर mentor या psychologist से connect करने का आसान तरीका देना है।\n\nSwastprova में user सामान्य health और wellness information देख सकता है, AI assistant से general guidance ले सकता है और available approved mentors/psychologists से session book कर सकता है।",
      };
    }

    // UNIQUE
    if (
      q.includes("unique") ||
      q.includes("alag") ||
      q.includes("different") ||
      q.includes("विशेष") ||
      q.includes("अलग")
    ) {
      return {
        type: "platform",
        text:
          "Swastprova की खास बात इसका integrated approach है। इसका focus केवल information देने पर नहीं है, बल्कि user को जरूरत के हिसाब से अलग support options तक पहुँचाने पर है:\n\n• AI-based general guidance\n• Mental-wellness information\n• Approved mentors से connection\n• Approved psychologists से connection\n• Session booking system\n• Health और personal-growth resources\n\nइसका goal है कि user को समस्या समझने से लेकर सही support option तक जाने का सरल रास्ता मिले।",
      };
    }

    // HOW TO USE
    if (
      q.includes("use kaise") ||
      q.includes("kaise use") ||
      q.includes("how to use") ||
      q.includes("कैसे इस्तेमाल") ||
      q.includes("कैसे use")
    ) {
      return {
        type: "platform",
        text:
          "Swastprova को basic तरीके से ऐसे use कर सकते हैं:\n\n1. Account बनाइए या login कीजिए।\n2. Health और mental-wellness resources explore कीजिए।\n3. General सवालों के लिए Swastprova AI से पूछिए।\n4. अगर study/career/personal guidance चाहिए तो available approved mentor देखिए।\n5. Mental-health professional की जरूरत हो तो approved psychologist देखिए।\n6. Available provider के साथ session book कीजिए।\n\nAI general guidance के लिए है; diagnosis या emergency treatment के लिए qualified professional की जरूरत होती है।",
      };
    }

    // MENTOR
    if (
      q.includes("mentor") ||
      q.includes("mentor se") ||
      q.includes("mentor chahiye") ||
      q.includes("मेंटor") ||
      q.includes("मेंटॉर")
    ) {
      return {
        type: "mentor",
        text:
          "अगर आपको study planning, career direction, motivation, personal growth या practical guidance चाहिए, तो Swastprova पर available approved mentors को देख सकते हैं और suitable mentor के साथ session book कर सकते हैं।",
        action: "mentor",
      };
    }

    // PSYCHOLOGIST
    if (
      q.includes("psychologist") ||
      q.includes("counselor") ||
      q.includes("counselling") ||
      q.includes("mental health professional") ||
      q.includes("मनोवैज्ञानिक") ||
      q.includes("काउंसलर")
    ) {
      return {
        type: "psychologist",
        text:
          "अगर आपको लगातार anxiety, low mood, emotional difficulties या mental-health related concerns परेशान कर रहे हैं, तो qualified mental-health professional से बात करना helpful हो सकता है। Swastprova पर available approved psychologists को देख सकते हैं और suitable professional के साथ session book कर सकते हैं।",
        action: "psychologist",
      };
    }

    return null;
  };

  // -----------------------------------------
  // SEND MESSAGE
  // -----------------------------------------

  const sendMessage = async (customMessage = null) => {
    const userMessage = (customMessage || message).trim();

    if (!userMessage || loading) return;

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
      // -----------------------------------------
      // FIRST: LOCAL SMART GUIDANCE
      // -----------------------------------------

      const localResponse = getLocalResponse(userMessage);

      if (localResponse) {
        setMessages((prev) => [
          ...prev,
          {
            text: localResponse.text,
            sender: "Swastprova AI",
            type: localResponse.type,
            action: localResponse.action,
          },
        ]);

        setLoading(false);
        return;
      }

      // -----------------------------------------
      // SECOND: GEMINI BACKEND
      // -----------------------------------------

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
        throw new Error(data?.message || "AI request failed");
      }

      if (!data?.reply) {
        throw new Error("AI returned empty response");
      }

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
          text:
            "AI से अभी connection नहीं हो पा रहा है। कृपया थोड़ी देर बाद फिर कोशिश करें।",
          sender: "System",
          type: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // QUICK ACTION
  // -----------------------------------------

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  // -----------------------------------------
  // ACTION BUTTON
  // -----------------------------------------

  const handleAction = (action) => {
    if (action === "mentor") {
      navigate("/mentors");
    }

    if (action === "psychologist") {
      navigate("/psychologists");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
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

        {/* QUICK QUESTIONS */}
        {messages.length === 0 && (
          <div style={styles.quickSection}>
            <p style={styles.quickTitle}>
              Try asking:
            </p>

            <div style={styles.quickButtons}>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  style={styles.quickButton}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CHAT BOX */}
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
                study pressure, personal growth or Swastprova.
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
                  ...(msg.type === "crisis"
                    ? styles.crisisMessage
                    : {}),
                }}
              >
                <strong style={styles.sender}>
                  {msg.sender}
                </strong>

                <div style={styles.messageText}>
                  {msg.text}
                </div>

                {/* MENTOR BUTTON */}
                {msg.action === "mentor" && (
                  <button
                    onClick={() => handleAction("mentor")}
                    style={styles.actionButton}
                  >
                    👨‍🏫 Find a Mentor
                  </button>
                )}

                {/* PSYCHOLOGIST BUTTON */}
                {msg.action === "psychologist" && (
                  <button
                    onClick={() =>
                      handleAction("psychologist")
                    }
                    style={styles.actionButton}
                  >
                    🧠 Find a Psychologist
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* LOADING */}
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

        {/* INPUT */}
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
            onClick={() => sendMessage()}
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
          Swastprova AI provides general information and is
          not a replacement for a qualified healthcare professional.
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
    marginBottom: "20px",
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

  quickSection: {
    marginBottom: "15px",
  },

  quickTitle: {
    margin: "0 0 8px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },

  quickButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  quickButton: {
    padding: "9px 12px",
    borderRadius: "20px",
    border: "1px solid #dbeafe",
    background: "white",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "13px",
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

  crisisMessage: {
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
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

  actionButton: {
    marginTop: "12px",
    padding: "10px 15px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
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