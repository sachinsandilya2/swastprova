import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import { auth } from "../firebase";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setMessage("");
  };

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

    if (!name.trim()) {
      setError("Please enter your full name.");
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

    try {
      setLoading(true);

      // Create Firebase account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // Save user's name
      await updateProfile(user, {
        displayName: name.trim(),
      });

      // Send verification email
      await sendEmailVerification(user);

      setMessage(
        "✅ Account created successfully! Please check your email and verify your account."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please login."
        );
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError(
          "Password must be at least 6 characters."
        );
      } else if (err.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection."
        );
      } else {
        setError(
          err.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          🌱
        </div>

        {/* Heading */}
        <h1 style={styles.title}>
          Create Account
        </h1>

        <p style={styles.subtitle}>
          Start your Swastprova wellness journey
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          {/* Name */}
          <div style={styles.field}>
            <label style={styles.label}>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Confirm Password */}
          <div style={styles.field}>
            <label style={styles.label}>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div style={styles.error}>
              ❌ {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "⏳ Creating Account..."
              : "🚀 Create Account"}
          </button>
        </form>

        {/* Login */}
        <div style={styles.loginArea}>
          <span style={styles.loginText}>
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

        {/* Verification Info */}
        <div style={styles.info}>
          📧 A verification email will be sent after
          registration. Please verify your email before
          using your account.
        </div>

      </div>
    </div>
  );
};

/* =========================
   STYLES
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #dbeafe, #f8fafc, #fce7f3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "28px",
    boxShadow:
      "0 25px 60px rgba(15, 23, 42, 0.12)",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },

  logo: {
    width: "65px",
    height: "65px",
    margin: "0 auto 15px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #2563eb, #ec4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  title: {
    textAlign: "center",
    color: "#0f172a",
    fontSize: "34px",
    margin: "10px 0",
    fontWeight: "900",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "30px",
    lineHeight: "1.6",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "14px",
    color: "#334155",
    fontWeight: "800",
  },

  input: {
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },

  button: {
    marginTop: "5px",
    padding: "15px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #2563eb, #ec4899)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "900",
    boxShadow:
      "0 10px 25px rgba(37, 99, 235, 0.2)",
  },

  error: {
    padding: "12px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1.5",
  },

  success: {
    padding: "12px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1.5",
  },

  loginArea: {
    marginTop: "25px",
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
  },

  loginText: {
    color: "#64748b",
    fontSize: "14px",
  },

  loginButton: {
    marginLeft: "7px",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "900",
    cursor: "pointer",
    fontSize: "14px",
  },

  info: {
    marginTop: "20px",
    padding: "12px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#475569",
    fontSize: "12px",
    lineHeight: "1.5",
    textAlign: "center",
  },
};

export default Register;