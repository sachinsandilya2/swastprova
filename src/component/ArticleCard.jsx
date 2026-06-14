export default function Mentors() {
  const mentors = [
    {
      name: "Career Mentor",
      emoji: "🎓",
      desc: "Guidance for career and higher studies.",
    },
    {
      name: "Mental Health Mentor",
      emoji: "🧠",
      desc: "Support for stress, anxiety and wellbeing.",
    },
    {
      name: "Startup Mentor",
      emoji: "🚀",
      desc: "Learn startup building and entrepreneurship.",
    },
    {
      name: "Coding Mentor",
      emoji: "💻",
      desc: "Get help in web development and programming.",
    },
    {
      name: "Fitness Mentor",
      emoji: "🏋️",
      desc: "Improve health, fitness and daily routine.",
    },
    {
      name: "Life Mentor",
      emoji: "🌱",
      desc: "Personal growth and self improvement guidance.",
    },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Our Mentors</h1>

      <div style={styles.grid}>
        {mentors.map((mentor, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.icon}>{mentor.emoji}</div>

            <h2>{mentor.name}</h2>

            <p>{mentor.desc}</p>

            <button style={styles.button}>
              Connect Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "40px 20px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  heading: {
    textAlign: "center",
    marginBottom: "40px",
    color: "#1e293b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "auto",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
  },

  icon: {
    fontSize: "50px",
    marginBottom: "10px",
  },

  button: {
    marginTop: "15px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "25px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
};