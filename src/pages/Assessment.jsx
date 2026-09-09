import React, { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://swastprova-2.onrender.com";

const initialScstForm = {
  relatedIncident: "",
  incidentType: "",
  facingThreat: "",
  feelsUnsafe: "",
  description: "",
};

const initialPersonalForm = {
  situation: "",
};

const incidentTypes = [
  "Caste-based discrimination",
  "Abuse / Violence",
  "Threat / Intimidation",
  "Social Boycott",
  "Sexual Violence",
  "Murder / Grievous Hurt",
  "Arson / Property Damage",
  "Other",
];

function Assessment() {
  const [activeSection, setActiveSection] = useState(null);

  const [scstForm, setScstForm] = useState(initialScstForm);
  const [personalForm, setPersonalForm] = useState(initialPersonalForm);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [scstSubmitted, setScstSubmitted] = useState(false);

  const handleScstChange = (e) => {
    const { name, value } = e.target;

    setScstForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handlePersonalChange = (e) => {
    setPersonalForm({
      situation: e.target.value,
    });

    setError("");
  };

  const openSection = (section) => {
    setActiveSection(section);
    setResult(null);
    setError("");
    setScstSubmitted(false);
  };

  const closeAssessment = () => {
    setActiveSection(null);
    setResult(null);
    setError("");
  };

  // =========================================================
  // SC/ST ASSESSMENT
  // =========================================================

  const submitScstAssessment = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!scstForm.relatedIncident) {
      setError("Please select whether this assessment is related to an incident.");
      return;
    }

    if (
      scstForm.relatedIncident === "yes" &&
      !scstForm.incidentType
    ) {
      setError("Please select the type of incident.");
      return;
    }

    if (!scstForm.facingThreat) {
      setError("Please answer whether you are currently facing threats.");
      return;
    }

    if (!scstForm.feelsUnsafe) {
      setError("Please answer whether you currently feel unsafe.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/assessment/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentType: "scst",
          relatedIncident: scstForm.relatedIncident,
          incidentType:
            scstForm.relatedIncident === "yes"
              ? scstForm.incidentType
              : "",
          facingThreat: scstForm.facingThreat,
          feelsUnsafe: scstForm.feelsUnsafe,
          description: scstForm.description,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to process the assessment."
        );
      }

      setResult(data);
      setScstSubmitted(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect with the assessment service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PERSONAL AI ASSESSMENT
  // =========================================================

  const submitPersonalAssessment = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const text = personalForm.situation.trim();

    if (!text) {
      setError("Please write about what you are currently going through.");
      return;
    }

    if (text.length < 30) {
      setError(
        "Please write a little more about your situation so the assessment can understand it better."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/assessment/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentType: "personal",
          text,
          situation: text,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to analyze your assessment."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect with the assessment service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getRiskClass = (level) => {
    const value = String(level || "").toLowerCase();

    if (
      value.includes("critical") ||
      value.includes("severe") ||
      value.includes("high")
    ) {
      return "risk-high";
    }

    if (value.includes("moderate") || value.includes("medium")) {
      return "risk-medium";
    }

    return "risk-low";
  };

  const getValue = (obj, keys, fallback = null) => {
    if (!obj || typeof obj !== "object") return fallback;

    for (const key of keys) {
      if (
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {
        return obj[key];
      }
    }

    return fallback;
  };

  const getArray = (obj, keys) => {
    const value = getValue(obj, keys, []);

    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      return value
        .split("\n")
        .map((item) => item.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean);
    }

    return [];
  };

  const normalizeResult = (apiResult) => {
    const source =
      apiResult?.result ||
      apiResult?.analysis ||
      apiResult?.data ||
      apiResult ||
      {};

    return {
      score: getValue(
        source,
        [
          "distressScore",
          "distress_score",
          "score",
          "mentalHealthScore",
        ],
        null
      ),

      stage: getValue(
        source,
        [
          "stage",
          "riskLevel",
          "risk_level",
          "severity",
          "distressLevel",
        ],
        "Assessment completed"
      ),

      summary: getValue(
        source,
        [
          "summary",
          "assessmentSummary",
          "interpretation",
          "message",
        ],
        ""
      ),

      indicators: getArray(source, [
        "indicators",
        "possibleIndicators",
        "symptoms",
        "concerns",
      ]),

      professional: getArray(source, [
        "recommendedProfessional",
        "recommendedProfessionals",
        "professionals",
        "whoToMeet",
        "who_should_you_meet",
        "recommendations",
      ]),

      doNow: getArray(source, [
        "whatToDo",
        "do",
        "actions",
        "recommendedActions",
        "nextSteps",
      ]),

      avoid: getArray(source, [
        "whatToAvoid",
        "avoid",
        "thingsToAvoid",
        "dont",
      ]),

      support: getArray(source, [
        "support",
        "supportOptions",
        "suggestedSupport",
      ]),

      emergency: getValue(
        source,
        [
          "emergency",
          "urgent",
          "urgentSupport",
          "immediateSupport",
          "isEmergency",
        ],
        false
      ),
    };
  };

  const renderResult = () => {
    if (!result) return null;

    const normalized = normalizeResult(result);

    const isEmergency =
      normalized.emergency === true ||
      String(normalized.stage || "")
        .toLowerCase()
        .includes("critical");

    return (
      <div className="assessment-result">
        <div className="result-header">
          <div>
            <span className="result-label">Assessment Result</span>
            <h2>Your Current Assessment</h2>
          </div>

          <div
            className={`stage-badge ${getRiskClass(
              normalized.stage
            )}`}
          >
            {normalized.stage}
          </div>
        </div>

        {isEmergency && (
          <div className="urgent-box">
            <div className="urgent-icon">🚨</div>

            <div>
              <h3>Immediate Support May Be Needed</h3>
              <p>
                Your responses may indicate a situation that needs
                urgent professional attention. If you feel you are in
                immediate danger, contact local emergency services or
                a trusted person near you now.
              </p>

              <button
                type="button"
                className="urgent-button"
                onClick={() =>
                  (window.location.href = "/emergency-support")
                }
              >
                Get Emergency Support
              </button>
            </div>
          </div>
        )}

        {normalized.score !== null && (
          <div className="score-card">
            <div className="score-number">
              {normalized.score}
              <span>/100</span>
            </div>

            <div>
              <h3>Distress Score</h3>
              <p>
                This is a screening indicator based on the information
                you provided.
              </p>
            </div>
          </div>
        )}

        {normalized.summary && (
          <div className="result-section">
            <h3>🧠 What this may indicate</h3>
            <p>{normalized.summary}</p>
          </div>
        )}

        {normalized.indicators.length > 0 && (
          <div className="result-section">
            <h3>🔎 Possible Indicators</h3>

            <div className="result-list">
              {normalized.indicators.map((item, index) => (
                <div className="result-item" key={index}>
                  <span>•</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {normalized.professional.length > 0 && (
          <div className="result-section">
            <h3>👨‍⚕️ Who May Help</h3>

            <div className="result-list">
              {normalized.professional.map((item, index) => (
                <div className="result-item" key={index}>
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {normalized.doNow.length > 0 && (
          <div className="result-section">
            <h3>✅ What You Can Do</h3>

            <div className="result-list">
              {normalized.doNow.map((item, index) => (
                <div className="result-item success" key={index}>
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {normalized.avoid.length > 0 && (
          <div className="result-section">
            <h3>⚠️ What You Should Avoid</h3>

            <div className="result-list">
              {normalized.avoid.map((item, index) => (
                <div className="result-item warning" key={index}>
                  <span>!</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {normalized.support.length > 0 && (
          <div className="result-section">
            <h3>🤝 Suggested Support</h3>

            <div className="result-list">
              {normalized.support.map((item, index) => (
                <div className="result-item" key={index}>
                  <span>→</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="disclaimer">
          <strong>Important:</strong> This assessment is a screening
          and support tool, not a medical diagnosis. Please consult a
          qualified mental-health professional for clinical evaluation
          or treatment decisions.
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setResult(null);

            if (activeSection === "personal") {
              setPersonalForm(initialPersonalForm);
            }
          }}
        >
          Take Assessment Again
        </button>
      </div>
    );
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="assessment-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .assessment-page {
          min-height: 100vh;
          background: #f7f9fc;
          padding: 40px 20px 70px;
          color: #172033;
        }

        .assessment-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .assessment-hero {
          text-align: center;
          margin-bottom: 35px;
        }

        .assessment-hero .eyebrow {
          display: inline-block;
          background: #eaf2ff;
          color: #2563eb;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .assessment-hero h1 {
          margin: 0 0 12px;
          font-size: clamp(30px, 5vw, 46px);
          line-height: 1.15;
        }

        .assessment-hero p {
          max-width: 720px;
          margin: 0 auto;
          color: #667085;
          line-height: 1.7;
          font-size: 16px;
        }

        .section-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 22px;
          margin-bottom: 30px;
        }

        .section-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          transition: 0.2s ease;
        }

        .section-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(15, 23, 42, 0.09);
        }

        .section-card-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
          background: #eef4ff;
          margin-bottom: 18px;
        }

        .section-card h2 {
          margin: 0 0 9px;
          font-size: 22px;
        }

        .section-card p {
          margin: 0 0 22px;
          color: #667085;
          line-height: 1.6;
        }

        .primary-button,
        .secondary-button,
        .urgent-button {
          border: none;
          cursor: pointer;
          border-radius: 12px;
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .primary-button {
          background: #2563eb;
          color: white;
        }

        .primary-button:hover {
          background: #1d4ed8;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-button {
          background: #eef2f7;
          color: #344054;
          margin-top: 20px;
        }

        .secondary-button:hover {
          background: #e4e7ec;
        }

        .assessment-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: clamp(22px, 4vw, 36px);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.07);
        }

        .panel-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
        }

        .panel-top h2 {
          margin: 0 0 7px;
          font-size: 28px;
        }

        .panel-top p {
          margin: 0;
          color: #667085;
          line-height: 1.6;
        }

        .close-button {
          border: 1px solid #e5e7eb;
          background: #fff;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          flex-shrink: 0;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-weight: 700;
          margin-bottom: 9px;
          line-height: 1.5;
        }

        .required {
          color: #dc2626;
        }

        .help-text {
          color: #667085;
          font-size: 13px;
          margin-top: 6px;
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          border: 1px solid #d0d5dd;
          border-radius: 12px;
          padding: 13px 14px;
          font-size: 15px;
          outline: none;
          background: white;
          transition: 0.2s ease;
          font-family: inherit;
        }

        .textarea {
          min-height: 190px;
          resize: vertical;
          line-height: 1.6;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .radio-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .radio-option {
          position: relative;
        }

        .radio-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .radio-option label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
          padding: 11px 16px;
          border: 1px solid #d0d5dd;
          border-radius: 11px;
          cursor: pointer;
          color: #344054;
          background: white;
          margin: 0;
          font-weight: 600;
        }

        .radio-option input:checked + label {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .notice {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 14px 16px;
          border-radius: 12px;
          color: #475467;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 25px;
        }

        .personal-writing-box {
          border: 1px solid #dbe4f0;
          background: #f8fbff;
          border-radius: 18px;
          padding: 20px;
        }

        .personal-writing-box .textarea {
          background: white;
          min-height: 260px;
        }

        .character-count {
          text-align: right;
          margin-top: 7px;
          color: #98a2b3;
          font-size: 12px;
        }

        .error-box {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          padding: 13px 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .loading-box {
          margin-top: 20px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          padding: 13px 15px;
          border-radius: 12px;
          text-align: center;
          font-weight: 600;
        }

        .assessment-result {
          margin-top: 30px;
          border-top: 1px solid #eaecf0;
          padding-top: 30px;
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .result-label {
          color: #667085;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .result-header h2 {
          margin: 4px 0 0;
          font-size: 25px;
        }

        .stage-badge {
          padding: 9px 15px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 14px;
          white-space: nowrap;
          background: #ecfdf3;
          color: #027a48;
        }

        .stage-badge.risk-medium {
          background: #fffaeb;
          color: #b54708;
        }

        .stage-badge.risk-high {
          background: #fef3f2;
          color: #b42318;
        }

        .score-card {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #f8fafc;
          border: 1px solid #e4e7ec;
          padding: 20px;
          border-radius: 17px;
          margin-bottom: 22px;
        }

        .score-number {
          font-size: 35px;
          font-weight: 800;
          color: #2563eb;
        }

        .score-number span {
          font-size: 15px;
          color: #667085;
          font-weight: 600;
        }

        .score-card h3 {
          margin: 0 0 4px;
        }

        .score-card p {
          margin: 0;
          color: #667085;
          font-size: 14px;
          line-height: 1.5;
        }

        .result-section {
          border: 1px solid #eaecf0;
          border-radius: 17px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .result-section h3 {
          margin: 0 0 13px;
          font-size: 18px;
        }

        .result-section > p {
          color: #475467;
          line-height: 1.7;
          margin: 0;
        }

        .result-list {
          display: grid;
          gap: 10px;
        }

        .result-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #475467;
        }

        .result-item span {
          color: #2563eb;
          font-weight: 800;
          margin-top: 1px;
        }

        .result-item p {
          margin: 0;
          line-height: 1.55;
        }

        .result-item.success span {
          color: #039855;
        }

        .result-item.warning span {
          color: #d92d20;
        }

        .urgent-box {
          display: flex;
          gap: 15px;
          background: #fff4f4;
          border: 1px solid #fecdca;
          border-radius: 17px;
          padding: 18px;
          margin-bottom: 22px;
        }

        .urgent-icon {
          font-size: 27px;
        }

        .urgent-box h3 {
          margin: 0 0 7px;
          color: #b42318;
        }

        .urgent-box p {
          margin: 0 0 13px;
          color: #7a271a;
          line-height: 1.6;
        }

        .urgent-button {
          background: #d92d20;
          color: white;
        }

        .disclaimer {
          background: #fffaeb;
          border: 1px solid #fedf89;
          color: #7a5d00;
          padding: 15px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.6;
          margin-top: 20px;
        }

        @media (max-width: 760px) {
          .section-selector {
            grid-template-columns: 1fr;
          }

          .panel-top,
          .result-header {
            flex-direction: column;
          }

          .score-card {
            align-items: flex-start;
          }

          .stage-badge {
            align-self: flex-start;
          }
        }
      `}</style>

      <div className="assessment-container">
        {/* =====================================================
            HERO
        ====================================================== */}

        <div className="assessment-hero">
          <span className="eyebrow">Mental Health Support</span>

          <h1>Mental Health Assessment</h1>

          <p>
            Choose the type of assessment that best matches your
            situation. Your responses can help identify the type of
            support that may be appropriate.
          </p>
        </div>

        {/* =====================================================
            SECTION SELECTOR
        ====================================================== */}

        {!activeSection && (
          <div className="section-selector">
            <div className="section-card">
              <div className="section-card-icon">⚖️</div>

              <h2>SC/ST Related Incident</h2>

              <p>
                Share information about an SC/ST-related complaint,
                incident, safety concern or threat so that appropriate
                support pathways can be identified.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => openSection("scst")}
              >
                Open Assessment
              </button>
            </div>

            <div className="section-card">
              <div className="section-card-icon">💙</div>

              <h2>Personal Stress & Trauma</h2>

              <p>
                Describe in your own words what you are currently
                experiencing. The assessment system will analyze your
                response and provide personalized support guidance.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => openSection("personal")}
              >
                Open Assessment
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            SC/ST FORM
        ====================================================== */}

        {activeSection === "scst" && !scstSubmitted && (
          <div className="assessment-panel">
            <div className="panel-top">
              <div>
                <h2>SC/ST Related Assessment</h2>

                <p>
                  Please answer the questions based on your current
                  situation.
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeAssessment}
                aria-label="Close assessment"
              >
                ✕
              </button>
            </div>

            <div className="notice">
              This section is intended to understand your situation
              and identify possible support needs. It does not itself
              determine the legal status of a complaint.
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={submitScstAssessment}>
              <div className="form-group">
                <label>
                  Is this assessment related to an SC/ST-related
                  complaint or incident?{" "}
                  <span className="required">*</span>
                </label>

                <div className="radio-grid">
                  <div className="radio-option">
                    <input
                      id="scst-yes"
                      type="radio"
                      name="relatedIncident"
                      value="yes"
                      checked={
                        scstForm.relatedIncident === "yes"
                      }
                      onChange={handleScstChange}
                    />

                    <label htmlFor="scst-yes">Yes</label>
                  </div>

                  <div className="radio-option">
                    <input
                      id="scst-no"
                      type="radio"
                      name="relatedIncident"
                      value="no"
                      checked={
                        scstForm.relatedIncident === "no"
                      }
                      onChange={handleScstChange}
                    />

                    <label htmlFor="scst-no">No</label>
                  </div>
                </div>
              </div>

              {scstForm.relatedIncident === "yes" && (
                <div className="form-group">
                  <label htmlFor="incidentType">
                    Type of incident{" "}
                    <span className="required">*</span>
                  </label>

                  <select
                    id="incidentType"
                    name="incidentType"
                    className="select"
                    value={scstForm.incidentType}
                    onChange={handleScstChange}
                  >
                    <option value="">
                      Select incident type
                    </option>

                    {incidentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>
                  Are you currently facing threats or intimidation?{" "}
                  <span className="required">*</span>
                </label>

                <div className="radio-grid">
                  <div className="radio-option">
                    <input
                      id="threat-yes"
                      type="radio"
                      name="facingThreat"
                      value="yes"
                      checked={scstForm.facingThreat === "yes"}
                      onChange={handleScstChange}
                    />

                    <label htmlFor="threat-yes">Yes</label>
                  </div>

                  <div className="radio-option">
                    <input
                      id="threat-no"
                      type="radio"
                      name="facingThreat"
                      value="no"
                      checked={scstForm.facingThreat === "no"}
                      onChange={handleScstChange}
                    />

                    <label htmlFor="threat-no">No</label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Do you currently feel unsafe?{" "}
                  <span className="required">*</span>
                </label>

                <div className="radio-grid">
                  <div className="radio-option">
                    <input
                      id="unsafe-yes"
                      type="radio"
                      name="feelsUnsafe"
                      value="yes"
                      checked={scstForm.feelsUnsafe === "yes"}
                      onChange={handleScstChange}
                    />

                    <label htmlFor="unsafe-yes">Yes</label>
                  </div>

                  <div className="radio-option">
                    <input
                      id="unsafe-no"
                      type="radio"
                      name="feelsUnsafe"
                      value="no"
                      checked={scstForm.feelsUnsafe === "no"}
                      onChange={handleScstChange}
                    />

                    <label htmlFor="unsafe-no">No</label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="scst-description">
                  Tell us briefly about your situation
                </label>

                <textarea
                  id="scst-description"
                  name="description"
                  className="textarea"
                  value={scstForm.description}
                  onChange={handleScstChange}
                  placeholder="You can describe what happened, what you are currently facing, or what kind of help you need..."
                />
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : "Submit Assessment"}
              </button>

              {loading && (
                <div className="loading-box">
                  Processing your assessment...
                </div>
              )}
            </form>
          </div>
        )}

        {/* =====================================================
            PERSONAL AI TEXT ASSESSMENT
        ====================================================== */}

        {activeSection === "personal" && !result && (
          <div className="assessment-panel">
            <div className="panel-top">
              <div>
                <h2>Personal Stress & Trauma</h2>

                <p>
                  Tell us in your own words what you are going
                  through.
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeAssessment}
                aria-label="Close assessment"
              >
                ✕
              </button>
            </div>

            <div className="notice">
              There are no right or wrong answers. Write honestly
              about your current feelings, thoughts, sleep, fear,
              stress, relationships, work/study difficulties, or any
              difficult experience you are dealing with.
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={submitPersonalAssessment}>
              <div className="personal-writing-box">
                <div className="form-group">
                  <label htmlFor="personal-situation">
                    What are you currently going through?{" "}
                    <span className="required">*</span>
                  </label>

                  <textarea
                    id="personal-situation"
                    className="textarea"
                    value={personalForm.situation}
                    onChange={handlePersonalChange}
                    placeholder={
                      "Example:\n\nI have been feeling very stressed for the last few weeks. I am not sleeping properly and keep thinking about the situation. I feel anxious when I have to go outside and I don't feel like talking to people..."
                    }
                  />

                  <div className="character-count">
                    {personalForm.situation.length} characters
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze My Situation"}
              </button>

              {loading && (
                <div className="loading-box">
                  Analyzing your response and preparing support
                  guidance...
                </div>
              )}
            </form>
          </div>
        )}

        {/* =====================================================
            PERSONAL RESULT
        ====================================================== */}

        {activeSection === "personal" && result && (
          <div className="assessment-panel">
            <div className="panel-top">
              <div>
                <h2>Personal Assessment Result</h2>

                <p>
                  Based on the information you provided.
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeAssessment}
                aria-label="Close assessment"
              >
                ✕
              </button>
            </div>

            {renderResult()}
          </div>
        )}

        {/* =====================================================
            SC/ST RESULT
        ====================================================== */}

        {activeSection === "scst" && scstSubmitted && result && (
          <div className="assessment-panel">
            <div className="panel-top">
              <div>
                <h2>Assessment Result</h2>

                <p>
                  Your submitted information has been processed.
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeAssessment}
                aria-label="Close assessment"
              >
                ✕
              </button>
            </div>

            {renderResult()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Assessment;