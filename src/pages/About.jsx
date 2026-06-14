const About = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#ffe4ec,#dbeafe)",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            color: "#0f172a",
            marginBottom: "20px",
          }}
        >
          About Swastprova
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            lineHeight: "1.8",
            color: "#334155",
          }}
        >
          Swastprova is a health and mentorship platform
          focused on mental wellness, health awareness,
          personal growth, and guidance.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "25px",
            marginTop: "50px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
            }}
          >
            <h2>🎯 Our Mission</h2>
            <p>
              To make health awareness and mentorship
              accessible to everyone.
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
            }}
          >
            <h2>🚀 Our Vision</h2>
            <p>
              Building the world's most trusted platform
              for health and personal development.
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
            }}
          >
            <h2>💙 Our Values</h2>
            <p>
              Compassion, trust, innovation and
              community support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;