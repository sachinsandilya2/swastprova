const Articles = () => {
  const articles = [
    {
      title: "How to Manage Stress",
      description: "Simple techniques to reduce stress in daily life.",
    },
    {
      title: "Building Self Confidence",
      description: "Practical ways to improve confidence and self-esteem.",
    },
    {
      title: "Healthy Study Habits",
      description: "Tips for students to stay productive and mentally healthy.",
    },
  ];

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
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            fontSize: "3rem",
          }}
        >
          📚 Articles & Resources
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#475569",
            marginBottom: "40px",
            fontSize: "1.1rem",
          }}
        >
          Explore articles related to mental health, self-growth,
          productivity, and wellbeing.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap: "25px",
          }}
        >
          {articles.map((article, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h2>{article.title}</h2>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: "1.7",
                }}
              >
                {article.description}
              </p>

              <button
                style={{
                  marginTop: "15px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Read More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Articles;