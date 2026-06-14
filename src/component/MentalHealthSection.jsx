const MentalHealthSection = () => {
  return (
    <section
      style={{
        padding: "80px 20px",
        background: "#0f172a",
        color: "white",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          marginBottom: "20px",
        }}
      >
        Mental Health Revolution
      </h2>

      <p
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          lineHeight: "1.8",
          fontSize: "1.1rem",
        }}
      >
        We believe mental health should be accessible, affordable,
        and stigma-free. Swastprova aims to create a future where
        every individual receives the support, guidance, and
        resources needed to live a healthier life.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "40px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "15px",
            width: "250px",
          }}
        >
          <h3>Awareness</h3>
          <p>Educating people about mental well-being.</p>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "15px",
            width: "250px",
          }}
        >
          <h3>Support</h3>
          <p>Connecting people with guidance and mentors.</p>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "15px",
            width: "250px",
          }}
        >
          <h3>Growth</h3>
          <p>Helping individuals build a stronger future.</p>
        </div>
      </div>
    </section>
  );
};

export default MentalHealthSection;