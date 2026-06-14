const MentalHealth = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#dbeafe,#ffe4ec)",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#2563eb",
            fontSize: "3rem",
          }}
        >
          🧠 Mental Health Awareness
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: "1.1rem",
            lineHeight: "1.8",
          }}
        >
          Mental health is just as important as physical health.
          Swastprova helps people understand stress, anxiety,
          depression, self-growth and emotional wellbeing.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
            }}
          >
            <h3>🌱 Self Growth</h3>
            <p>Build confidence and positive habits.</p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
            }}
          >
            <h3>😌 Stress Management</h3>
            <p>Learn healthy ways to handle stress.</p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
            }}
          >
            <h3>❤️ Emotional Wellness</h3>
            <p>Understand and manage emotions better.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;