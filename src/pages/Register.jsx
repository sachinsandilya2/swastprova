import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const { name, email, password, confirmPassword } = formData;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // ==============================
    // VALIDATION
    // ==============================

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // ==========================================
      // 1. CREATE FIREBASE ACCOUNT
      // ==========================================

      console.log("🔥 Creating Firebase account...");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = userCredential.user;

      console.log("✅ Firebase account created:", user.uid);

      // ==========================================
      // 2. SAVE USER NAME IN FIREBASE
      // ==========================================

      await updateProfile(user, {
        displayName: cleanName,
      });

      console.log("✅ Firebase profile updated");

      // ==========================================
      // 3. SEND EXISTING BACKEND OTP
      // ==========================================

      console.log("📧 Sending verification OTP...");

      const response = await fetch(`${API_URL}/register/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      console.log("✅ OTP sent successfully");

      // ==========================================
      // 4. SAVE TEMPORARY REGISTRATION DATA
      // ==========================================

      sessionStorage.setItem(
        "swastprovaRegistration",
        JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          firebaseUid: user.uid,
        })
      );

      sessionStorage.setItem(
        "swastprovaOTPEmail",
        cleanEmail
      );

      sessionStorage.setItem(
        "swastprovaFirebaseUid",
        user.uid
      );

      // ==========================================
      // 5. SUCCESS MESSAGE
      // ==========================================

      setMessage(
        "Account created successfully. OTP has been sent to your email."
      );

      // ==========================================
      // 6. GO TO OTP PAGE
      // ==========================================

      setTimeout(() => {
        navigate("/verify-otp", {
          state: {
            email: cleanEmail,
            firebaseUid: user.uid,
          },
        });
      }, 700);
    } catch (err) {
      console.error("❌ REGISTER ERROR:", err);

      // ==========================================
      // FIREBASE ERROR HANDLING
      // ==========================================

      if (err?.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please login instead."
        );
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err?.code === "auth/weak-password") {
        setError(
          "Password is too weak. Please use at least 6 characters."
        );
      } else if (err?.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection."
        );
      } else {
        setError(
          err?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>

      <div style={styles.container}>
        {/* ======================================
            BRAND PANEL
        ====================================== */}

        <div style={styles.brandPanel}>
          <div style={styles.brandLogo}>🌱</div>

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

        {/* ======================================
            REGISTER CARD
        ====================================== */}

        <div style={styles.card}>
          <div style={styles.mobileLogo}>🌱</div>

          <div style={styles.heading}>
            <h2 style={styles.headingTitle}>
              Create Account
            </h2>

            <p style={styles.headingText}>
              Join Swastprova and begin your wellness journey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            {/* FULL NAME */}

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

            {/* EMAIL */}

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

            {/* PASSWORD */}

            <div style={styles.field}>
              <label style={styles.label}>
                Password
              </label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
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
                    setShowPassword((prev) => !prev)
                  }
                  style={styles.eyeButton}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

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
                  value={formData.confirmPassword}
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
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div style={styles.error}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}

            {message && (
              <div style={styles.success}>
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {/* SUBMIT */}

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
                ? "Creating Account..."
                : "Continue →"}
            </button>
          </form>

          {/* LOGIN */}

          <div style={styles.loginArea}>
            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/login")}
              style={styles.loginButton}
            >
              Login
            </button>
          </div>

          {/* INFO */}

          <div style={styles.info}>
            📧 We'll send a 6-digit OTP to verify your email.
          </div>
        </div>
      </div>

      {/* ======================================
          RESPONSIVE CSS
      ====================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
        }

        button,
        input {
          font-family: inherit;
        }

        .register-input-wrapper:focus-within {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }

        @media (max-width: 900px) {
          .register-container {
            max-width: 760px !important;
          }

          .register-brand-panel {
            padding: 40px 30px !important;
          }

          .register-card {
            padding: 35px 30px !important;
          }
        }

        @media (max-width: 700px) {
          .register-page {
            min-height: 100vh !important;
            min-height: 100dvh !important;
            padding: 20px 12px !important;
            align-items: flex-start !important;
          }

          .register-container {
            display: block !important;
            width: 100% !important;
            max-width: 520px !important;
            border-radius: 22px !important;
            margin: 10px auto !important;
          }

          .register-brand-panel {
            display: none !important;
          }

          .register-card {
            width: 100% !important;
            min-height: auto !important;
            padding: 28px 20px 24px !important;
            border-radius: 22px !important;
          }

          .register-mobile-logo {
            display: flex !important;
          }

          .register-heading {
            margin-bottom: 22px !important;
          }

          .register-heading-title {
            font-size: 27px !important;
          }

          .register-heading-text {
            font-size: 13px !important;
          }

          .register-form {
            gap: 14px !important;
          }

          .register-input-wrapper {
            min-height: 49px !important;
            border-radius: 12px !important;
          }

          .register-input {
            font-size: 14px !important;
            padding: 12px 8px !important;
          }

          .register-primary-button {
            min-height: 49px !important;
            font-size: 14px !important;
          }

          .register-login-area {
            margin-top: 19px !important;
            padding-top: 16px !important;
          }

          .register-info {
            margin-top: 15px !important;
            font-size: 10.5px !important;
          }
        }

        @media (max-width: 430px) {
          .register-page {
            padding: 12px 8px !important;
          }

          .register-container {
            margin: 4px auto !important;
            border-radius: 18px !important;
          }

          .register-card {
            padding: 24px 16px 20px !important;
            border-radius: 18px !important;
          }

          .register-mobile-logo {
            width: 52px !important;
            height: 52px !important;
            font-size: 25px !important;
            border-radius: 16px !important;
            margin-bottom: 15px !important;
          }

          .register-heading-title {
            font-size: 24px !important;
          }

          .register-heading-text {
            font-size: 12.5px !important;
          }

          .register-label {
            font-size: 12px !important;
          }

          .register-input-wrapper {
            min-height: 47px !important;
          }

          .register-input-icon {
            padding-left: 11px !important;
            font-size: 14px !important;
          }

          .register-input {
            font-size: 13px !important;
            padding: 11px 7px !important;
          }

          .register-eye-button {
            padding: 7px 10px !important;
            font-size: 14px !important;
          }

          .register-error,
          .register-success {
            font-size: 11.5px !important;
            padding: 9px 10px !important;
          }

          .register-login-area {
            font-size: 12px !important;
          }

          .register-info {
            padding: 9px 7px !important;
            font-size: 10px !important;
          }
        }

        @media (max-width: 350px) {
          .register-card {
            padding: 21px 13px 18px !important;
          }

          .register-heading-title {
            font-size: 22px !important;
          }

          .register-input {
            font-size: 12.5px !important;
          }

          .register-primary-button {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

// ==========================================
// STYLES
// ==========================================

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
    background: "rgba(37,99,235,0.10)",
    top: "-180px",
    left: "-150px",
    pointerEvents: "none",
  },

  circleTwo: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(236,72,153,0.10)",
    bottom: "-170px",
    right: "-150px",
    pointerEvents: "none",
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
    background: "rgba(255,255,255,0.18)",
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
    background: "rgba(255,255,255,0.12)",
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
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg,#eff6ff,#f5f3ff)",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    marginBottom: "18px",
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
    width: "100%",
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
    flexShrink: 0,
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
    width: "100%",
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
    alignItems: "flex-start",
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
    alignItems: "flex-start",
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