import { useState } from "react";

const Assessment = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAssessment = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!text.trim()) {
      setError("Please describe how you are feeling.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://swastprova-2.onrender.com/assessment/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            answers: {},
          }),
        }
      );

      const data = await response.json();

      // Debugging ke liye browser console me complete response dikhega
      console.log("🔥 ASSESSMENT API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Assessment failed."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Assessment could not be completed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Assessment error:", err);

      setError(
        err.message ||
          "Unable to complete assessment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    Backend agar root level par data bheje:
      result.sviScore
      result.riskLevel
      result.indicators

    Ya nested bheje:
      result.svi.sviScore
      result.svi.riskLevel
      result.assessment.indicators

    Dono cases handle honge.
  */

  const sviScore =
    result?.sviScore ??
    result?.svi?.sviScore ??
    null;

  const riskLevel =
    result?.riskLevel ??
    result?.svi?.riskLevel ??
    "UNKNOWN";

  const indicators =
    result?.indicators ??
    result?.assessment?.indicators ??
    [];

  const recommendedSupport =
    result?.recommendedSupport ??
    result?.assessment?.recommendedSupport ??
    [];

  const riskDescription =
    result?.riskDescription ??
    result?.svi?.riskDescription ??
    "";

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* =========================
            HEADER ICON
        ========================= */}

        <div style={styles.icon}>
          🧠
        </div>

        {/* =========================
            TITLE
        ========================= */}

        <h1 style={styles.title}>
          AI Stress & Trauma Assessment
        </h1>

        <p style={styles.subtitle}>
          This AI-assisted assessment identifies
          possible distress indicators from your
          current interaction.
        </p>

        {/* =========================
            DISCLAIMER
        ========================= */}

        <div style={styles.notice}>
          <strong>Important:</strong> This is a
          screening tool, not a medical diagnosis.
          Final decisions should be made by a
          qualified human professional.
        </div>

        {/* =========================
            FORM
        ========================= */}

        <form onSubmit={handleAssessment}>

          <label style={styles.label}>
            How are you feeling right now?
          </label>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            placeholder="Tell us about your current feelings, stress, fear, sleep, anxiety, or anything that is troubling you..."
            style={styles.textarea}
            rows={7}
            disabled={loading}
          />

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          {/* =========================
              SUBMIT BUTTON
          ========================= */}

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
              ? "Analyzing..."
              : "Start AI Assessment →"}
          </button>

        </form>

        {/* =========================
            RESULT
        ========================= */}

        {result && (
          <div style={styles.result}>

            <h2 style={styles.resultTitle}>
              Assessment Result
            </h2>

            {/* =========================
                SVI SCORE
            ========================= */}

            <div style={styles.score}>
              <span>
                SVI Score
              </span>

              <strong style={styles.scoreValue}>
                {sviScore !== null
                  ? `${sviScore}/100`
                  : "--/100"}
              </strong>
            </div>

            {/* =========================
                RISK LEVEL
            ========================= */}

            <div style={styles.risk}>
              <span>
                Risk Level
              </span>

              <strong
                style={{
                  ...styles.riskValue,
                  color: getRiskColor(riskLevel),
                }}
              >
                {riskLevel}
              </strong>
            </div>

            {/* =========================
                RISK DESCRIPTION
            ========================= */}

            {riskDescription && (
              <div style={styles.description}>
                {riskDescription}
              </div>
            )}

            {/* =========================
                POSSIBLE INDICATORS
            ========================= */}

            {Array.isArray(indicators) &&
              indicators.length > 0 && (
                <div style={styles.section}>

                  <h3 style={styles.sectionTitle}>
                    Possible Indicators
                  </h3>

                  <ul style={styles.list}>
                    {indicators.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}

            {/* =========================
                RECOMMENDED SUPPORT
            ========================= */}

            {Array.isArray(
              recommendedSupport
            ) &&
              recommendedSupport.length > 0 && (
                <div style={styles.section}>

                  <h3 style={styles.sectionTitle}>
                    Recommended Support
                  </h3>

                  <ul style={styles.list}>
                    {recommendedSupport.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}

            {/* =========================
                NO INDICATORS
            ========================= */}

            {(!Array.isArray(indicators) ||
              indicators.length === 0) &&
              (!Array.isArray(
                recommendedSupport
              ) ||
                recommendedSupport.length === 0) && (
                <div style={styles.noData}>
                  Assessment completed successfully.
                  Please consider speaking with a
                  qualified professional if you are
                  experiencing ongoing distress.
                </div>
              )}

            {/* =========================
                DISCLAIMER
            ========================= */}

            <div style={styles.resultNotice}>
              <strong>Note:</strong> The SVI score is
              an AI-assisted screening indicator and
              should not be treated as a medical
              diagnosis.
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

/* =========================================
   RISK COLOR
========================================= */

const getRiskColor = (riskLevel) => {
  const level = String(
    riskLevel || ""
  ).toUpperCase();

  if (level === "LOW") {
    return "#15803d";
  }

  if (level === "MODERATE") {
    return "#ca8a04";
  }

  if (level === "HIGH") {
    return "#ea580c";
  }

  if (level === "CRITICAL") {
    return "#dc2626";
  }

  return "#64748b";
};

/* =========================================
   STYLES
========================================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px",
    background:
      "linear-gradient(135deg, #eff6ff, #faf5ff, #fdf2f8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "720px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "40px",
    boxShadow:
      "0 20px 60px rgba(15,23,42,0.12)",
    boxSizing: "border-box",
  },

  icon: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg,#dbeafe,#f3e8ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    marginBottom: "20px",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "32px",
    fontWeight: "900",
    color: "#0f172a",
  },

  subtitle: {
    margin: "0 0 22px",
    color: "#64748b",
    lineHeight: "1.7",
  },

  notice: {
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#334155",
    fontSize: "13px",
    lineHeight: "1.6",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    marginBottom: "9px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    outline: "none",
    resize: "vertical",
    fontSize: "14px",
    lineHeight: "1.6",
    fontFamily: "inherit",
  },

  button: {
    width: "100%",
    marginTop: "18px",
    padding: "15px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
  },

  error: {
    marginTop: "12px",
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
  },

  result: {
    marginTop: "30px",
    padding: "24px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  resultTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#0f172a",
    fontSize: "22px",
  },

  score: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#ffffff",
    borderRadius: "12px",
    marginBottom: "10px",
    color: "#334155",
    border: "1px solid #e2e8f0",
  },

  scoreValue: {
    fontSize: "20px",
    color: "#2563eb",
  },

  risk: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#ffffff",
    borderRadius: "12px",
    marginBottom: "12px",
    color: "#334155",
    border: "1px solid #e2e8f0",
  },

  riskValue: {
    fontSize: "16px",
    fontWeight: "900",
  },

  description: {
    padding: "13px 15px",
    background: "#ffffff",
    borderRadius: "12px",
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
    border: "1px solid #e2e8f0",
  },

  section: {
    marginTop: "20px",
  },

  sectionTitle: {
    color: "#0f172a",
    marginBottom: "10px",
    fontSize: "17px",
  },

  list: {
    paddingLeft: "20px",
    color: "#475569",
    lineHeight: "1.8",
  },

  noData: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "12px",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  resultNotice: {
    marginTop: "22px",
    padding: "13px 15px",
    borderRadius: "12px",
    background: "#fff7ed",
    color: "#9a3412",
    fontSize: "12px",
    lineHeight: "1.6",
  },
};

export default Assessment;