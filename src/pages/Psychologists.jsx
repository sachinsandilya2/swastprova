const Psychologists = () => {
  const psychologists = [
    {
      name: "Dr. Priya Sharma",
      specialization: "Anxiety & Stress",
    },
    {
      name: "Dr. Rahul Verma",
      specialization: "Depression & Therapy",
    },
    {
      name: "Dr. Neha Singh",
      specialization: "Student Counselling",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#e0f2fe,#fce7f3)",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
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
          👨‍⚕️ Find Psychologists
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: "1.1rem",
            marginBottom: "40px",
          }}
        >
          Connect with qualified psychologists and mental health
          professionals.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "25px",
          }}
        >
          {psychologists.map((doctor, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3>{doctor.name}</h3>
              <p>{doctor.specialization}</p>

              <button
                style={{
                  marginTop: "10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Book Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Psychologists;