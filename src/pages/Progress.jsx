import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

const Progress = () => {
  const [progress, setProgress] = useState({
    streak: 0,
    goalsCompleted: 0,
    totalGoals: 12,
    moodScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Demo user ID
  // Baad mein Firebase Authentication ke user.uid se replace kar sakte hain.
  const userId = "demo-user";

  const progressRef = doc(db, "progress", userId);

  // =====================================================
  // LOAD DATA FROM FIREBASE
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadProgress = async () => {
      try {
        const snapshot = await getDoc(progressRef);

        if (snapshot.exists() && mounted) {
          const data = snapshot.data();

          setProgress((prev) => ({
            ...prev,
            streak: Number(data.streak ?? prev.streak),
            goalsCompleted: Number(
              data.goalsCompleted ?? prev.goalsCompleted
            ),
            totalGoals: Number(
              data.totalGoals ?? prev.totalGoals
            ),
            moodScore: Number(
              data.moodScore ?? prev.moodScore
            ),
          }));
        }
      } catch (error) {
        console.error("❌ Error loading progress:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // UPDATE VALUE
  // =====================================================

  const updateProgress = (field, value) => {
    const numberValue = Number(value);

    setProgress((prev) => ({
      ...prev,
      [field]: Number.isNaN(numberValue) ? 0 : numberValue,
    }));

    setSaved(false);
  };

  // =====================================================
  // SAVE TO FIREBASE
  // =====================================================

  const saveProgress = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setSaved(false);

      await setDoc(progressRef, {
        streak: Number(progress.streak),
        goalsCompleted: Number(progress.goalsCompleted),
        totalGoals: Number(progress.totalGoals),
        moodScore: Number(progress.moodScore),
        updatedAt: new Date(),
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("❌ Firebase Save Error:", error);
      alert("Progress save nahi ho paya.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PERCENTAGE
  // =====================================================

  const goalPercentage =
    progress.totalGoals > 0
      ? Math.round(
          (progress.goalsCompleted / progress.totalGoals) * 100
        )
      : 0;

  const safeGoalPercentage = Math.min(
    Math.max(goalPercentage, 0),
    100
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>

      {/* ================= HERO ================= */}

      <section style={styles.hero}>

        <div style={styles.badge}>
          📈 PERSONAL WELLNESS
        </div>

        <h1 style={styles.title}>
          My Progress
          <span style={styles.gradientText}>
            {" "}Journey
          </span>
        </h1>

        <p style={styles.subtitle}>
          Track your habits, goals and wellness journey
          in one place.
        </p>

      </section>

      {/* ================= STATS ================= */}

      <section style={styles.statsGrid}>

        {/* STREAK */}

        <div style={styles.card}>

          <div style={styles.cardTop}>

            <div style={styles.iconBlue}>
              🔥
            </div>

            <span style={styles.label}>
              CURRENT STREAK
            </span>

          </div>

          <h2 style={styles.number}>
            {progress.streak}
          </h2>

          <p style={styles.unit}>
            Days
          </p>

          <p style={styles.smallText}>
            Keep building your consistency.
          </p>

        </div>

        {/* GOALS */}

        <div style={styles.card}>

          <div style={styles.cardTop}>

            <div style={styles.iconPurple}>
              🎯
            </div>

            <span style={styles.label}>
              GOALS COMPLETED
            </span>

          </div>

          <h2 style={styles.number}>

            {progress.goalsCompleted}

            <span style={styles.total}>
              {" "}/ {progress.totalGoals}
            </span>

          </h2>

          <div style={styles.progressBackground}>

            <div
              style={{
                ...styles.progressBar,
                width: `${safeGoalPercentage}%`,
              }}
            />

          </div>

          <p style={styles.smallText}>
            {safeGoalPercentage}% completed
          </p>

        </div>

        {/* MOOD */}

        <div style={styles.card}>

          <div style={styles.cardTop}>

            <div style={styles.iconPink}>
              😊
            </div>

            <span style={styles.label}>
              MOOD SCORE
            </span>

          </div>

          <h2 style={styles.number}>

            {progress.moodScore}

            <span style={styles.percent}>
              %
            </span>

          </h2>

          <p style={styles.smallText}>
            Your self-reported wellness score.
          </p>

        </div>

      </section>

      {/* ================= UPDATE ================= */}

      <section style={styles.updateSection}>

        <div style={styles.updateHeader}>

          <div>

            <span style={styles.sectionBadge}>
              UPDATE
            </span>

            <h2 style={styles.updateTitle}>
              Update Your Progress
            </h2>

            <p style={styles.updateDescription}>
              Enter your latest progress and save it
              securely to Firebase.
            </p>

          </div>

          <div style={styles.firebaseBadge}>
            🔥 Firebase Connected
          </div>

        </div>

        {/* ================= FORM ================= */}

        <div style={styles.formGrid}>

          {/* STREAK */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              🔥 Current Streak
            </label>

            <input
              type="number"
              min="0"
              value={progress.streak}
              onChange={(e) =>
                updateProgress(
                  "streak",
                  e.target.value
                )
              }
              style={styles.input}
            />

          </div>

          {/* GOALS */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              🎯 Goals Completed
            </label>

            <input
              type="number"
              min="0"
              max={progress.totalGoals}
              value={progress.goalsCompleted}
              onChange={(e) =>
                updateProgress(
                  "goalsCompleted",
                  e.target.value
                )
              }
              style={styles.input}
            />

          </div>

          {/* TOTAL GOALS */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              📌 Total Goals
            </label>

            <input
              type="number"
              min="1"
              value={progress.totalGoals}
              onChange={(e) =>
                updateProgress(
                  "totalGoals",
                  e.target.value
                )
              }
              style={styles.input}
            />

          </div>

          {/* MOOD */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              😊 Mood Score (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={progress.moodScore}
              onChange={(e) =>
                updateProgress(
                  "moodScore",
                  e.target.value
                )
              }
              style={styles.input}
            />

          </div>

        </div>

        {/* ================= SAVE ================= */}

        <div style={styles.saveArea}>

          <button
            onClick={saveProgress}
            disabled={saving}
            style={{
              ...styles.saveButton,
              opacity: saving ? 0.7 : 1,
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >

            {saving
              ? "⏳ Saving..."
              : "💾 Save My Progress"}

          </button>

          {saved && (
            <div style={styles.success}>
              ✅ Progress saved successfully!
            </div>
          )}

        </div>

        {/* SMALL FIREBASE STATUS */}

        {loading && (
          <p style={styles.loadingStatus}>
            🔄 Loading saved progress...
          </p>
        )}

      </section>

      {/* ================= INFO ================= */}

      <section style={styles.info}>

        <div style={styles.infoIcon}>
          💙
        </div>

        <div>

          <h3 style={styles.infoTitle}>
            Keep going, one step at a time.
          </h3>

          <p style={styles.infoText}>
            Progress doesn't have to be perfect.
            Consistent small steps can help you build
            sustainable habits.
          </p>

        </div>

      </section>

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
    paddingBottom: "70px",
  },

  hero: {
    textAlign: "center",
    padding: "80px 20px 60px",
    background:
      "linear-gradient(135deg,#dbeafe,#ffffff,#fce7f3)",
  },

  badge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "50px",
    background: "#ffffff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1.5px",
    border: "1px solid #dbeafe",
  },

  title: {
    fontSize: "clamp(42px,7vw,70px)",
    margin: "22px 0 15px",
    letterSpacing: "-3px",
    fontWeight: "900",
    color: "#0f172a",
  },

  gradientText: {
    background:
      "linear-gradient(135deg,#2563eb,#9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    maxWidth: "650px",
    margin: "auto",
    color: "#64748b",
    fontSize: "18px",
    lineHeight: "1.7",
  },

  statsGrid: {
    maxWidth: "1100px",
    margin: "-20px auto 0",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "22px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 25px rgba(15,23,42,0.05)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  iconBlue: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  iconPurple: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#f5f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  iconPink: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#fdf2f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  label: {
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1px",
    color: "#64748b",
  },

  number: {
    fontSize: "48px",
    margin: "22px 0 0",
    color: "#0f172a",
  },

  total: {
    fontSize: "22px",
    color: "#94a3b8",
  },

  percent: {
    fontSize: "24px",
    color: "#64748b",
  },

  unit: {
    margin: "-5px 0 10px",
    color: "#64748b",
  },

  smallText: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  progressBackground: {
    height: "9px",
    background: "#e2e8f0",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "18px",
  },

  progressBar: {
    height: "100%",
    background:
      "linear-gradient(90deg,#2563eb,#7c3aed)",
    borderRadius: "20px",
    transition: "width .3s ease",
  },

  updateSection: {
    maxWidth: "1100px",
    margin: "60px auto 0",
    padding: "35px",
    background: "#ffffff",
    borderRadius: "25px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.05)",
  },

  updateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  sectionBadge: {
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  updateTitle: {
    margin: "8px 0",
    fontSize: "30px",
    color: "#0f172a",
  },

  updateDescription: {
    color: "#64748b",
    margin: 0,
  },

  firebaseBadge: {
    padding: "10px 15px",
    borderRadius: "12px",
    background: "#fff7ed",
    color: "#ea580c",
    fontWeight: "800",
    fontSize: "14px",
  },

  formGrid: {
    marginTop: "30px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  fieldLabel: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "16px",
    background: "#f8fafc",
  },

  saveArea: {
    marginTop: "30px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  saveButton: {
    padding: "14px 24px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#ffffff",
    fontWeight: "900",
    fontSize: "15px",
    boxShadow:
      "0 8px 20px rgba(37,99,235,0.18)",
  },

  success: {
    color: "#16a34a",
    fontWeight: "700",
    fontSize: "14px",
  },

  loadingStatus: {
    marginTop: "15px",
    color: "#64748b",
    fontSize: "13px",
  },

  info: {
    maxWidth: "1035px",
    margin: "25px auto 0",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    background: "#eff6ff",
    borderRadius: "20px",
  },

  infoIcon: {
    fontSize: "32px",
  },

  infoTitle: {
    margin: "0 0 5px",
    color: "#0f172a",
  },

  infoText: {
    margin: 0,
    color: "#64748b",
    lineHeight: "1.6",
  },

};

export default Progress;