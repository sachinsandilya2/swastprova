import { useNavigate } from "react-router-dom";

export default function Health() {
  const navigate = useNavigate();

  const services = [
    {
      icon: "🧭",
      title: "Life Compass AI",
      desc: "AI-powered reflection, guidance and personal support.",
      path: "/livechat",
      tag: "AI",
    },

    {
      icon: "🧠",
      title: "Mental Health",
      desc: "Learn about stress, emotions and mental well-being.",
      path: "/mental-health",
      tag: "Wellness",
    },

    {
      icon: "👨‍⚕️",
      title: "Psychologists",
      desc: "Explore professional mental health support.",
      path: "/psychologists",
      tag: "Experts",
    },

    {
      icon: "🎯",
      title: "Mentorship",
      desc: "Get guidance from experienced mentors.",
      path: "/mentors",
      tag: "Growth",
    },

    {
      icon: "📈",
      title: "Progress",
      desc: "Track your personal development journey.",
      path: "/progress",
      tag: "Track",
    },

    {
      icon: "📚",
      title: "Articles",
      desc: "Discover useful knowledge for everyday life.",
      path: "/articles",
      tag: "Learn",
    },

    {
      icon: "🤝",
      title: "Community",
      desc: "Connect, share and learn with others.",
      path: "/community",
      tag: "Connect",
    },

    /* ================= NEW ================= */

    {
      icon: "🎙️",
      title: "Voice Assessment",
      desc: "Record your voice to screen stress, distress indicators and emotional patterns.",
      path: "/voice-assessment",
      tag: "Voice AI",
    },

    {
      icon: "🛡️",
      title: "Protection Support",
      desc: "Access victim and witness protection, legal assistance, relocation and safety support.",
      path: "/protection-support",
      tag: "Safety",
    },

    {
      icon: "🚨",
      title: "Emergency Support",
      desc: "Immediate crisis support, emergency contacts and professional help.",
      path: "/emergency-support",
      tag: "Emergency",
    },

    {
      icon: "📞",
      title: "Contact",
      desc: "Have a question? Reach out to our team.",
      path: "/contact",
      tag: "Support",
    },
  ];

  return (
    <div style={styles.page}>

      {/* ================= HERO ================= */}

      <section style={styles.hero}>

        <div style={styles.heroBadge}>
          <span style={styles.greenDot}></span>
          Swastprova Wellness Platform
        </div>

        <div style={styles.heroIcon}>
          🩺
        </div>

        <h1 style={styles.title}>
          Health &
          <span style={styles.gradientText}>
            {" "}Mentorship
          </span>
        </h1>

        <p style={styles.subtitle}>
          Everything you need for better mental wellness,
          health awareness and personal growth.
        </p>

        <div style={styles.heroButtons}>

          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/livechat")}
          >
            🧭 Start with AI
            <span style={styles.arrow}>→</span>
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/mental-health")}
          >
            🧠 Explore Wellness
          </button>

        </div>

      </section>


      {/* ================= QUICK INFO ================= */}

      <section style={styles.infoSection}>

        <div style={styles.infoCard}>
          <span style={styles.infoCardIcon}>🧠</span>

          <div>
            <strong>Mental Wellness</strong>
            <small>Understand yourself</small>
          </div>
        </div>

        <div style={styles.infoCard}>
          <span style={styles.infoCardIcon}>🎙️</span>

          <div>
            <strong>Voice Screening</strong>
            <small>Check distress indicators</small>
          </div>
        </div>

        <div style={styles.infoCard}>
          <span style={styles.infoCardIcon}>🛡️</span>

          <div>
            <strong>Safety Support</strong>
            <small>Protection & assistance</small>
          </div>
        </div>

      </section>


      {/* ================= SERVICES ================= */}

      <section style={styles.servicesSection}>

        <div style={styles.sectionHeader}>

          <span style={styles.sectionBadge}>
            EXPLORE SERVICES
          </span>

          <h2 style={styles.sectionTitle}>
            Your wellness journey,
            <span style={styles.blueText}>
              {" "}all in one place.
            </span>
          </h2>

          <p style={styles.sectionDescription}>
            Choose a service and take the next step
            towards a healthier and stronger you.
          </p>

        </div>


        <div style={styles.grid}>

          {services.map((item, index) => (

            <div
              key={index}
              style={styles.card}
              onClick={() => navigate(item.path)}

              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-8px)";

                e.currentTarget.style.boxShadow =
                  "0 25px 50px rgba(15,23,42,0.12)";

                e.currentTarget.style.borderColor =
                  "#bfdbfe";
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";

                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(15,23,42,0.06)";

                e.currentTarget.style.borderColor =
                  "#e2e8f0";
              }}
            >

              {/* TAG */}

              <div style={styles.tag}>
                {item.tag}
              </div>


              {/* ICON */}

              <div
                style={{
                  ...styles.icon,

                  ...(item.title === "Voice Assessment"
                    ? styles.voiceIcon
                    : {}),

                  ...(item.title === "Protection Support"
                    ? styles.protectionIcon
                    : {}),
                }}
              >
                {item.icon}
              </div>


              {/* CONTENT */}

              <h3 style={styles.cardTitle}>
                {item.title}
              </h3>

              <p style={styles.cardDescription}>
                {item.desc}
              </p>


              {/* EXPLORE */}

              <button
                style={styles.btn}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(item.path);
                }}
              >
                Explore
                <span>→</span>
              </button>

            </div>

          ))}

        </div>

      </section>


      {/* ================= SPECIAL ASSESSMENT CTA ================= */}

      <section style={styles.assessmentSection}>

        <div style={styles.assessmentBox}>

          <div style={styles.micCircle}>
            🎙️
          </div>

          <div style={styles.assessmentContent}>

            <span style={styles.assessmentBadge}>
              NEW • VOICE SCREENING
            </span>

            <h2 style={styles.assessmentTitle}>
              Check your stress indicators through voice
            </h2>

            <p style={styles.assessmentText}>
              Record a short voice sample and receive
              a screening summary of voice-related
              stress and distress indicators.
            </p>

            <button
              style={styles.assessmentButton}
              onClick={() => navigate("/voice-assessment")}
            >
              🎙️ Start Voice Assessment
              <span>→</span>
            </button>

          </div>

        </div>

      </section>


      {/* ================= PROTECTION CTA ================= */}

      <section style={styles.protectionSection}>

        <div style={styles.protectionBox}>

          <div style={styles.shieldCircle}>
            🛡️
          </div>

          <div style={styles.protectionContent}>

            <span style={styles.protectionBadge}>
              SAFETY & SUPPORT
            </span>

            <h2 style={styles.protectionTitle}>
              Need protection or assistance?
            </h2>

            <p style={styles.protectionText}>
              Find information about victim and witness
              protection, legal assistance, safe relocation,
              counselling and other support pathways.
            </p>

            <button
              style={styles.protectionButton}
              onClick={() =>
                navigate("/protection-support")
              }
            >
              🛡️ Explore Protection Support
              <span>→</span>
            </button>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section style={styles.ctaSection}>

        <div style={styles.ctaBox}>

          <div style={styles.ctaEmoji}>
            🌱
          </div>

          <h2 style={styles.ctaTitle}>
            Not sure where to start?
          </h2>

          <p style={styles.ctaText}>
            Start a conversation with Life Compass AI
            and discover your next step.
          </p>

          <button
            style={styles.ctaButton}
            onClick={() => navigate("/livechat")}
          >
            Talk to Life Compass AI →
          </button>

        </div>

      </section>


      {/* ================= BACK ================= */}

      <button
        style={styles.backBtn}
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </button>

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
    background: "#f8fafc",
    color: "#0f172a",
    overflow: "hidden",
  },


  /* ================= HERO ================= */

  hero: {
    position: "relative",
    textAlign: "center",
    padding: "90px 20px 75px",
    background:
      "linear-gradient(135deg,#eff6ff 0%,#ffffff 50%,#f5f3ff 100%)",
  },


  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "9px 17px",
    borderRadius: "50px",
    background: "#ffffff",
    border: "1px solid #dbeafe",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
    boxShadow:
      "0 8px 25px rgba(37,99,235,0.08)",
    marginBottom: "25px",
  },


  greenDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },


  heroIcon: {
    fontSize: "52px",
    marginBottom: "10px",
  },


  title: {
    fontSize:
      "clamp(42px,6vw,70px)",
    lineHeight: "1.05",
    letterSpacing: "-3px",
    margin: "0 0 20px",
    fontWeight: "900",
  },


  gradientText: {
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },


  subtitle: {
    maxWidth: "680px",
    margin: "0 auto",
    color: "#64748b",
    fontSize: "18px",
    lineHeight: "1.8",
  },


  heroButtons: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "32px",
  },


  primaryBtn: {
    padding: "15px 25px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.25)",
    transition: "0.3s",
  },


  arrow: {
    marginLeft: "12px",
    fontSize: "19px",
  },


  secondaryBtn: {
    padding: "15px 25px",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
  },


  /* ================= INFO ================= */

  infoSection: {
    maxWidth: "1050px",
    margin: "-30px auto 0",
    padding: "0 20px",
    position: "relative",
    zIndex: 3,
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
  },


  infoCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 12px 30px rgba(15,23,42,0.07)",
  },


  infoCardIcon: {
    fontSize: "30px",
  },


  /* ================= SERVICES ================= */

  servicesSection: {
    padding: "100px 7%",
  },


  sectionHeader: {
    textAlign: "center",
    maxWidth: "720px",
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
    letterSpacing: "-1.5px",
    margin: "15px 0",
  },


  blueText: {
    color: "#2563eb",
  },


  sectionDescription: {
    color: "#64748b",
    fontSize: "17px",
    lineHeight: "1.7",
  },


  grid: {
    maxWidth: "1200px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "22px",
  },


  card: {
    position: "relative",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "30px",
    minHeight: "270px",
    boxSizing: "border-box",
    cursor: "pointer",
    transition: "all .3s ease",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
  },


  tag: {
    position: "absolute",
    top: "18px",
    right: "18px",
    padding: "5px 10px",
    borderRadius: "50px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "800",
  },


  icon: {
    width: "65px",
    height: "65px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg,#eff6ff,#f5f3ff)",
    fontSize: "31px",
    marginBottom: "22px",
  },


  /* ================= VOICE ICON ================= */

  voiceIcon: {
    background:
      "linear-gradient(135deg,#dbeafe,#ede9fe)",
    fontSize: "34px",
    boxShadow:
      "0 8px 20px rgba(79,70,229,0.12)",
  },


  /* ================= PROTECTION ICON ================= */

  protectionIcon: {
    background:
      "linear-gradient(135deg,#dcfce7,#dbeafe)",
    fontSize: "34px",
    boxShadow:
      "0 8px 20px rgba(34,197,94,0.12)",
  },


  cardTitle: {
    fontSize: "21px",
    margin: "0 0 10px",
  },


  cardDescription: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.7",
    minHeight: "50px",
  },


  btn: {
    marginTop: "18px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "800",
  },


  /* ================= VOICE ASSESSMENT ================= */

  assessmentSection: {
    padding: "0 7% 50px",
  },


  assessmentBox: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "38px",
    borderRadius: "26px",
    background:
      "linear-gradient(135deg,#eef2ff,#ffffff)",
    border: "1px solid #c7d2fe",
    display: "flex",
    alignItems: "center",
    gap: "30px",
    boxShadow:
      "0 18px 45px rgba(79,70,229,0.08)",
    boxSizing: "border-box",
  },


  micCircle: {
    width: "90px",
    height: "90px",
    minWidth: "90px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    fontSize: "42px",
    boxShadow:
      "0 15px 30px rgba(79,70,229,0.25)",
  },


  assessmentContent: {
    flex: 1,
  },


  assessmentBadge: {
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.5px",
    color: "#4f46e5",
  },


  assessmentTitle: {
    margin: "8px 0 10px",
    fontSize: "clamp(24px,3vw,34px)",
  },


  assessmentText: {
    color: "#64748b",
    lineHeight: "1.7",
    maxWidth: "720px",
    marginBottom: "20px",
  },


  assessmentButton: {
    padding: "13px 20px",
    border: "none",
    borderRadius: "12px",
    background: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "14px",
  },


  /* ================= PROTECTION ================= */

  protectionSection: {
    padding: "0 7% 70px",
  },


  protectionBox: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "38px",
    borderRadius: "26px",
    background:
      "linear-gradient(135deg,#f0fdf4,#ffffff)",
    border: "1px solid #bbf7d0",
    display: "flex",
    alignItems: "center",
    gap: "30px",
    boxShadow:
      "0 18px 45px rgba(22,163,74,0.07)",
    boxSizing: "border-box",
  },


  shieldCircle: {
    width: "90px",
    height: "90px",
    minWidth: "90px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#16a34a,#2563eb)",
    fontSize: "42px",
    boxShadow:
      "0 15px 30px rgba(22,163,74,0.20)",
  },


  protectionContent: {
    flex: 1,
  },


  protectionBadge: {
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.5px",
    color: "#16a34a",
  },


  protectionTitle: {
    margin: "8px 0 10px",
    fontSize: "clamp(24px,3vw,34px)",
  },


  protectionText: {
    color: "#64748b",
    lineHeight: "1.7",
    maxWidth: "720px",
    marginBottom: "20px",
  },


  protectionButton: {
    padding: "13px 20px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "14px",
  },


  /* ================= CTA ================= */

  ctaSection: {
    padding: "20px 7% 80px",
  },


  ctaBox: {
    maxWidth: "900px",
    margin: "auto",
    textAlign: "center",
    padding: "60px 25px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "#ffffff",
    boxShadow:
      "0 25px 60px rgba(15,23,42,0.18)",
  },


  ctaEmoji: {
    fontSize: "45px",
  },


  ctaTitle: {
    fontSize:
      "clamp(30px,4vw,45px)",
    margin: "15px 0 10px",
  },


  ctaText: {
    color: "#cbd5e1",
    fontSize: "17px",
    lineHeight: "1.7",
    marginBottom: "28px",
  },


  ctaButton: {
    padding: "15px 24px",
    border: "none",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
  },


  /* ================= BACK ================= */

  backBtn: {
    display: "block",
    margin: "0 auto 60px",
    padding: "13px 22px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "700",
  },

};