const Progress = () => {
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
          📈 My Progress
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: "1.1rem",
            marginBottom: "40px",
          }}
        >
          Track your mental wellness journey, goals, habits and achievements.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>🔥 Current Streak</h3>
            <h2>15 Days</h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>🎯 Goals Completed</h3>
            <h2>8 / 12</h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>😊 Mood Score</h3>
            <h2>85%</h2>
          </div>
        </div>

        <button
          style={{
            marginTop: "40px",
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Update Progress
        </button>
      </div>
    </div>
  );
};

export default Progress;