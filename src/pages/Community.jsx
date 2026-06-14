const Community = () => {
  const posts = [
    {
      user: "Rahul",
      message: "Today I completed my 7-day mental wellness challenge 🎉",
    },
    {
      user: "Priya",
      message: "Meditation has really helped me reduce stress.",
    },
    {
      user: "Aman",
      message: "Looking for study and career guidance mentors.",
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
          maxWidth: "1000px",
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
          💬 Swastprova Community
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#475569",
            marginBottom: "40px",
            fontSize: "1.1rem",
          }}
        >
          Connect with people, share experiences and support each other.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {posts.map((post, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3>{post.user}</h3>
              <p>{post.message}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "40px",
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h2>Share Your Thoughts</h2>

          <textarea
            placeholder="Write something..."
            rows="5"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              marginTop: "10px",
            }}
          />

          <button
            style={{
              marginTop: "15px",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;