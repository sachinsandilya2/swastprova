import { useNavigate } from "react-router-dom";

export default function Health() {
  const navigate = useNavigate();

  const services = [
    {
      icon: "💬",
      title: "Life Compass AI",
      desc: "AI Reflection & Guidance",
      path: "/live-chat",
    },
    {
      icon: "🧠",
      title: "Mental Health",
      desc: "Reduce Stress & Anxiety",
      path: "/mental-health",
    },
    {
      icon: "👨‍⚕️",
      title: "Psychologists",
      desc: "Connect With Experts",
      path: "/psychologists",
    },
    {
      icon: "🎯",
      title: "Mentorship",
      desc: "Get Proper Guidance",
      path: "/mentors",
    },
    {
      icon: "📈",
      title: "Progress",
      desc: "Track Your Journey",
      path: "/progress",
    },
    {
      icon: "📚",
      title: "Articles",
      desc: "Learn Daily",
      path: "/articles",
    },
    {
      icon: "🤝",
      title: "Community",
      desc: "Talk & Connect",
      path: "/community",
    },
    {
      icon: "📞",
      title: "Contact",
      desc: "Reach Our Team",
      path: "/contact",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>🩺 Health & Mentorship</h1>

        <p style={styles.subtitle}>
          Your complete wellness, guidance and growth platform.
        </p>
      </div>

      <div style={styles.grid}>
        {services.map((item, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.icon}>{item.icon}</div>

            <h3>{item.title}</h3>

            <p>{item.desc}</p>

            <button
              style={styles.btn}
              onClick={() => navigate(item.path)}
            >
              Explore
            </button>
          </div>
        ))}
      </div>

      <button
        style={styles.backBtn}
        onClick={() => navigate("/")}
      >
        ⬅ Back To Home
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "#f8fafc",
  },

  hero: {
    textAlign: "center",
    marginBottom: "50px",
  },

  title: {
    fontSize: "48px",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "18px",
    color: "#64748b",
  },

  grid: {
    maxWidth: "1200px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",
    gap: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "0.3s",
  },

  icon: {
    fontSize: "55px",
    marginBottom: "10px",
  },

  btn: {
    marginTop: "15px",
    padding: "12px 22px",
    border: "none",
    borderRadius: "25px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  backBtn: {
    display: "block",
    margin: "50px auto",
    padding: "14px 25px",
    border: "none",
    borderRadius: "30px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};