import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../firebase";

const Progress = () => {
  const [user, setUser] = useState(null);

  const [progress, setProgress] = useState({
    streak: 0,
    goalsCompleted: 0,
    totalGoals: 12,
    moodScore: 0,
    sleepHours: 0,
    activityMinutes: 0,
    meditationMinutes: 0,
    waterGlasses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // =====================================================
  // FIREBASE DOCUMENT
  // =====================================================

  const progressRef = useMemo(() => {
    if (!user?.uid) return null;

    return doc(db, "progress", user.uid);
  }, [user]);

  // =====================================================
  // LOAD USER PROGRESS
  // =====================================================

  useEffect(() => {
    if (!progressRef) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadProgress = async () => {
      try {
        setLoading(true);

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

            sleepHours: Number(
              data.sleepHours ?? prev.sleepHours
            ),

            activityMinutes: Number(
              data.activityMinutes ?? prev.activityMinutes
            ),

            meditationMinutes: Number(
              data.meditationMinutes ?? prev.meditationMinutes
            ),

            waterGlasses: Number(
              data.waterGlasses ?? prev.waterGlasses
            ),
          }));
        }
      } catch (error) {
        console.error(
          "❌ Error loading progress:",
          error
        );
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
  }, [progressRef]);

  // =====================================================
  // UPDATE VALUE
  // =====================================================

  const updateProgress = (field, value) => {
    let numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      numberValue = 0;
    }

    // Prevent negative values
    numberValue = Math.max(numberValue, 0);

    // Mood maximum 100
    if (field === "moodScore") {
      numberValue = Math.min(numberValue, 100);
    }

    // Goals completed cannot exceed total goals
    if (field === "goalsCompleted") {
      numberValue = Math.min(
        numberValue,
        Number(progress.totalGoals) || 0
      );
    }

    // Mood / wellness values
    setProgress((prev) => ({
      ...prev,
      [field]: numberValue,
    }));

    setSaved(false);
  };

  // =====================================================
  // SAVE TO FIREBASE
  // =====================================================

  const saveProgress = async () => {
    if (!user?.uid) {
      alert("Please login first to save your progress.");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);
      setSaved(false);

      const dataToSave = {
        userId: user.uid,

        streak: Number(progress.streak),

        goalsCompleted: Number(
          progress.goalsCompleted
        ),

        totalGoals: Number(
          progress.totalGoals
        ),

        moodScore: Number(
          progress.moodScore
        ),

        sleepHours: Number(
          progress.sleepHours
        ),

        activityMinutes: Number(
          progress.activityMinutes
        ),

        meditationMinutes: Number(
          progress.meditationMinutes
        ),

        waterGlasses: Number(
          progress.waterGlasses
        ),

        updatedAt: serverTimestamp(),
      };

      await setDoc(
        progressRef,
        dataToSave,
        {
          merge: true,
        }
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);

    } catch (error) {
      console.error(
        "❌ Firebase Save Error:",
        error
      );

      alert(
        "Progress save nahi ho paya. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // AUTO SAVE
  // =====================================================

  useEffect(() => {
    if (!user?.uid || loading) return;

    const timer = setTimeout(async () => {
      try {
        await setDoc(
          progressRef,
          {
            userId: user.uid,

            streak: Number(progress.streak),

            goalsCompleted: Number(
              progress.goalsCompleted
            ),

            totalGoals: Number(
              progress.totalGoals
            ),

            moodScore: Number(
              progress.moodScore
            ),

            sleepHours: Number(
              progress.sleepHours
            ),

            activityMinutes: Number(
              progress.activityMinutes
            ),

            meditationMinutes: Number(
              progress.meditationMinutes
            ),

            waterGlasses: Number(
              progress.waterGlasses
            ),

            updatedAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        console.log(
          "🔥 Progress auto-saved"
        );
      } catch (error) {
        console.error(
          "❌ Auto-save error:",
          error
        );
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    progress,
    user,
    loading,
    progressRef,
  ]);

  // =====================================================
  // GOAL PERCENTAGE
  // =====================================================

  const goalPercentage =
    progress.totalGoals > 0
      ? Math.round(
          (progress.goalsCompleted /
            progress.totalGoals) *
            100
        )
      : 0;

  const safeGoalPercentage = Math.min(
    Math.max(goalPercentage, 0),
    100
  );

  // =====================================================
  // OVERALL WELLNESS SCORE
  // =====================================================

  const wellnessScore = Math.round(
    (
      Number(progress.moodScore) * 0.4 +
      Math.min(
        Number(progress.sleepHours) / 8 * 100,
        100
      ) * 0.2 +
      Math.min(
        Number(progress.activityMinutes) / 30 * 100,
        100
      ) * 0.15 +
      Math.min(
        Number(progress.meditationMinutes) / 10 * 100,
        100
      ) * 0.1 +
      Math.min(
        Number(progress.waterGlasses) / 8 * 100,
        100
      ) * 0.15
    )
  );

  const safeWellnessScore = Math.min(
    Math.max(wellnessScore, 0),
    100
  );

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  if (!loading && !user) {
    return (
      <div style={styles.loginPage}>

        <div style={styles.loginCard}>

          <div style={styles.loginIcon}>
            🔐
          </div>

          <h1 style={styles.loginTitle}>
            Login Required
          </h1>

          <p style={styles.loginText}>
            Please login to SWASTPROVA to save and
            track your personal wellness progress.
          </p>

          <a
            href="/login"
            style={styles.loginButton}
          >
            Login to Continue →
          </a>

        </div>

      </div>
    );
  }

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
          Track your habits, goals, mood and wellness
          journey in one professional dashboard.
        </p>

        {user && (
          <div style={styles.userBadge}>
            👤 Progress for your account
          </div>
        )}

      </section>


      {/* ================= MAIN STATS ================= */}

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


        {/* WELLNESS */}

        <div style={styles.card}>

          <div style={styles.cardTop}>

            <div style={styles.iconGreen}>
              💚
            </div>

            <span style={styles.label}>
              WELLNESS SCORE
            </span>

          </div>

          <h2 style={styles.number}>

            {safeWellnessScore}

            <span style={styles.percent}>
              %
            </span>

          </h2>

          <p style={styles.smallText}>
            Based on your daily wellness inputs.
          </p>

        </div>

      </section>


      {/* ================= DAILY WELLNESS ================= */}

      <section style={styles.updateSection}>

        <div style={styles.updateHeader}>

          <div>

            <span style={styles.sectionBadge}>
              DAILY WELLNESS
            </span>

            <h2 style={styles.updateTitle}>
              Update Your Progress
            </h2>

            <p style={styles.updateDescription}>
              Your progress is securely linked to your
              Firebase account and automatically saved.
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

            <small style={styles.hint}>
              Number of consecutive days
            </small>

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

            <small style={styles.hint}>
              Completed goals
            </small>

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

            <small style={styles.hint}>
              Your current target
            </small>

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

            <small style={styles.hint}>
              0 = very low · 100 = excellent
            </small>

          </div>


          {/* SLEEP */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              💤 Sleep Hours
            </label>

            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={progress.sleepHours}
              onChange={(e) =>
                updateProgress(
                  "sleepHours",
                  e.target.value
                )
              }
              style={styles.input}
            />

            <small style={styles.hint}>
              Hours slept last night
            </small>

          </div>


          {/* ACTIVITY */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              🏃 Activity Minutes
            </label>

            <input
              type="number"
              min="0"
              value={progress.activityMinutes}
              onChange={(e) =>
                updateProgress(
                  "activityMinutes",
                  e.target.value
                )
              }
              style={styles.input}
            />

            <small style={styles.hint}>
              Exercise or active movement
            </small>

          </div>


          {/* MEDITATION */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              🧘 Meditation Minutes
            </label>

            <input
              type="number"
              min="0"
              value={progress.meditationMinutes}
              onChange={(e) =>
                updateProgress(
                  "meditationMinutes",
                  e.target.value
                )
              }
              style={styles.input}
            />

            <small style={styles.hint}>
              Mindfulness or breathing
            </small>

          </div>


          {/* WATER */}

          <div style={styles.field}>

            <label style={styles.fieldLabel}>
              💧 Water Glasses
            </label>

            <input
              type="number"
              min="0"
              value={progress.waterGlasses}
              onChange={(e) =>
                updateProgress(
                  "waterGlasses",
                  e.target.value
                )
              }
              style={styles.input}
            />

            <small style={styles.hint}>
              Glasses of water today
            </small>

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


        {/* AUTO SAVE */}

        <div style={styles.autoSave}>
          🔄 Changes are automatically saved to your
          Firebase account.
        </div>


        {loading && (
          <p style={styles.loadingStatus}>
            🔄 Loading your saved progress...
          </p>
        )}

      </section>


      {/* ================= WELLNESS INSIGHTS ================= */}

      <section style={styles.insightSection}>

        <div style={styles.sectionHeader}>

          <span style={styles.sectionBadge}>
            WELLNESS INSIGHTS
          </span>

          <h2 style={styles.insightTitle}>
            Your Daily Wellness Snapshot
          </h2>

        </div>


        <div style={styles.insightGrid}>

          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>
              💤
            </div>

            <h3 style={styles.insightCardTitle}>
              Sleep
            </h3>

            <strong style={styles.insightNumber}>
              {progress.sleepHours} hrs
            </strong>

            <p style={styles.insightText}>
              Aim for a consistent and healthy sleep routine.
            </p>
          </div>


          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>
              🏃
            </div>

            <h3 style={styles.insightCardTitle}>
              Activity
            </h3>

            <strong style={styles.insightNumber}>
              {progress.activityMinutes} min
            </strong>

            <p style={styles.insightText}>
              Regular movement can support overall well-being.
            </p>
          </div>


          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>
              🧘
            </div>

            <h3 style={styles.insightCardTitle}>
              Mindfulness
            </h3>

            <strong style={styles.insightNumber}>
              {progress.meditationMinutes} min
            </strong>

            <p style={styles.insightText}>
              Small mindfulness practices can help create a
              calmer routine.
            </p>
          </div>


          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>
              💧
            </div>

            <h3 style={styles.insightCardTitle}>
              Hydration
            </h3>

            <strong style={styles.insightNumber}>
              {progress.waterGlasses} glasses
            </strong>

            <p style={styles.insightText}>
              Keep track of your daily hydration habits.
            </p>
          </div>

        </div>

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
    maxWidth: "700px",
    margin: "auto",
    color: "#64748b",
    fontSize: "18px",
    lineHeight: "1.7",
  },

  userBadge: {
    display: "inline-block",
    marginTop: "18px",
    padding: "8px 14px",
    borderRadius: "50px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "800",
  },

  statsGrid: {
    maxWidth: "1100px",
    margin: "-20px auto 0",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
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

  iconGreen: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#f0fdf4",
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
    fontSize: "43px",
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
    lineHeight: "1.6",
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

  hint: {
    color: "#94a3b8",
    fontSize: "11px",
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

  autoSave: {
    marginTop: "15px",
    color: "#64748b",
    fontSize: "12px",
  },

  loadingStatus: {
    marginTop: "15px",
    color: "#64748b",
    fontSize: "13px",
  },

  /* ================= INSIGHTS ================= */

  insightSection: {
    maxWidth: "1100px",
    margin: "55px auto 0",
    padding: "0 20px",
  },

  sectionHeader: {
    textAlign: "center",
    marginBottom: "25px",
  },

  insightTitle: {
    margin: "10px 0 0",
    fontSize: "30px",
    color: "#0f172a",
  },

  insightGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
  },

  insightCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "22px",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.04)",
  },

  insightIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  insightCardTitle: {
    margin: "0 0 6px",
    color: "#0f172a",
  },

  insightNumber: {
    display: "block",
    fontSize: "25px",
    color: "#2563eb",
    marginBottom: "8px",
  },

  insightText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  /* ================= INFO ================= */

  info: {
    maxWidth: "1050px",
    margin: "35px auto 0",
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

  /* ================= LOGIN ================= */

  loginPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
    background:
      "linear-gradient(135deg,#eff6ff,#faf5ff,#fdf2f8)",
  },

  loginCard: {
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
    background: "#ffffff",
    padding: "45px 30px",
    borderRadius: "25px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.08)",
  },

  loginIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },

  loginTitle: {
    margin: "0 0 10px",
    color: "#0f172a",
    fontSize: "30px",
  },

  loginText: {
    color: "#64748b",
    lineHeight: "1.7",
    marginBottom: "25px",
  },

  loginButton: {
    display: "inline-block",
    textDecoration: "none",
    padding: "13px 22px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#ffffff",
    fontWeight: "800",
  },
};

export default Progress;