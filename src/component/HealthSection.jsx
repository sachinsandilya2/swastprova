const HealthSection = () => {
  const cards = [
    {
      title: "Physical Health",
      desc: "Learn about fitness, nutrition and healthy living."
    },
    {
      title: "Mental Health",
      desc: "Understand stress, anxiety and emotional well-being."
    },
    {
      title: "Health Awareness",
      desc: "Access trusted information and preventive care tips."
    }
  ];

  return (
    <section
      style={{
        padding: "80px 20px",
        textAlign: "center",
        background: "#f8fafc",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          marginBottom: "15px",
        }}
      >
        Health Awareness
      </h2>

      <p
        style={{
          maxWidth: "700px",
          margin: "0 auto 40px",
        }}
      >
        Empowering people with knowledge, guidance and support
        for a healthier future.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              width: "280px",
              background: "white",
              padding: "25px",
              borderRadius: "15px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HealthSection;