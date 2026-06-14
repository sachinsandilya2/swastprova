const Login = () => {
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
          maxWidth: "450px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "10px",
          }}
        >
          Welcome Back 👋
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Login to your Swastprova account
        </p>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
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
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Login
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <p style={{ color: "#64748b" }}>
            Forgot Password?
          </p>

          <button
            style={{
              background: "#ec4899",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;