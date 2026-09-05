import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // FIREBASE LOGIN
      // =========================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      const user = userCredential.user;

      // =========================
      // GET FIRESTORE PROFILE
      // =========================

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const userSnapshot =
        await getDoc(userRef);

      let userData = {
        uid: user.uid,
        email: user.email,
        name:
          user.displayName || "",
      };

      if (userSnapshot.exists()) {
        userData = {
          ...userData,
          ...userSnapshot.data(),
        };
      }

      // =========================
      // SAVE LOGIN USER
      // =========================

      localStorage.setItem(
        "swastprovaUser",
        JSON.stringify(userData)
      );

      setMessage(
        "Login successful! Redirecting..."
      );

      // =========================
      // GO HOME
      // =========================

      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      // =========================
      // FIREBASE ERROR HANDLING
      // =========================

      switch (err.code) {
        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/invalid-credential":
          setError(
            "Invalid email or password."
          );
          break;

        case "auth/user-not-found":
          setError(
            "No account found with this email."
          );
          break;

        case "auth/wrong-password":
          setError(
            "Incorrect password."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many failed attempts. Please try again later."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        case "auth/user-disabled":
          setError(
            "This account has been disabled."
          );
          break;

        default:
          setError(
            err.message ||
              "Login failed. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div style={styles.page}>

      {/* BACKGROUND */}

      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>

      <div style={styles.container}>

        {/* =========================
            LEFT BRAND PANEL
        ========================= */}

        <div style={styles.brandPanel}>

          <div style={styles.brandLogo}>
            🌱
          </div>

          <h1 style={styles.brandTitle}>
            Welcome Back
          </h1>

          <p style={styles.brandSubtitle}>
            Continue your journey with
            <br />
            Swastprova.
          </p>

          <div style={styles.quoteBox}>

            <div style={styles.quote}>
              “Your wellbeing matters.”
            </div>

            <div style={styles.quoteSmall}>
              Take care of your mind.
              Take care of yourself.
            </div>

          </div>

          <div style={styles.miniFeatures}>
            <span>✓ Secure</span>
            <span>✓ Private</span>
            <span>✓ Supportive</span>
          </div>

        </div>

        {/* =========================
            LOGIN CARD
        ========================= */}

        <div style={styles.card}>

          {/* MOBILE LOGO */}

          <div style={styles.mobileLogo}>
            🌱
          </div>

          {/* HEADING */}

          <div style={styles.heading}>

            <h2 style={styles.headingTitle}>
              Login
            </h2>

            <p style={styles.headingText}>
              Sign in to access your
              Swastprova account.
            </p>

          </div>

          {/* =========================
              FORM
          ========================= */}

          <form
            onSubmit={handleLogin}
            style={styles.form}
          >

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
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setMessage("");
                  }}
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
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                  style={styles.input}
                  autoComplete="current-password"
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

            {/* LOGIN BUTTON */}

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
                ? "Signing in..."
                : "Login →"}
            </button>

          </form>

          {/* =========================
              REGISTER
          ========================= */}

          <div style={styles.registerArea}>

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={handleRegister}
              style={styles.registerButton}
            >
              Create Account
            </button>

          </div>

          {/* INFO */}

          <div style={styles.info}>
            🔐 Your account is securely
            protected by Firebase.
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
    lineHeight: "1.5",
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
    minHeight: "580px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  mobileLogo: {
    display: "none",
  },

  heading: {
    marginBottom: "30px",
  },

  headingTitle: {
    margin: "0 0 9px",
    fontSize: "32px",
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
    gap: "18px",
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
    padding: "14px 11px",
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
    padding: "11px 12px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: "600",
  },

  success: {
    display: "flex",
    gap: "8px",
    padding: "11px 12px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: "600",
  },

  registerArea: {
    textAlign: "center",
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "13px",
  },

  registerButton: {
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

export default Login;