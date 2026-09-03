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
        "http://localhost:5000/assessment/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            answers: {},
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Assessment failed."
        );
      }

      setResult(data);

    } catch (err) {
      console.error("Assessment error:", err);
      setError(
        err.message ||
          "Unable to complete assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.icon}>🧠</div>

        <h1 style={styles.title}>
          AI Stress & Trauma Assessment
        </h1>

        <p style={styles.subtitle}>
          This AI-assisted assessment identifies
          possible distress indicators from your
          current interaction.
        </p>

        <div style={styles.notice}>
          <strong>Important:</strong> This is a
          screening tool, not a medical diagnosis.
          Final decisions should be made by a
          qualified human professional.
        </div>

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
          />

          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Analyzing..."
              : "Start AI Assessment →"}
          </button>

        </form>

        {result && (
          <div style={styles.result}>

            <h2>Assessment Result</h2>

            <div style={styles.score}>
              <span>SVI Score</span>
              <strong>
                {result.sviScore ?? "--"}/100
              </strong>
            </div>

            <div style={styles.risk}>
              <span>Risk Level</span>
              <strong>
                {result.riskLevel ?? "UNKNOWN"}
              </strong>
            </div>

            {result.indicators?.length > 0 && (
              <div style={styles.section}>
                <h3>Possible Indicators</h3>

                <ul>
                  {result.indicators.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {result.recommendedSupport
              ?.length > 0 && (
              <div style={styles.section}>
                <h3>Recommended Support</h3>

                <ul>
                  {result.recommendedSupport.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

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
    cursor: "pointer",
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

  score: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px",
    background: "#ffffff",
    borderRadius: "12px",
    marginBottom: "10px",
  },

  risk: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px",
    background: "#ffffff",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  section: {
    marginTop: "20px",
  },
};

export default Assessment;