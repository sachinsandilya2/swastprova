import { useState } from "react";

const API_URL = "https://swastprova-2.onrender.com";

const Login = () => {
  const [step, setStep] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOGIN + SEND OTP
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      setMessage(
        "OTP has been sent to your email."
      );

      setStep("otp");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.message || "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP
  // =========================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/login/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "OTP verification failed"
        );
      }

      setMessage(
        "✅ Login successful!"
      );

      // User login status
      localStorage.setItem(
        "swastprovaUser",
        JSON.stringify(data.user)
      );

      // Yahan apne dashboard ka route laga sakte ho
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (err) {
      console.error(
        "OTP VERIFY ERROR:",
        err
      );

      setError(
        err.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESEND OTP
  // =========================

  const resendOTP = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/login/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not resend OTP"
        );
      }

      setMessage(
        "A new OTP has been sent to your email."
      );

    } catch (err) {
      console.error(
        "RESEND OTP ERROR:",
        err
      );

      setError(
        err.message || "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        {step === "login" ? (
          <>
            {/* LOGIN */}

            <div style={styles.icon}>
              🔐
            </div>

            <h1 style={styles.title}>
              Welcome Back 👋
            </h1>

            <p style={styles.subtitle}>
              Login to your Swastprova account
            </p>

            <form
              onSubmit={handleLogin}
              style={styles.form}
            >

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={styles.input}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={styles.input}
              />

              {error && (
                <div style={styles.error}>
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={styles.button}
              >
                {loading
                  ? "Sending OTP..."
                  : "Login & Get OTP"}
              </button>

            </form>

            <div style={styles.resetBox}>
              <p>
                Forgot Password?
              </p>

              <button
                type="button"
                style={styles.resetButton}
              >
                Reset Password
              </button>
            </div>
          </>
        ) : (
          <>
            {/* OTP */}

            <div style={styles.icon}>
              📩
            </div>

            <h1 style={styles.title}>
              Verify Your Email
            </h1>

            <p style={styles.subtitle}>
              We sent a 6-digit OTP to
            </p>

            <strong style={styles.email}>
              {email}
            </strong>

            <form
              onSubmit={handleVerifyOTP}
              style={styles.form}
            >

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                  )
                }
                style={{
                  ...styles.input,
                  textAlign: "center",
                  fontSize: "24px",
                  letterSpacing: "8px",
                  fontWeight: "700",
                }}
              />

              {message && (
                <div style={styles.success}>
                  ✅ {message}
                </div>
              )}

              {error && (
                <div style={styles.error}>
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={styles.button}
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

            </form>

            <button
              type="button"
              onClick={resendOTP}
              disabled={loading}
              style={styles.resendButton}
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("login");
                setOtp("");
                setError("");
                setMessage("");
              }}
              style={styles.backButton}
            >
              ← Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 20px",
    background:
      "linear-gradient(135deg,#dbeafe,#f5f3ff,#ffe4ec)",
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    background: "rgba(255,255,255,0.95)",
    padding: "40px",
    borderRadius: "25px",
    boxShadow:
      "0 25px 60px rgba(15,23,42,0.12)",
  },

  icon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    fontSize: "30px",
  },

  title: {
    textAlign: "center",
    color: "#0f172a",
    margin: "0 0 10px",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "8px",
  },

  email: {
    display: "block",
    textAlign: "center",
    color: "#2563eb",
    marginBottom: "25px",
    wordBreak: "break-word",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  button: {
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
  },

  error: {
    padding: "11px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "14px",
  },

  success: {
    padding: "11px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "14px",
  },

  resetBox: {
    textAlign: "center",
    marginTop: "25px",
    color: "#64748b",
  },

  resetButton: {
    background: "#ec4899",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  resendButton: {
    width: "100%",
    marginTop: "20px",
    background: "transparent",
    color: "#2563eb",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
  },

  backButton: {
    width: "100%",
    marginTop: "12px",
    padding: "10px",
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
  },
};

export default Login;