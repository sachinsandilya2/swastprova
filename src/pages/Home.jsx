
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleAdminLogin = () => {
    if (
      adminId === "admin" &&
      adminPassword === "Swastprova@123"
    ) {
      setAdminError("");
      setShowAdminLogin(false);
      navigate("/admin-dashboard");
    } else {
      setAdminError("Invalid Admin ID or Password");
    }
  };

  return (
    <div style={styles.page}>

      {/* ================= ADMIN BUTTON ================= */}

      <button
        style={styles.adminButton}
        onClick={() => {
          setShowAdminLogin(true);
          setAdminError("");
        }}
      >
        🔐 Admin Approval
      </button>

      {/* ================= ADMIN LOGIN ================= */}

      {showAdminLogin && (
        <div style={styles.adminOverlay}>
          <div style={styles.adminLoginBox}>

            <button
              style={styles.closeAdmin}
              onClick={() => setShowAdminLogin(false)}
            >
              ×
            </button>

            <div style={styles.adminIcon}>🔐</div>

            <h2 style={styles.adminTitle}>
              Admin Approval
            </h2>

            <p style={styles.adminSubtitle}>
              Login to manage mentor & psychologist approvals
            </p>

            <input
              type="text"
              placeholder="Admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              style={styles.adminInput}
            />

            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) =>
                setAdminPassword(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdminLogin();
                }
              }}
              style={styles.adminInput}
            />

            {adminError && (
              <p style={styles.adminError}>
                ❌ {adminError}
              </p>
            )}

            <button
              style={styles.adminLoginButton}
              onClick={handleAdminLogin}
            >
              Login to Admin Panel →
            </button>
          </div>
        </div>
      )}

      {/* ================= HERO ================= */}

      <section style={styles.heroSection}>

        <div style={styles.glowOne}></div>
        <div style={styles.glowTwo}></div>

        {/* HERO CONTENT */}

        <div style={styles.heroContent}>

          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>

            <span>
              AI-Powered Health & Personal Growth
            </span>
          </div>

          <div style={styles.logo}>
            🌱
          </div>

          <h1 style={styles.title}>

            <span>Your Mind.</span>

            <br />

            <span style={styles.gradientText}>
              Your Health.
            </span>

            <br />

            <span>Your Future.</span>

          </h1>

          <p style={styles.subtitle}>
            Mental Health • Mentorship • AI Guidance
          </p>

          <p style={styles.description}>
            Swastprova helps you understand yourself,
            improve your well-being and move forward
            with the right guidance.
          </p>

          {/* BUTTONS */}

          <div style={styles.buttonContainer}>

            {/* ASSESSMENT BUTTON */}

            <button
              style={styles.primaryBtn}
              onClick={() => navigate("/assessment")}
            >
              🧠 Stress & Trauma Assessment

              <span style={styles.arrow}>
                →
              </span>
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => navigate("/health")}
            >
              🩺 Explore Health
            </button>

          </div>

          {/* TRUST */}

          <div style={styles.trust}>
            <span>✓ Simple</span>
            <span>✓ Supportive</span>
            <span>✓ Accessible</span>
          </div>

        </div>

        {/* ================= VISUAL ================= */}

        <div style={styles.visualArea}>

          <div style={styles.mainCircle}>

            <div style={styles.innerCircle}>

              <span style={styles.bigEmoji}>
                🧠
              </span>

              <strong style={styles.circleTitle}>
                Better
                <br />
                Every Day
              </strong>

              <span style={styles.circleText}>
                Mind • Body • Growth
              </span>

            </div>

          </div>

          {/* CARD 1 */}

          <div
            style={{
              ...styles.floatingCard,
              ...styles.cardTop,
            }}
          >

            <span>🧠</span>

            <div style={styles.cardContent}>
              <strong>Mental Wellness</strong>
              <small>Understand your mind</small>
            </div>

          </div>

          {/* CARD 2 */}

          <div
            style={{
              ...styles.floatingCard,
              ...styles.cardRight,
            }}
          >

            <span>🤖</span>

            <div style={styles.cardContent}>
              <strong>AI Guidance</strong>
              <small>Reflect & grow</small>
            </div>

          </div>

          {/* CARD 3 */}

          <div
            style={{
              ...styles.floatingCard,
              ...styles.cardBottom,
            }}
          >

            <span>🎯</span>

            <div style={styles.cardContent}>
              <strong>Personal Growth</strong>
              <small>Build your future</small>
            </div>

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section style={styles.featuresSection}>

        <div style={styles.sectionHeader}>

          <span style={styles.sectionBadge}>
            WHAT WE OFFER
          </span>

          <h2 style={styles.sectionTitle}>
            Everything you need{" "}
            <span style={styles.blueText}>
              to move forward.
            </span>
          </h2>

          <p style={styles.sectionDescription}>
            One platform for mental wellness,
            health awareness and personal growth.
          </p>

        </div>

        <div style={styles.featuresGrid}>

          {/* FIXED ROUTE: /livechat */}

          <FeatureCard
            icon="🧭"
            title="Life Compass AI"
            description="Talk with Swastprova AI, reflect on your thoughts and get practical guidance."
            onClick={() => navigate("/livechat")}
          />

          {/* ASSESSMENT */}

          <FeatureCard
            icon="🧠"
            title="AI Stress & Trauma Assessment"
            description="Get an AI-assisted assessment of possible stress and trauma indicators from your current interaction."
            onClick={() => navigate("/assessment")}
          />

          {/* MENTAL HEALTH */}

          <FeatureCard
            icon="🧠"
            title="Mental Health"
            description="Learn about emotional well-being, stress management and healthy habits."
            onClick={() => navigate("/mental-health")}
          />

          {/* PROFESSIONAL SUPPORT */}

          <FeatureCard
            icon="👨‍⚕️"
            title="Professional Support"
            description="Explore psychologists and find the right support for your needs."
            onClick={() => navigate("/psychologists")}
          />

          {/* MENTORSHIP */}

          <FeatureCard
            icon="🎓"
            title="Mentorship"
            description="Connect with mentors and learn from people with experience."
            onClick={() => navigate("/mentors")}
          />

        </div>

      </section>

      {/* ================= STATS ================= */}

      <section style={styles.statsSection}>

        <div style={styles.stat}>
          <strong>01</strong>
          <span>AI Guidance</span>
        </div>

        <div style={styles.stat}>
          <strong>02</strong>
          <span>Health Awareness</span>
        </div>

        <div style={styles.stat}>
          <strong>03</strong>
          <span>Expert Support</span>
        </div>

        <div style={styles.stat}>
          <strong>04</strong>
          <span>Personal Growth</span>
        </div>

      </section>

      {/* ================= CTA ================= */}

      <section style={styles.ctaSection}>

        <div style={styles.ctaBox}>

          <div style={styles.ctaEmoji}>
            🌱
          </div>

          <h2 style={styles.ctaTitle}>
            Start your journey today.
          </h2>

          <p style={styles.ctaText}>
            Small steps today can create
            a stronger tomorrow.
          </p>

          <button
            style={styles.ctaButton}
            onClick={() => navigate("/assessment")}
          >
            Start with AI Stress Assessment →
          </button>

        </div>

      </section>

    </div>
  );
}


/* =====================================================
   FEATURE CARD
===================================================== */

function FeatureCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <div
      style={styles.featureCard}
      onClick={onClick}
    >

      <div style={styles.featureIcon}>
        {icon}
      </div>

      <h3 style={styles.featureTitle}>
        {title}
      </h3>

      <p style={styles.featureDescription}>
        {description}
      </p>

      <span style={styles.learnMore}>
        Explore →
      </span>

    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

  /* ================= PAGE ================= */

  page: {
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100%",
    background: "#f8fafc",
    color: "#0f172a",
    overflowX: "hidden",
  },

  /* ================= ADMIN ================= */

  adminButton: {
    position: "fixed",
    top: "85px",
    right: "20px",
    zIndex: 1000,
    padding: "10px 15px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.12)",
  },

  adminOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(6px)",
  },

  adminLoginBox: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    padding: "35px",
    borderRadius: "22px",
    background: "#ffffff",
    boxShadow:
      "0 30px 80px rgba(15,23,42,0.25)",
    boxSizing: "border-box",
  },

  closeAdmin: {
    position: "absolute",
    top: "12px",
    right: "15px",
    border: "none",
    background: "transparent",
    fontSize: "28px",
    color: "#64748b",
    cursor: "pointer",
  },

  adminIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 15px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    fontSize: "28px",
  },

  adminTitle: {
    textAlign: "center",
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: "24px",
  },

  adminSubtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "25px",
  },

  adminInput: {
    width: "100%",
    padding: "14px 15px",
    marginBottom: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    outline: "none",
    fontSize: "15px",
    background: "#f8fafc",
    boxSizing: "border-box",
  },

  adminError: {
    margin: "5px 0 15px",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
  },

  adminLoginButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
  },

  /* ================= HERO ================= */

  heroSection: {
    position: "relative",
    width: "100%",
    minHeight: "720px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "50px",
    padding: "100px 6%",
    background:
      "linear-gradient(135deg,#eff6ff 0%,#ffffff 48%,#f5f3ff 100%)",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
    flex: "1 1 500px",
    width: "100%",
    maxWidth: "700px",
    minWidth: 0,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "9px 16px",
    borderRadius: "50px",
    background: "#ffffff",
    border: "1px solid #dbeafe",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow:
      "0 8px 25px rgba(37,99,235,0.08)",
    marginBottom: "25px",
    maxWidth: "100%",
    boxSizing: "border-box",
  },

  badgeDot: {
    width: "8px",
    height: "8px",
    minWidth: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  logo: {
    fontSize: "42px",
    marginBottom: "8px",
  },

  title: {
    fontSize: "clamp(42px,6vw,76px)",
    lineHeight: "1.05",
    letterSpacing: "-3px",
    margin: "0 0 22px",
    fontWeight: "900",
    maxWidth: "100%",
  },

  gradientText: {
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    fontSize: "20px",
    lineHeight: "1.4",
    color: "#2563eb",
    fontWeight: "800",
    marginBottom: "18px",
  },

  description: {
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#475569",
    maxWidth: "600px",
    marginBottom: "32px",
  },

  buttonContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    width: "100%",
  },

  primaryBtn: {
    padding: "16px 25px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.25)",
  },

  arrow: {
    marginLeft: "12px",
    fontSize: "20px",
  },

  secondaryBtn: {
    padding: "16px 25px",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
  },

  trust: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "28px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },

  /* ================= VISUAL ================= */

  visualArea: {
    position: "relative",
    flex: "1 1 360px",
    width: "100%",
    maxWidth: "420px",
    height: "420px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
  },

  mainCircle: {
    width: "330px",
    height: "330px",
    maxWidth: "78vw",
    maxHeight: "78vw",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#dbeafe,#ede9fe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 30px 80px rgba(37,99,235,0.15)",
  },

  innerCircle: {
    width: "250px",
    height: "250px",
    maxWidth: "65vw",
    maxHeight: "65vw",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "inset 0 0 40px rgba(37,99,235,0.06)",
  },

  bigEmoji: {
    fontSize: "58px",
    marginBottom: "12px",
  },

  circleTitle: {
    fontSize: "24px",
    textAlign: "center",
    lineHeight: "1.2",
  },

  circleText: {
    marginTop: "10px",
    color: "#64748b",
    fontSize: "13px",
    textAlign: "center",
  },

  floatingCard: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow:
      "0 15px 35px rgba(15,23,42,0.10)",
    fontSize: "23px",
    backdropFilter: "blur(10px)",
    maxWidth: "185px",
    boxSizing: "border-box",
  },

  cardContent: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },

  cardTop: {
    top: "5px",
    left: "0",
  },

  cardRight: {
    right: "0",
    top: "155px",
  },

  cardBottom: {
    bottom: "5px",
    left: "20px",
  },

  /* ================= FEATURES ================= */

  featuresSection: {
    padding: "90px 6%",
    background: "#ffffff",
    boxSizing: "border-box",
    width: "100%",
    overflow: "hidden",
  },

  sectionHeader: {
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto 55px",
  },

  sectionBadge: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  sectionTitle: {
    fontSize: "clamp(32px,4vw,48px)",
    lineHeight: "1.15",
    margin: "15px 0",
    letterSpacing: "-1.5px",
  },

  blueText: {
    color: "#2563eb",
  },

  sectionDescription: {
    color: "#64748b",
    fontSize: "17px",
    lineHeight: "1.7",
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(min(230px,100%),1fr))",
    gap: "22px",
    maxWidth: "1200px",
    width: "100%",
    margin: "auto",
  },

  featureCard: {
    padding: "30px",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
    cursor: "pointer",
    transition: "all .3s ease",
    minWidth: 0,
    overflow: "hidden",
  },

  featureIcon: {
    width: "58px",
    height: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    background: "#eff6ff",
    fontSize: "27px",
    marginBottom: "20px",
  },

  featureTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    lineHeight: "1.3",
  },

  featureDescription: {
    color: "#64748b",
    lineHeight: "1.7",
    fontSize: "14px",
  },

  learnMore: {
    display: "inline-block",
    marginTop: "15px",
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "14px",
  },

  /* ================= STATS ================= */

  statsSection: {
    padding: "45px 6%",
    background: "#0f172a",
    color: "#ffffff",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(min(180px,100%),1fr))",
    gap: "25px",
    textAlign: "center",
    boxSizing: "border-box",
    width: "100%",
  },

  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    minWidth: 0,
  },

  /* ================= CTA ================= */

  ctaSection: {
    padding: "80px 6%",
    background:
      "linear-gradient(135deg,#eff6ff,#f5f3ff)",
    boxSizing: "border-box",
    width: "100%",
    overflow: "hidden",
  },

  ctaBox: {
    maxWidth: "900px",
    width: "100%",
    margin: "auto",
    textAlign: "center",
    padding: "60px 20px",
    borderRadius: "30px",
    background: "#ffffff",
    boxShadow:
      "0 25px 70px rgba(15,23,42,0.08)",
    boxSizing: "border-box",
  },

  ctaEmoji: {
    fontSize: "45px",
  },

  ctaTitle: {
    fontSize: "clamp(30px,4vw,46px)",
    lineHeight: "1.2",
    margin: "15px 0",
  },

  ctaText: {
    color: "#64748b",
    fontSize: "17px",
    lineHeight: "1.6",
    marginBottom: "28px",
  },

  ctaButton: {
    padding: "15px 25px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
    maxWidth: "100%",
  },
};
