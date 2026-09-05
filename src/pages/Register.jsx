import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://swastprova-2.onrender.com";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // =========================
  // REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const {
      name,
      email,
      password,
      confirmPassword,
    } = formData;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // =========================
    // VALIDATION
    // =========================

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // SEND OTP
      // =========================

      const response = await fetch(
        `${API_URL}/register/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to send OTP."
        );
      }

      // =========================
      // SAVE TEMPORARY DATA
      // =========================

      sessionStorage.setItem(
        "swastprovaRegistration",
        JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
        })
      );

      sessionStorage.setItem(
        "swastprovaOTPEmail",
        cleanEmail
      );

      setMessage(
        "OTP has been sent to your email."
      );

      // =========================
      // GO TO OTP PAGE
      // =========================

      setTimeout(() => {
        navigate("/verify-otp", {
          state: {
            email: cleanEmail,
          },
        });
      }, 500);
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* BACKGROUND CIRCLES */}

      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>

      <div style={styles.container}>

        {/* =========================
            LEFT BRAND SECTION
        ========================= */}

        <div style={styles.brandPanel}>
          <div style={styles.brandLogo}>
            🌱
          </div>

          <h1 style={styles.brandTitle}>
            Join Swastprova
          </h1>

          <p style={styles.brandSubtitle}>
            Create your account and take
            <br />
            the first step toward better wellness.
          </p>

          <div style={styles.quoteBox}>
            <div style={styles.quote}>
              “Your wellbeing matters.”
            </div>

            <div style={styles.quoteSmall}>
              Start today. Grow every day.
            </div>
          </div>

          <div style={styles.miniFeatures}>
            <span>✓ Secure</span>
            <span>✓ Private</span>
            <span>✓ Supportive</span>
          </div>
        </div>

        {/* =========================
            REGISTER CARD
        ========================= */}

        <div style={styles.card}>

          {/* MOBILE LOGO */}

          <div style={styles.mobileLogo}>
            🌱
          </div>

          {/* HEADING */}

          <div style={styles.heading}>
            <h2 style={styles.headingTitle}>
              Create Account
            </h2>

            <p style={styles.headingText}>
              Join Swastprova and begin your
              wellness journey.
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >

            {/* =========================
                NAME
            ========================= */}

            <div style={styles.field}>
              <label style={styles.label}>
                Full Name
              </label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  👤
                </span>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* =========================
                EMAIL
            ========================= */}

            <div style={styles.field}>
              <label style={styles.label}>
                Email Address
              </label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  ✉️
                </span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* =========================
                PASSWORD
            ========================= */}

            <div style={styles.field}>
              <label style={styles.label}>
                Password
              </label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  style={styles.eyeButton}
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>
            </div>

            {/* =========================
                CONFIRM PASSWORD
            ========================= */}

            <div style={styles.field}>
              <label style={styles.label}>
                Confirm Password
              </label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  🔐
                </span>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  style={styles.input}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  style={styles.eyeButton}
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>
            </div>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
              <div style={styles.error}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* =========================
                SUCCESS
            ========================= */}

            {message && (
              <div style={styles.success}>
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {/* =========================
                SUBMIT BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Sending OTP..."
                : "Continue →"}
            </button>
          </form>

          {/* =========================
              LOGIN
          ========================= */}

          <div style={styles.loginArea}>
            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              style={styles.loginButton}
            >
              Login
            </button>
          </div>

          {/* =========================
              OTP INFO
          ========================= */}

          <div style={styles.info}>
            📧 We'll send a 6-digit OTP to
            verify your email.
          </div>

        </div>
      </div>
    </div>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#eff6ff,#faf5ff,#fdf2f8)",
    fontFamily:
      "Inter, Poppins, Arial, sans-serif",
    boxSizing: "border-box",
  },

  circleOne: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background:
      "rgba(37,99,235,0.10)",
    top: "-180px",
    left: "-150px",
  },

  circleTwo: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "rgba(236,72,153,0.10)",
    bottom: "-170px",
    right: "-150px",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderRadius: "30px",
    overflow: "hidden",
    boxShadow:
      "0 30px 80px rgba(15,23,42,0.14)",
    position: "relative",
    zIndex: 2,
  },

  brandPanel: {
    padding: "50px 45px",
    background:
      "linear-gradient(145deg,#2563eb,#6366f1 55%,#ec4899)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  brandLogo: {
    width: "70px",
    height: "70px",
    borderRadius: "22px",
    background:
      "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    marginBottom: "22px",
  },

  brandTitle: {
    fontSize: "40px",
    margin: "0 0 12px",
    fontWeight: "900",
  },

  brandSubtitle: {
    fontSize: "16px",
    lineHeight: "1.7",
    opacity: 0.9,
    marginBottom: "35px",
  },

  quoteBox: {
    padding: "22px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.12)",
    border:
      "1px solid rgba(255,255,255,0.18)",
    marginBottom: "30px",
  },

  quote: {
    fontSize: "20px",
    fontWeight: "800",
    marginBottom: "7px",
  },

  quoteSmall: {
    fontSize: "13px",
    opacity: 0.8,
  },

  miniFeatures: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    fontSize: "12px",
    fontWeight: "700",
    opacity: 0.9,
  },

  card: {
    padding: "45px",
    background: "rgba(255,255,255,0.97)",
    minHeight: "620px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  mobileLogo: {
    display: "none",
  },

  heading: {
    marginBottom: "25px",
  },

  headingTitle: {
    margin: "0 0 9px",
    fontSize: "31px",
    fontWeight: "900",
    color: "#0f172a",
  },

  headingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: "700",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #dbe2ea",
    borderRadius: "13px",
    background: "#f8fafc",
    transition: "0.2s",
  },

  inputIcon: {
    paddingLeft: "13px",
    fontSize: "15px",
  },

  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "13px 11px",
    fontSize: "14px",
    color: "#0f172a",
  },

  eyeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "8px 12px",
    fontSize: "15px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "13px",
    padding: "15px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "white",
    fontSize: "15px",
    fontWeight: "800",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.20)",
  },

  error: {
    display: "flex",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: "600",
  },

  success: {
    display: "flex",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: "600",
  },

  loginArea: {
    textAlign: "center",
    marginTop: "22px",
    paddingTop: "18px",
    borderTop: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "13px",
  },

  loginButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "800",
    cursor: "pointer",
    marginLeft: "6px",
  },

  info: {
    marginTop: "18px",
    padding: "10px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#64748b",
    textAlign: "center",
    fontSize: "11px",
    lineHeight: "1.5",
  },
};

export default Register;