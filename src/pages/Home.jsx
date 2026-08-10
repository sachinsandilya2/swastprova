import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* ================= HERO ================= */}

      <section style={styles.heroSection}>

        {/* Background decorations */}
        <div style={styles.glowOne}></div>
        <div style={styles.glowTwo}></div>

        <div style={styles.heroContent}>

          {/* Badge */}
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            AI-Powered Health & Personal Growth
          </div>

          {/* Logo */}
          <div style={styles.logo}>
            🌱
          </div>

          {/* Heading */}
          <h1 style={styles.title}>
            Your Mind.
            <br />

            <span style={styles.gradientText}>
              Your Health.
            </span>

            <br />

            Your Future.
          </h1>

          {/* Subtitle */}
          <p style={styles.subtitle}>
            Mental Health • Mentorship • AI Guidance
          </p>

          {/* Description */}
          <p style={styles.description}>
            Swastprova helps you understand yourself,
            improve your well-being and move forward
            with the right guidance.
          </p>

          {/* Buttons */}
          <div style={styles.buttonContainer}>

            <button
              style={styles.primaryBtn}
              onClick={() =>
                navigate("/live-chat")
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 18px 35px rgba(37,99,235,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(37,99,235,0.25)";
              }}
            >
              🧭 Life Compass AI
              <span style={styles.arrow}>
                →
              </span>
            </button>


            <button
              style={styles.secondaryBtn}
              onClick={() =>
                navigate("/health")
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-4px)";
                e.currentTarget.style.background =
                  "#0f172a";
                e.currentTarget.style.color =
                  "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";
                e.currentTarget.style.background =
                  "#fff";
                e.currentTarget.style.color =
                  "#0f172a";
              }}
            >
              🩺 Explore Health
            </button>

          </div>


          {/* Trust text */}
          <div style={styles.trust}>
            <span>✓</span>
            Simple
            <span>✓</span>
            Supportive
            <span>✓</span>
            Accessible
          </div>

        </div>


        {/* ================= FLOATING VISUAL ================= */}

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


          {/* Floating cards */}

          <div
            style={{
              ...styles.floatingCard,
              ...styles.cardTop,
            }}
          >
            🧠
            <div>
              <strong>Mental Wellness</strong>
              <small>
                Understand your mind
              </small>
            </div>
          </div>


          <div
            style={{
              ...styles.floatingCard,
              ...styles.cardRight,
            }}
          >
            🤖
            <div>
              <strong>AI Guidance</strong>
              <small>
                Reflect & grow
              </small>
            </div>
          </div>


          <div
            style={{
              ...styles.floatingCard,
              ...styles.cardBottom,
            }}
          >
            🎯
            <div>
              <strong>Personal Growth</strong>
              <small>
                Build your future
              </small>
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
            Everything you need to
            <span style={styles.blueText}>
              {" "}move forward.
            </span>
          </h2>

          <p style={styles.sectionDescription}>
            One platform for mental wellness,
            health awareness and personal growth.
          </p>

        </div>


        <div style={styles.featuresGrid}>

          <FeatureCard
            icon="🧭"
            title="Life Compass AI"
            description="Talk with Swastprova AI, reflect on your thoughts and get practical guidance."
            onClick={() =>
              navigate("/live-chat")
            }
          />

          <FeatureCard
            icon="🧠"
            title="Mental Health"
            description="Learn about emotional well-being, stress management and healthy habits."
            onClick={() =>
              navigate("/mental-health")
            }
          />

          <FeatureCard
            icon="👨‍⚕️"
            title="Professional Support"
            description="Explore psychologists and find the right support for your needs."
            onClick={() =>
              navigate("/psychologists")
            }
          />

          <FeatureCard
            icon="🎓"
            title="Mentorship"
            description="Connect with mentors and learn from people with experience."
            onClick={() =>
              navigate("/mentors")
            }
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
            onClick={() =>
              navigate("/live-chat")
            }
          >
            Start with Life Compass AI →
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
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-8px)";
        e.currentTarget.style.boxShadow =
          "0 25px 50px rgba(15,23,42,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 30px rgba(15,23,42,0.06)";
      }}
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

  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    overflow: "hidden",
  },


  /* ================= HERO ================= */

  heroSection: {
    minHeight: "760px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "50px",
    padding: "90px 7%",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg,#eff6ff 0%,#ffffff 48%,#f5f3ff 100%)",
  },


  heroContent: {
    position: "relative",
    zIndex: 2,
    width: "55%",
    maxWidth: "700px",
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
  },


  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },


  logo: {
    fontSize: "42px",
    marginBottom: "5px",
  },


  title: {
    fontSize:
      "clamp(45px,6vw,76px)",
    lineHeight: "1.05",
    letterSpacing: "-3px",
    margin: "0 0 22px",
    fontWeight: "900",
  },


  gradientText: {
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },


  subtitle: {
    fontSize: "20px",
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
    transition: "all .3s ease",
  },


  arrow: {
    marginLeft: "12px",
    fontSize: "20px",
  },


  secondaryBtn: {
    padding: "16px 25px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
    transition: "all .3s ease",
  },


  trust: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "28px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },


  /* ================= VISUAL ================= */

  visualArea: {
    position: "relative",
    width: "420px",
    height: "420px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },


  mainCircle: {
    width: "330px",
    height: "330px",
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
  },


  floatingCard: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 17px",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow:
      "0 15px 35px rgba(15,23,42,0.10)",
    fontSize: "25px",
    backdropFilter: "blur(10px)",
  },


  cardTop: {
    top: "10px",
    left: "0",
  },


  cardRight: {
    right: "-10px",
    top: "160px",
  },


  cardBottom: {
    bottom: "10px",
    left: "30px",
  },


  /* ================= FEATURES ================= */

  featuresSection: {
    padding: "100px 7%",
    background: "#ffffff",
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
    fontSize:
      "clamp(32px,4vw,48px)",
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
      "repeat(auto-fit,minmax(230px,1fr))",
    gap: "22px",
    maxWidth: "1200px",
    margin: "auto",
  },


  featureCard: {
    padding: "30px",
    borderRadius: "22px",
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
    cursor: "pointer",
    transition: "all .3s ease",
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
    padding: "45px 7%",
    background: "#0f172a",
    color: "#ffffff",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "25px",
    textAlign: "center",
  },


  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },


  statStrong: {
    fontSize: "30px",
  },


  /* ================= CTA ================= */

  ctaSection: {
    padding: "90px 7%",
    background:
      "linear-gradient(135deg,#eff6ff,#f5f3ff)",
  },


  ctaBox: {
    maxWidth: "900px",
    margin: "auto",
    textAlign: "center",
    padding: "65px 25px",
    borderRadius: "30px",
    background: "#ffffff",
    boxShadow:
      "0 25px 70px rgba(15,23,42,0.08)",
  },


  ctaEmoji: {
    fontSize: "45px",
  },


  ctaTitle: {
    fontSize:
      "clamp(30px,4vw,46px)",
    margin: "15px 0",
  },


  ctaText: {
    color: "#64748b",
    fontSize: "17px",
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
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.25)",
  },

};