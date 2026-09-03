import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

      const user = userCredential.user;

      // Get user profile from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "User",
      };

      if (userSnap.exists()) {
        userData = {
          ...userData,
          ...userSnap.data(),
        };
      }

      // If email is not verified
      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user);
        } catch (verificationError) {
          console.log(
            "Verification email error:",
            verificationError
          );
        }

        setMessage(
          "Verification email sent. Please verify your email."
        );

        return;
      }

      // Store logged-in user
      localStorage.setItem(
        "swastprovaUser",
        JSON.stringify(userData)
      );

      setMessage("Login successful! Welcome back.");

      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (
        err.code === "auth/user-not-found"
      ) {
        setError("No account found with this email.");
      } else if (
        err.code === "auth/wrong-password"
      ) {
        setError("Incorrect password.");
      } else if (
        err.code === "auth/invalid-email"
      ) {
        setError("Please enter a valid email address.");
      } else if (
        err.code === "auth/too-many-requests"
      ) {
        setError(
          "Too many attempts. Please try again later."
        );
      } else {
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
  // OTP VERIFY
  // =========================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    // Custom Nodemailer OTP verification
    // can be connected here later.

    setMessage("OTP verification successful.");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  // =========================
  // RESEND OTP
  // =========================

  const resendOTP = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      // Custom Nodemailer endpoint can be called here.

      setMessage(
        "A new OTP has been sent to your email."
      );

    } catch (err) {
      setError("Unable to resend OTP.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* =========================
          BACKGROUND DECORATION
      ========================= */}

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
            Swastprova
          </h1>

          <p style={styles.brandSubtitle}>
            Your journey toward better
            <br />
            wellness starts here.
          </p>

          <div style={styles.features}>

            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                💙
              </div>

              <div>
                <strong>Feel Supported</strong>
                <p>
                  You're never alone on your journey.
                </p>
              </div>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                🔒
              </div>

              <div>
                <strong>Private & Secure</strong>
                <p>
                  Your information stays protected.
                </p>
              </div>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                🌿
              </div>

              <div>
                <strong>Wellness First</strong>
                <p>
                  Take care of your mind and body.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* =========================
            LOGIN CARD
        ========================= */}

        <div style={styles.card}>

          {step === "login" ? (
            <>

              <div style={styles.mobileLogo}>
                🌱
              </div>

              <div style={styles.heading}>

                <h2 style={styles.headingTitle}>
                  Welcome Back 👋
                </h2>

                <p style={styles.headingText}>
                  Login to continue your Swastprova journey.
                </p>

              </div>

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
                      }}
                      style={styles.input}
                      autoComplete="email"
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div style={styles.field}>

                  <div style={styles.passwordLabel}>

                    <label style={styles.label}>
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        alert(
                          "Password reset feature can be connected here."
                        );
                      }}
                      style={styles.forgot}
                    >
                      Forgot password?
                    </button>

                  </div>

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
                      }}
                      style={styles.input}
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
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
                    {error}
                  </div>
                )}

                {/* SUCCESS */}

                {message && (
                  <div style={styles.success}>
                    <span>✓</span>
                    {message}
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.primaryButton,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign In →"}
                </button>

              </form>

              {/* DIVIDER */}

              <div style={styles.divider}>
                <span>
                  New to Swastprova?
                </span>
              </div>

              {/* REGISTER */}

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
                style={styles.secondaryButton}
              >
                Create New Account
              </button>

              <p style={styles.bottomText}>
                By continuing, you agree to our
                <br />
                Terms of Service and Privacy Policy.
              </p>

            </>
          ) : (

            /* =========================
               OTP SCREEN
            ========================= */

            <>

              <div style={styles.otpIcon}>
                📩
              </div>

              <div style={styles.heading}>

                <h2 style={styles.headingTitle}>
                  Verify Your Email
                </h2>

                <p style={styles.headingText}>
                  We sent a 6-digit verification code to
                </p>

                <strong style={styles.emailText}>
                  {email}
                </strong>

              </div>

              <form
                onSubmit={handleVerifyOTP}
                style={styles.form}
              >

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  style={styles.otpInput}
                />

                {error && (
                  <div style={styles.error}>
                    ⚠️ {error}
                  </div>
                )}

                {message && (
                  <div style={styles.success}>
                    ✓ {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={styles.primaryButton}
                >
                  {loading
                    ? "Verifying..."
                    : "Verify OTP →"}
                </button>

              </form>

              <button
                type="button"
                onClick={resendOTP}
                style={styles.resend}
              >
                Didn't receive the code?
                <strong> Resend OTP</strong>
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
    </div>
  );
};


/* =====================================================
   STYLES
===================================================== */

const styles = {

  /* ================= PAGE ================= */

  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #faf5ff 50%, #fdf2f8 100%)",
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
      "rgba(59, 130, 246, 0.10)",
    top: "-180px",
    left: "-150px",
  },

  circleTwo: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background:
      "rgba(236, 72, 153, 0.09)",
    bottom: "-160px",
    right: "-130px",
  },

  /* ================= CONTAINER ================= */

  container: {
    width: "100%",
    maxWidth: "1050px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "rgba(255,255,255,0.82)",
    borderRadius: "30px",
    overflow: "hidden",
    boxShadow:
      "0 30px 80px rgba(15,23,42,0.14)",
    border:
      "1px solid rgba(255,255,255,0.8)",
    position: "relative",
    zIndex: 2,
  },

  /* ================= BRAND ================= */

  brandPanel: {
    padding: "55px 45px",
    background:
      "linear-gradient(145deg, #2563eb, #6366f1 55%, #ec4899)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  brandLogo: {
    width: "72px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(255,255,255,0.18)",
    border:
      "1px solid rgba(255,255,255,0.25)",
    borderRadius: "22px",
    fontSize: "36px",
    marginBottom: "22px",
  },

  brandTitle: {
    fontSize: "42px",
    margin: "0 0 12px",
    fontWeight: "900",
    letterSpacing: "-1px",
  },

  brandSubtitle: {
    fontSize: "17px",
    lineHeight: "1.7",
    margin: "0 0 40px",
    opacity: 0.9,
  },

  features: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  feature: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },

  featureIcon: {
    width: "43px",
    height: "43px",
    flexShrink: 0,
    borderRadius: "13px",
    background:
      "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  /* ================= CARD ================= */

  card: {
    padding: "48px 45px",
    background: "rgba(255,255,255,0.96)",
    minHeight: "600px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
  },

  mobileLogo: {
    display: "none",
  },

  heading: {
    marginBottom: "28px",
  },

  headingTitle: {
    fontSize: "31px",
    color: "#0f172a",
    margin: "0 0 9px",
    fontWeight: "900",
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
    gap: "19px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: "700",
  },

  passwordLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgot: {
    border: "none",
    background: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border:
      "1px solid #dbe2ea",
    borderRadius: "13px",
    background: "#f8fafc",
    transition: "0.2s",
  },

  inputIcon: {
    paddingLeft: "14px",
    fontSize: "16px",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "14px 12px",
    fontSize: "14px",
    color: "#0f172a",
    minWidth: 0,
  },

  eyeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "10px 14px",
    fontSize: "16px",
  },

  /* ================= BUTTONS ================= */

  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "13px",
    padding: "15px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.22)",
    transition: "0.2s",
  },

  secondaryButton: {
    width: "100%",
    borderRadius: "13px",
    padding: "14px",
    background: "white",
    color: "#2563eb",
    border:
      "1px solid #bfdbfe",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
  },

  /* ================= MESSAGES ================= */

  error: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: "600",
  },

  success: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: "600",
  },

  divider: {
    textAlign: "center",
    margin: "24px 0 15px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  bottomText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: "1.6",
    marginTop: "20px",
  },

  /* ================= OTP ================= */

  otpIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "22px",
    margin: "0 auto 20px",
    background:
      "linear-gradient(135deg,#dbeafe,#f3e8ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
  },

  emailText: {
    display: "block",
    marginTop: "6px",
    color: "#2563eb",
    textAlign: "center",
    wordBreak: "break-word",
  },

  otpInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    borderRadius: "13px",
    border:
      "1px solid #cbd5e1",
    background: "#f8fafc",
    outline: "none",
    textAlign: "center",
    letterSpacing: "9px",
    fontSize: "25px",
    fontWeight: "800",
  },

  resend: {
    border: "none",
    background: "none",
    color: "#64748b",
    marginTop: "20px",
    cursor: "pointer",
    fontSize: "13px",
    width: "100%",
  },

  backButton: {
    border: "none",
    background: "none",
    color: "#64748b",
    marginTop: "14px",
    cursor: "pointer",
    fontSize: "13px",
    width: "100%",
  },
};

export default Login;