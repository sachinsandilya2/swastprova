const Register = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#dbeafe,#ffe4ec)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#ec4899",
          }}
        >
          Create Account 🚀
        </h1>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Full Name"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
            }}
          />

          <input
            type="email"
            placeholder="Email Address"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
            }}
          />

          <button
            type="submit"
            style={{
              background: "#ec4899",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;