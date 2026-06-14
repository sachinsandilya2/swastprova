import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>🌱 Swastprova</h1>

        <p style={styles.subtitle}>
          Mental Health • Mentorship • AI Guidance
        </p>

        <p style={styles.description}>
          Empowering people with AI-powered reflection,
          mental wellness support and personal growth.
        </p>

        <div style={styles.buttonContainer}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/live-chat")}
          >
            🧭 Life Compass AI
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/health")}
          >
            🩺 Health & Mentorship
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #dbeafe, #f8fafc)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  hero: {
    textAlign: "center",
    maxWidth: "700px",
  },

  title: {
    fontSize: "64px",
    marginBottom: "15px",
    color: "#0f172a",
  },

  subtitle: {
    fontSize: "22px",
    color: "#2563eb",
    fontWeight: "bold",
    marginBottom: "20px",
  },

  description: {
    fontSize: "18px",
    color: "#475569",
    lineHeight: "1.8",
    marginBottom: "40px",
  },

  buttonContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },

  primaryBtn: {
    padding: "16px 32px",
    border: "none",
    borderRadius: "50px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },

  secondaryBtn: {
    padding: "16px 32px",
    border: "none",
    borderRadius: "50px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },
};