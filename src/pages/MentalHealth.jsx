import { useNavigate } from "react-router-dom";

const MentalHealth = () => {
  const navigate = useNavigate();

  const topics = [
    {
      icon: "🌱",
      title: "Self Growth",
      description:
        "Build confidence, develop healthy habits and understand yourself better.",
    },
    {
      icon: "😌",
      title: "Stress Management",
      description:
        "Learn simple and healthy ways to manage everyday pressure and stress.",
    },
    {
      icon: "❤️",
      title: "Emotional Wellness",
      description:
        "Understand your emotions and learn healthy ways to express them.",
    },
    {
      icon: "🧘",
      title: "Mindfulness",
      description:
        "Practice being present and create a calmer daily routine.",
    },
    {
      icon: "💬",
      title: "Talk & Connect",
      description:
        "Talking to a trusted person can make difficult moments easier to handle.",
    },
    {
      icon: "🎯",
      title: "Healthy Goals",
      description:
        "Set realistic goals and take small steps toward personal growth.",
    },
  ];

  const habits = [
    "Maintain a regular sleep routine",
    "Take short breaks during stressful work",
    "Stay physically active",
    "Spend time with supportive people",
    "Write down your thoughts when you feel overwhelmed",
    "Ask for professional support when needed",
  ];

  return (
    <div style={styles.page}>

      {/* ================= HERO ================= */}

      <section style={styles.hero}>

        <div style={styles.badge}>
          🧠 MENTAL WELLNESS
        </div>

        <h1 style={styles.heroTitle}>
          Your Mind
          <span style={styles.gradientText}>
            {" "}Matters.
          </span>
        </h1>

        <p style={styles.heroDescription}>
          Mental health is just as important as physical health.
          Learn, reflect and build healthier habits with
          Swastprova.
        </p>

        <div style={styles.heroButtons}>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/live-chat")}
          >
            🧭 Talk to Life Compass AI
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/psychologists")}
          >
            👨‍⚕️ Find Professional Support
          </button>

        </div>

      </section>


      {/* ================= INTRO ================= */}

      <section style={styles.intro}>

        <div style={styles.introIcon}>
          💙
        </div>

        <div>
          <h2 style={styles.introTitle}>
            Taking care of your mind is a strength.
          </h2>

          <p style={styles.introText}>
            Everyone experiences difficult emotions,
            stress or uncertainty sometimes. Understanding
            what you are feeling and taking healthy steps
            can be an important part of wellbeing.
          </p>
        </div>

      </section>


      {/* ================= TOPICS ================= */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>

          <span style={styles.sectionBadge}>
            EXPLORE
          </span>

          <h2 style={styles.sectionTitle}>
            Understand your
            <span style={styles.blueText}>
              {" "}mental wellness
            </span>
          </h2>

          <p style={styles.sectionDescription}>
            Explore different areas that can help you
            understand yourself and build healthier habits.
          </p>

        </div>


        <div style={styles.grid}>

          {topics.map((topic, index) => (

            <div
              key={index}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-7px)";

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

              <div style={styles.cardIcon}>
                {topic.icon}
              </div>

              <h3 style={styles.cardTitle}>
                {topic.title}
              </h3>

              <p style={styles.cardDescription}>
                {topic.description}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* ================= HEALTHY HABITS ================= */}

      <section style={styles.habitsSection}>

        <div style={styles.habitsContent}>

          <span style={styles.sectionBadge}>
            DAILY WELLNESS
          </span>

          <h2 style={styles.habitsTitle}>
            Small habits can make
            <span style={styles.blueText}>
              {" "}a difference.
            </span>
          </h2>

          <p style={styles.habitsDescription}>
            There is no single solution for everyone.
            Start with small, realistic steps that fit
            your everyday life.
          </p>

          <div style={styles.habitList}>

            {habits.map((habit, index) => (

              <div
                key={index}
                style={styles.habitItem}
              >
                <div style={styles.check}>
                  ✓
                </div>

                <span>{habit}</span>
              </div>

            ))}

          </div>

        </div>


        <div style={styles.habitVisual}>

          <div style={styles.circleLarge}>
            🧠
          </div>

          <div style={styles.visualCardOne}>
            🌱 Growth
          </div>

          <div style={styles.visualCardTwo}>
            💙 Wellbeing
          </div>

        </div>

      </section>


      {/* ================= SUPPORT ================= */}

      <section style={styles.supportSection}>

        <div style={styles.supportCard}>

          <div style={styles.supportIcon}>
            🤝
          </div>

          <h2 style={styles.supportTitle}>
            You don't have to figure everything out alone.
          </h2>

          <p style={styles.supportText}>
            If you want to reflect on what you're going
            through, Swastprova can help you find a useful
            next step.
          </p>

          <div style={styles.supportButtons}>

            <button
              style={styles.supportPrimary}
              onClick={() => navigate("/live-chat")}
            >
              🧭 Start AI Conversation →
            </button>

            <button
              style={styles.supportSecondary}
              onClick={() => navigate("/psychologists")}
            >
              Find Psychologists
            </button>

          </div>

        </div>

      </section>


      {/* ================= NOTE ================= */}

      <section style={styles.noteSection}>

        <p style={styles.note}>
          💡 Swastprova provides general wellness information
          and guidance. It is not a replacement for professional
          medical or mental health care.
        </p>

      </section>


      {/* ================= BACK ================= */}

      <button
        style={styles.backButton}
        onClick={() => navigate("/health")}
      >
        ← Back to Health & Mentorship
      </button>

    </div>
  );
};


/* =====================================================
   STYLES
===================================================== */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
  },


  /* ================= HERO ================= */

  hero: {
    textAlign: "center",
    padding: "90px 20px 80px",
    background:
      "linear-gradient(135deg,#eff6ff,#ffffff,#fdf2f8)",
  },


  badge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "50px",
    background: "#ffffff",
    border: "1px solid #dbeafe",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1.5px",
    boxShadow:
      "0 8px 25px rgba(37,99,235,0.08)",
  },


  heroTitle: {
    fontSize: "clamp(44px,7vw,76px)",
    lineHeight: "1",
    letterSpacing: "-3px",
    margin: "25px 0 20px",
    fontWeight: "900",
  },


  gradientText: {
    background:
      "linear-gradient(135deg,#2563eb,#9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },


  heroDescription: {
    maxWidth: "700px",
    margin: "0 auto",
    color: "#64748b",
    fontSize: "18px",
    lineHeight: "1.8",
  },


  heroButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "32px",
  },


  primaryButton: {
    padding: "15px 24px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "15px",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.25)",
  },


  secondaryButton: {
    padding: "15px 24px",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "15px",
  },


  /* ================= INTRO ================= */

  intro: {
    maxWidth: "950px",
    margin: "55px auto 0",
    padding: "28px",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    boxShadow:
      "0 15px 35px rgba(15,23,42,0.06)",
  },


  introIcon: {
    minWidth: "65px",
    height: "65px",
    borderRadius: "18px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
  },


  introTitle: {
    margin: "0 0 8px",
    fontSize: "22px",
  },


  introText: {
    margin: 0,
    color: "#64748b",
    lineHeight: "1.7",
  },


  /* ================= SECTION ================= */

  section: {
    maxWidth: "1200px",
    margin: "auto",
    padding: "100px 20px",
  },


  sectionHeader: {
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto 50px",
  },


  sectionBadge: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "2px",
  },


  sectionTitle: {
    fontSize: "clamp(32px,5vw,48px)",
    lineHeight: "1.15",
    letterSpacing: "-1.5px",
    margin: "15px 0",
  },


  blueText: {
    color: "#2563eb",
  },


  sectionDescription: {
    color: "#64748b",
    lineHeight: "1.7",
    fontSize: "16px",
  },


  /* ================= GRID ================= */

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(270px,1fr))",
    gap: "22px",
  },


  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "30px",
    transition: "all .3s ease",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
  },


  cardIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg,#eff6ff,#fdf2f8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "31px",
    marginBottom: "22px",
  },


  cardTitle: {
    fontSize: "21px",
    margin: "0 0 10px",
  },


  cardDescription: {
    color: "#64748b",
    lineHeight: "1.7",
    margin: 0,
  },


  /* ================= HABITS ================= */

  habitsSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",
    gap: "60px",
    alignItems: "center",
    maxWidth: "1100px",
    margin: "auto",
    padding: "40px 20px 100px",
  },


  habitsContent: {
    maxWidth: "600px",
  },


  habitsTitle: {
    fontSize: "clamp(32px,4vw,46px)",
    lineHeight: "1.2",
    margin: "15px 0",
  },


  habitsDescription: {
    color: "#64748b",
    lineHeight: "1.8",
  },


  habitList: {
    marginTop: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "13px",
  },


  habitItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px",
    borderRadius: "12px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#334155",
  },


  check: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    flexShrink: 0,
  },


  /* ================= VISUAL ================= */

  habitVisual: {
    minHeight: "380px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg,#dbeafe,#fce7f3)",
    overflow: "hidden",
  },


  circleLarge: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "75px",
    boxShadow:
      "0 25px 50px rgba(15,23,42,0.12)",
  },


  visualCardOne: {
    position: "absolute",
    top: "55px",
    left: "30px",
    background: "#ffffff",
    padding: "13px 18px",
    borderRadius: "13px",
    boxShadow:
      "0 10px 25px rgba(15,23,42,0.1)",
    fontWeight: "800",
  },


  visualCardTwo: {
    position: "absolute",
    bottom: "55px",
    right: "30px",
    background: "#ffffff",
    padding: "13px 18px",
    borderRadius: "13px",
    boxShadow:
      "0 10px 25px rgba(15,23,42,0.1)",
    fontWeight: "800",
  },


  /* ================= SUPPORT ================= */

  supportSection: {
    padding: "20px 20px 70px",
  },


  supportCard: {
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


  supportIcon: {
    fontSize: "45px",
  },


  supportTitle: {
    maxWidth: "650px",
    margin: "15px auto",
    fontSize: "clamp(28px,4vw,42px)",
  },


  supportText: {
    maxWidth: "650px",
    margin: "0 auto",
    color: "#cbd5e1",
    lineHeight: "1.7",
  },


  supportButtons: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "28px",
  },


  supportPrimary: {
    padding: "14px 22px",
    border: "none",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "800",
  },


  supportSecondary: {
    padding: "14px 22px",
    border: "1px solid #475569",
    borderRadius: "12px",
    background: "transparent",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },


  /* ================= NOTE ================= */

  noteSection: {
    textAlign: "center",
    padding: "0 20px 25px",
  },


  note: {
    maxWidth: "850px",
    margin: "auto",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.7",
  },


  /* ================= BACK ================= */

  backButton: {
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

export default MentalHealth;