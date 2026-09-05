import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://swastprova-2.onrender.com";

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email ||
    sessionStorage.getItem("swastprovaOTPEmail") ||
    "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [timer, setTimer] = useState(60);

  // =========================
  // SAVE EMAIL
  // =========================

  useEffect(() => {
    if (email) {
      sessionStorage.setItem(
        "swastprovaOTPEmail",
        email
      );
    }
  }, [email]);

  // =========================
  // OTP TIMER
  // =========================

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // =========================
  // VERIFY OTP
  // =========================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email information is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/register/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Invalid or expired OTP."
        );
      }

      setMessage(
        "Email verified successfully! Your account has been created."
      );

      sessionStorage.removeItem(
        "swastprovaOTPEmail"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      console.error(
        "OTP VERIFICATION ERROR:",
        err
      );

      setError(
        err.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESEND OTP
  // =========================

  const handleResendOTP = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email information is missing. Please register again."
      );
      return;
    }

    if (timer > 0) {
      return;
    }

    try {
      setResending(true);

      const response = await fetch(
        `${API_URL}/register/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to resend OTP."
        );
      }

      setMessage(
        "A new OTP has been sent to your email."
      );

      setOtp("");
      setTimer(60);

    } catch (err) {
      console.error(
        "RESEND OTP ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  // =========================
  // CHANGE EMAIL / BACK
  // =========================

  const handleBack = () => {
    sessionStorage.removeItem(
      "swastprovaOTPEmail"
    );

    navigate("/register");
  };

  return (
    <div style={styles.page}>

      {/* Background */}
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>

      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          🌱
        </div>

        <h1 style={styles.title}>
          Verify Your Email
        </h1>

        <p style={styles.subtitle}>
          We've sent a 6-digit verification code to
        </p>

        <div style={styles.email}>
          {email || "your email"}
        </div>

        {/* OTP FORM */}
        <form
          onSubmit={handleVerifyOTP}
          style={styles.form}
        >

          <label style={styles.label}>
            Enter OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={otp}
            placeholder="000000"
            onChange={(e) => {
              const value =
                e.target.value.replace(/\D/g, "");

              setOtp(value);
              setError("");
              setMessage("");
            }}
            style={styles.otpInput}
          />

          {/* ERROR */}
          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          {/* SUCCESS */}
          {message && (
            <div style={styles.success}>
              ✓ {message}
            </div>
          )}

          {/* VERIFY */}
          <button
            type="submit"
            disabled={
              loading ||
              otp.length !== 6
            }
            style={{
              ...styles.verifyButton,
              opacity:
                loading ||
                otp.length !== 6
                  ? 0.65
                  : 1,
            }}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP →"}
          </button>
        </form>

        {/* RESEND */}
        <div style={styles.resendArea}>

          {timer > 0 ? (
            <p style={styles.timerText}>
              Resend OTP in{" "}
              <strong>
                {timer}s
              </strong>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              style={styles.resendButton}
            >
              {resending
                ? "Sending..."
                : "Resend OTP"}
            </button>
          )}

        </div>

        {/* BACK */}
        <button
          type="button"
          onClick={handleBack}
          style={styles.backButton}
        >
          ← Back to Registration
        </button>

        {/* SECURITY */}
        <div style={styles.info}>
          🔒 Your verification code is private.
          <br />
          Never share your OTP with anyone.
        </div>

      </div>
    </div>
  );
};

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

  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "45px 40px",
    background:
      "rgba(255,255,255,0.97)",
    borderRadius: "28px",
    boxShadow:
      "0 30px 80px rgba(15,23,42,0.14)",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
  },

  logo: {
    width: "75px",
    height: "75px",
    margin: "0 auto 22px",
    borderRadius: "23px",
    background:
      "linear-gradient(135deg,#dbeafe,#f3e8ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "35px",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "30px",
    fontWeight: "900",
    color: "#0f172a",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  email: {
    marginTop: "8px",
    marginBottom: "30px",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "800",
    wordBreak: "break-word",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  label: {
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
  },

  otpInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 12px",
    borderRadius: "14px",
    border:
      "1px solid #cbd5e1",
    background: "#f8fafc",
    outline: "none",
    textAlign: "center",
    letterSpacing: "10px",
    fontSize: "26px",
    fontWeight: "900",
    color: "#0f172a",
  },

  verifyButton: {
    width: "100%",
    border: "none",
    borderRadius: "14px",
    padding: "15px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "white",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.22)",
  },

  error: {
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "left",
  },

  success: {
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "left",
  },

  resendArea: {
    marginTop: "22px",
  },

  timerText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  resendButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "13px",
  },

  backButton: {
    marginTop: "18px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  info: {
    marginTop: "25px",
    padding: "12px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#64748b",
    fontSize: "11px",
    lineHeight: "1.6",
  },
};

export default OTP;
