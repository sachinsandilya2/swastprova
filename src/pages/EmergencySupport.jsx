
import React from "react";
import { Link } from "react-router-dom";

const EmergencySupport = () => {
  const emergencyNumbers = [
    {
      title: "Emergency Services",
      number: "112",
      description:
        "For immediate danger, serious emergency, or urgent assistance.",
      icon: "🚨",
      link: "tel:112",
    },
    {
      title: "Tele-MANAS",
      number: "14416",
      description:
        "Mental health support and professional assistance in India.",
      icon: "🧠",
      link: "tel:14416",
    },
    {
      title: "Ambulance",
      number: "108",
      description:
        "For urgent medical emergencies and ambulance assistance.",
      icon: "🚑",
      link: "tel:108",
    },
  ];

  const calmingSteps = [
    {
      icon: "🌬️",
      title: "Slow breathing",
      text: "Take a slow breath in, hold briefly, and breathe out gently.",
    },
    {
      icon: "💧",
      title: "Move to a safe place",
      text: "If possible, stay somewhere calm and around people you trust.",
    },
    {
      icon: "📞",
      title: "Contact someone",
      text: "Call a trusted friend, family member, mentor, or professional.",
    },
    {
      icon: "🧘",
      title: "Ground yourself",
      text: "Focus on your surroundings and remind yourself that you are not alone.",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <Link to="/" style={styles.backButton}>
            ← Back
          </Link>

          <div style={styles.headerIcon}>🛟</div>

          <h1 style={styles.title}>
            Emergency & Crisis Support
          </h1>

          <p style={styles.subtitle}>
            You don't have to face a difficult moment alone.
            SWASTPROVA can help you reach immediate support.
          </p>
        </div>

        <div style={styles.alertBox}>
          <div style={styles.alertIcon}>🚨</div>

          <div>
            <h2 style={styles.alertTitle}>
              If you are in immediate danger
            </h2>

            <p style={styles.alertText}>
              Please contact emergency services or go to
              the nearest hospital/emergency department.
              Do not rely only on an AI system during an
              emergency.
            </p>

            <a
              href="tel:112"
              style={styles.primaryCall}
            >
              📞 Call Emergency Services — 112
            </a>
          </div>
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>
            Immediate Support
          </h2>

          <p style={styles.sectionSubtitle}>
            Choose the type of support you need right now.
          </p>

          <div style={styles.contactGrid}>
            {emergencyNumbers.map((item, index) => (
              <a
                href={item.link}
                key={index}
                style={styles.contactCard}
              >
                <div style={styles.contactIcon}>
                  {item.icon}
                </div>

                <div style={styles.contactContent}>
                  <h3 style={styles.contactTitle}>
                    {item.title}
                  </h3>

                  <div style={styles.number}>
                    {item.number}
                  </div>

                  <p style={styles.contactDescription}>
                    {item.description}
                  </p>

                  <span style={styles.callButton}>
                    Call Now →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section style={styles.crisisBox}>
          <div style={styles.crisisIcon}>
            ❤️
          </div>

          <div>
            <h2 style={styles.crisisTitle}>
              Having thoughts of giving up?
            </h2>

            <p style={styles.crisisText}>
              Please do not stay alone with these feelings.
              Reach out to someone you trust and seek
              professional help immediately.
            </p>

            <div style={styles.crisisActions}>
              <a
                href="tel:14416"
                style={styles.supportButton}
              >
                🧠 Talk to Mental Health Support
              </a>

              <a
                href="tel:112"
                style={styles.emergencyButton}
              >
                🚨 Emergency Help
              </a>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>
            What You Can Do Right Now
          </h2>

          <p style={styles.sectionSubtitle}>
            If you are overwhelmed but are currently safe,
            try these simple steps while reaching out for
            support.
          </p>

          <div style={styles.stepsGrid}>
            {calmingSteps.map((step, index) => (
              <div
                key={index}
                style={styles.stepCard}
              >
                <div style={styles.stepIcon}>
                  {step.icon}
                </div>

                <h3 style={styles.stepTitle}>
                  {step.title}
                </h3>

                <p style={styles.stepText}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.humanBox}>
          <div style={styles.humanIcon}>
            👨‍⚕️
          </div>

          <div style={styles.humanContent}>
            <h2 style={styles.humanTitle}>
              Connect with a Human Professional
            </h2>

            <p style={styles.humanText}>
              AI can help identify possible distress
              indicators, but a qualified human professional
              should make important health and safety
              decisions.
            </p>

            <div style={styles.humanActions}>
              <Link
                to="/doctor"
                style={styles.doctorButton}
              >
                👨‍⚕️ Find Professional
              </Link>

              <Link
                to="/mentor"
                style={styles.mentorButton}
              >
                🤝 Connect with Mentor
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.assessmentBox}>
          <div>
            <h2 style={styles.assessmentTitle}>
              Want to understand your current situation?
            </h2>

            <p style={styles.assessmentText}>
              You can take the SWASTPROVA AI-assisted
              assessment to identify possible distress
              indicators and receive support recommendations.
            </p>
          </div>

          <Link
            to="/assessment"
            style={styles.assessmentButton}
          >
            Start Assessment →
          </Link>
        </section>

        <div style={styles.disclaimer}>
          <strong>Important:</strong> SWASTPROVA is a
          technology-based support platform. Its AI
          assessment is a screening aid and is not a
          medical diagnosis. In an emergency, contact
          appropriate emergency services or a qualified
          healthcare professional.
        </div>

        <div style={styles.footer}>
          <span>
            SWASTPROVA
          </span>

          <span>
            •
          </span>

          <span>
            Support. Connect. Recover.
          </span>
        </div>

      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px 18px 50px",
    background:
      "linear-gradient(135deg, #eff6ff, #faf5ff, #fdf2f8)",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    textDecoration: "none",
    color: "#334155",
    fontWeight: "700",
    fontSize: "14px",
    padding: "9px 13px",
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 5px 20px rgba(15,23,42,0.08)",
  },

  headerIcon: {
    width: "78px",
    height: "78px",
    margin: "0 auto 16px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg,#fee2e2,#fef3c7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "900",
    color: "#0f172a",
  },

  subtitle: {
    maxWidth: "700px",
    margin: "12px auto 0",
    color: "#64748b",
    lineHeight: "1.7",
    fontSize: "15px",
  },

  alertBox: {
    display: "flex",
    gap: "18px",
    alignItems: "flex-start",
    padding: "24px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "20px",
    marginBottom: "32px",
  },

  alertIcon: {
    fontSize: "35px",
  },

  alertTitle: {
    margin: "0 0 7px",
    color: "#9f1239",
    fontSize: "21px",
  },

  alertText: {
    margin: "0 0 16px",
    color: "#881337",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  primaryCall: {
    display: "inline-block",
    textDecoration: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "12px 17px",
    borderRadius: "11px",
    fontWeight: "800",
    fontSize: "14px",
  },

  section: {
    marginTop: "32px",
  },

  sectionHeading: {
    margin: "0 0 6px",
    fontSize: "25px",
    color: "#0f172a",
  },

  sectionSubtitle: {
    margin: "0 0 18px",
    color: "#64748b",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  contactGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },

  contactCard: {
    display: "flex",
    gap: "15px",
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
  },

  contactIcon: {
    width: "50px",
    height: "50px",
    minWidth: "50px",
    borderRadius: "14px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  contactContent: {
    flex: 1,
  },

  contactTitle: {
    margin: "0 0 5px",
    color: "#0f172a",
    fontSize: "16px",
  },

  number: {
    color: "#2563eb",
    fontSize: "21px",
    fontWeight: "900",
    marginBottom: "6px",
  },

  contactDescription: {
    margin: "0 0 12px",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  callButton: {
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "13px",
  },

  crisisBox: {
    display: "flex",
    gap: "18px",
    alignItems: "flex-start",
    marginTop: "32px",
    padding: "24px",
    background: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "20px",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
  },

  crisisIcon: {
    width: "52px",
    height: "52px",
    minWidth: "52px",
    borderRadius: "15px",
    background: "#fee2e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  crisisTitle: {
    margin: "0 0 7px",
    color: "#991b1b",
    fontSize: "20px",
  },

  crisisText: {
    margin: "0 0 15px",
    color: "#475569",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  crisisActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  supportButton: {
    textDecoration: "none",
    padding: "11px 15px",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "13px",
  },

  emergencyButton: {
    textDecoration: "none",
    padding: "11px 15px",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "13px",
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  stepCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "17px",
    padding: "20px",
  },

  stepIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  stepTitle: {
    margin: "0 0 7px",
    color: "#0f172a",
    fontSize: "16px",
  },

  stepText: {
    margin: 0,
    color: "#64748b",
    lineHeight: "1.6",
    fontSize: "13px",
  },

  humanBox: {
    display: "flex",
    gap: "18px",
    alignItems: "flex-start",
    marginTop: "32px",
    padding: "25px",
    background:
      "linear-gradient(135deg,#eff6ff,#f5f3ff)",
    border: "1px solid #dbeafe",
    borderRadius: "20px",
  },

  humanIcon: {
    width: "55px",
    height: "55px",
    minWidth: "55px",
    borderRadius: "16px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  humanContent: {
    flex: 1,
  },

  humanTitle: {
    margin: "0 0 7px",
    color: "#0f172a",
    fontSize: "20px",
  },

  humanText: {
    margin: "0 0 16px",
    color: "#475569",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  humanActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  doctorButton: {
    textDecoration: "none",
    padding: "11px 15px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "13px",
  },

  mentorButton: {
    textDecoration: "none",
    padding: "11px 15px",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "13px",
  },

  assessmentBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "32px",
    padding: "25px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
  },

  assessmentTitle: {
    margin: "0 0 7px",
    color: "#0f172a",
    fontSize: "19px",
  },

  assessmentText: {
    margin: 0,
    color: "#64748b",
    lineHeight: "1.6",
    fontSize: "13px",
    maxWidth: "650px",
  },

  assessmentButton: {
    textDecoration: "none",
    whiteSpace: "nowrap",
    padding: "13px 18px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "14px",
  },

  disclaimer: {
    marginTop: "30px",
    padding: "15px 17px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "13px",
    color: "#92400e",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    gap: "9px",
    marginTop: "25px",
    color: "#94a3b8",
    fontSize: "12px",
  },
};

export default EmergencySupport;
