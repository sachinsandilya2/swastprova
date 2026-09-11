
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const RISK_BANDS = {
  LOW: {
    min: 0,
    max: 30,
    label: "Low",
    description:
      "Current distress indicators are relatively low. Continue regular follow-up and self-care.",
  },
  MODERATE: {
    min: 31,
    max: 60,
    label: "Moderate",
    description:
      "Some meaningful distress indicators are present. Continued monitoring and support may be helpful.",
  },
  HIGH: {
    min: 61,
    max: 85,
    label: "High",
    description:
      "Elevated distress indicators detected. Timely human support and follow-up are recommended.",
  },
  CRITICAL: {
    min: 86,
    max: 100,
    label: "Critical",
    description:
      "Very high distress indicators detected. Immediate safety review and appropriate support should be considered.",
  },
};

const getRiskBand = (score) => {
  const value = Number(score) || 0;

  if (value <= 30) return RISK_BANDS.LOW;
  if (value <= 60) return RISK_BANDS.MODERATE;
  if (value <= 85) return RISK_BANDS.HIGH;

  return RISK_BANDS.CRITICAL;
};

const getTrend = (current, previous) => {
  if (previous === null || previous === undefined) {
    return {
      label: "First Assessment",
      direction: "neutral",
      icon: "•",
      description: "There is no previous assessment available for comparison.",
    };
  }

  const change = Number(current) - Number(previous);

  if (change > 3) {
    return {
      label: "Worsening",
      direction: "up",
      icon: "↗",
      description:
        "The distress score has increased compared with the previous assessment.",
    };
  }

  if (change < -3) {
    return {
      label: "Improving",
      direction: "down",
      icon: "↘",
      description:
        "The distress score has decreased compared with the previous assessment.",
    };
  }

  return {
    label: "Stable",
    direction: "stable",
    icon: "→",
    description:
      "The distress score has remained relatively stable compared with the previous assessment.",
  };
};

const getPrediction = (current, previous) => {
  const currentScore = Number(current) || 0;

  if (previous === null || previous === undefined) {
    if (currentScore >= 86) {
      return {
        level: "Critical",
        title: "Immediate review recommended",
        message:
          "The current assessment is in the Critical range. A human safety review and appropriate support pathway should be prioritized.",
      };
    }

    if (currentScore >= 61) {
      return {
        level: "High",
        title: "Elevated escalation risk",
        message:
          "The current assessment is in the High range. Timely follow-up and human support are recommended.",
      };
    }

    return {
      level: "Monitoring",
      title: "Continue monitoring",
      message:
        "This is the first recorded assessment. Future assessments will help identify changes over time.",
    };
  }

  const change = currentScore - Number(previous);

  if (currentScore >= 86 || change >= 15) {
    return {
      level: "Critical",
      title: "High escalation concern",
      message:
        "The current score or recent increase indicates a significant escalation signal. Human review and appropriate support should be prioritized.",
    };
  }

  if (currentScore >= 61 || change >= 8) {
    return {
      level: "High",
      title: "Elevated escalation risk",
      message:
        "The score or recent trend indicates increased distress. Follow-up and appropriate support are recommended.",
    };
  }

  if (change > 3) {
    return {
      level: "Moderate",
      title: "Early worsening signal",
      message:
        "The score has increased compared with the previous assessment. Continued monitoring is recommended.",
    };
  }

  if (change < -3) {
    return {
      level: "Low",
      title: "Positive change observed",
      message:
        "The score has decreased compared with the previous assessment. Continue follow-up to confirm the trend.",
    };
  }

  return {
    level: "Monitoring",
    title: "No major escalation detected",
    message:
      "The available assessment data does not show a major recent escalation. Continue scheduled monitoring.",
  };
};

const getSafetyPriority = (assessment) => {
  if (!assessment) return "Routine";

  if (
    assessment.safetyFlag === true ||
    assessment.emergency === true ||
    assessment.riskBand === "Critical"
  ) {
    return "Immediate";
  }

  if (assessment.riskBand === "High") {
    return "Priority";
  }

  if (assessment.riskBand === "Moderate") {
    return "Monitor";
  }

  return "Routine";
};

const formatDate = (value) => {
  if (!value) return "Not available";

  try {
    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Not available";
  }
};

const getIndicatorLabel = (key) => {
  const labels = {
    stress: "Stress",
    fear: "Fear",
    anxiety: "Anxiety",
    sleep: "Sleep difficulty",
    socialIsolation: "Social isolation",
    trauma: "Trauma indicators",
    urgency: "Urgency",
    threat: "Threat indicators",
    unsafe: "Safety concern",
    incident: "Incident context",
  };

  return labels[key] || key;
};

const getScoreColorClass = (score) => {
  if (score <= 30) return "low";
  if (score <= 60) return "moderate";
  if (score <= 85) return "high";
  return "critical";
};

export default function DistressPrediction() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadAssessments = async () => {
      if (!user) {
        setAssessments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const assessmentsRef = collection(db, "distressAssessments");

        /*
         * We intentionally query only by userId.
         * This avoids requiring a composite Firestore index.
         */
        const q = query(
          assessmentsRef,
          where("userId", "==", user.uid),
          limit(50)
        );

        const snapshot = await getDocs(q);

        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        records.sort((a, b) => {
          const getTime = (record) => {
            if (record?.createdAt?.toMillis) {
              return record.createdAt.toMillis();
            }

            if (record?.createdAt?.seconds) {
              return record.createdAt.seconds * 1000;
            }

            const parsed = new Date(record?.createdAt || 0).getTime();

            return Number.isNaN(parsed) ? 0 : parsed;
          };

          return getTime(b) - getTime(a);
        });

        setAssessments(records);
      } catch (err) {
        console.error("DISTRESS PREDICTION LOAD ERROR:", err);
        setError(
          "Unable to load your distress monitoring data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [user]);

  const latestAssessment = assessments[0] || null;
  const previousAssessment = assessments[1] || null;

  const currentScore = Number(latestAssessment?.score) || 0;

  const previousScore =
    previousAssessment?.score !== undefined &&
    previousAssessment?.score !== null
      ? Number(previousAssessment.score)
      : null;

  const scoreChange =
    previousScore === null ? null : currentScore - previousScore;

  const riskBand = useMemo(
    () => getRiskBand(currentScore),
    [currentScore]
  );

  const trend = useMemo(
    () => getTrend(currentScore, previousScore),
    [currentScore, previousScore]
  );

  const prediction = useMemo(
    () => getPrediction(currentScore, previousScore),
    [currentScore, previousScore]
  );

  const safetyPriority = useMemo(
    () => getSafetyPriority(latestAssessment),
    [latestAssessment]
  );

  const scoreColorClass = getScoreColorClass(currentScore);

  const indicatorEntries = useMemo(() => {
    if (!latestAssessment?.indicators) return [];

    return Object.entries(latestAssessment.indicators)
      .filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          value !== false
      )
      .slice(0, 8);
  }, [latestAssessment]);

  const recommendedActions = useMemo(() => {
    if (Array.isArray(latestAssessment?.recommendedActions)) {
      return latestAssessment.recommendedActions.filter(Boolean);
    }

    if (latestAssessment?.recommendedAction) {
      return [latestAssessment.recommendedAction];
    }

    if (currentScore >= 86) {
      return [
        "Prioritize immediate safety review.",
        "Consider Emergency Support if there is immediate danger.",
        "Consider Protection Support where threat or intimidation is present.",
        "Connect with an appropriate human professional.",
      ];
    }

    if (currentScore >= 61) {
      return [
        "Schedule timely follow-up monitoring.",
        "Consider connecting with a psychologist or trained support professional.",
        "Review protection or safety options if threats are reported.",
      ];
    }

    if (currentScore >= 31) {
      return [
        "Continue regular distress monitoring.",
        "Consider speaking with a psychologist or support professional.",
        "Complete the next follow-up assessment.",
      ];
    }

    return [
      "Continue regular monitoring.",
      "Maintain available support connections.",
      "Complete future follow-up assessments to identify changes over time.",
    ];
  }, [latestAssessment, currentScore]);

  const handleNewAssessment = () => {
    navigate("/assessment");
  };

  const handleProgress = () => {
    navigate("/progress");
  };

  const handlePsychologist = () => {
    navigate("/psychologists");
  };

  const handleEmergency = () => {
    navigate("/emergency-support");
  };

  const handleProtection = () => {
    navigate("/protection-support");
  };

  if (authLoading) {
    return (
      <div className="dp-page">
        <div className="dp-loading">
          <div className="dp-spinner" />
          <p>Loading distress monitoring...</p>
        </div>

        <PredictionStyles />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dp-page">
        <div className="dp-login-card">
          <div className="dp-login-icon">🔐</div>

          <h1>Login Required</h1>

          <p>
            Please login to view your dynamic distress monitoring,
            prediction and assessment history.
          </p>

          <button
            className="dp-primary-btn"
            onClick={() => navigate("/login")}
          >
            Login to Continue
          </button>

          <button
            className="dp-secondary-btn"
            onClick={() => navigate("/assessment")}
          >
            Take Assessment
          </button>
        </div>

        <PredictionStyles />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dp-page">
        <div className="dp-loading">
          <div className="dp-spinner" />
          <p>Analyzing your monitoring history...</p>
        </div>

        <PredictionStyles />
      </div>
    );
  }

  return (
    <div className="dp-page">
      <div className="dp-container">
        {/* HEADER */}
        <header className="dp-header">
          <div>
            <div className="dp-eyebrow">
              SWASTPROVA • PS-94 MONITORING
            </div>

            <h1>Distress Prediction</h1>

            <p>
              Understand how distress indicators are changing over time
              and identify early escalation signals.
            </p>
          </div>

          <div className="dp-header-actions">
            <button
              className="dp-secondary-btn"
              onClick={handleProgress}
            >
              ← Back to Progress
            </button>

            <button
              className="dp-primary-btn"
              onClick={handleNewAssessment}
            >
              + New Assessment
            </button>
          </div>
        </header>

        {error && (
          <div className="dp-error">
            <span>⚠️</span>
            <div>
              <strong>Data loading issue</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!latestAssessment ? (
          <div className="dp-empty">
            <div className="dp-empty-icon">📊</div>

            <h2>No assessment history yet</h2>

            <p>
              Complete your first assessment to start dynamic distress
              monitoring and longitudinal trend analysis.
            </p>

            <button
              className="dp-primary-btn"
              onClick={handleNewAssessment}
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <>
            {/* MAIN SCORE */}
            <section className="dp-main-grid">
              <div className="dp-score-card">
                <div className="dp-card-top">
                  <div>
                    <span className="dp-card-label">
                      CURRENT DISTRESS SCORE
                    </span>

                    <h2>Dynamic Distress Level</h2>
                  </div>

                  <div className="dp-live-badge">
                    <span className="dp-live-dot" />
                    Monitoring
                  </div>
                </div>

                <div className="dp-score-area">
                  <div className={`dp-score-ring ${scoreColorClass}`}>
                    <div className="dp-score-inner">
                      <strong>{currentScore}</strong>
                      <span>/ 100</span>
                    </div>
                  </div>

                  <div className="dp-score-info">
                    <div
                      className={`dp-risk-pill ${scoreColorClass}`}
                    >
                      {riskBand.label} Risk
                    </div>

                    <h3>{riskBand.label} Distress Range</h3>

                    <p>{riskBand.description}</p>

                    <small>
                      Last assessment:{" "}
                      <strong>
                        {formatDate(latestAssessment.createdAt)}
                      </strong>
                    </small>
                  </div>
                </div>

                <div className="dp-scale">
                  <div className="dp-scale-row">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Critical</span>
                  </div>

                  <div className="dp-scale-bar">
                    <div className="dp-scale-low" />
                    <div className="dp-scale-moderate" />
                    <div className="dp-scale-high" />
                    <div className="dp-scale-critical" />
                  </div>

                  <div className="dp-scale-numbers">
                    <span>0</span>
                    <span>30</span>
                    <span>60</span>
                    <span>85</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* PREDICTION */}
              <div
                className={`dp-prediction-card ${scoreColorClass}`}
              >
                <div className="dp-prediction-icon">
                  {prediction.level === "Critical"
                    ? "🚨"
                    : prediction.level === "High"
                    ? "⚠️"
                    : prediction.level === "Moderate"
                    ? "📈"
                    : "🛡️"}
                </div>

                <span className="dp-card-label">
                  ESCALATION ANALYSIS
                </span>

                <h2>{prediction.title}</h2>

                <p>{prediction.message}</p>

                <div className="dp-prediction-level">
                  <span>Prediction level</span>
                  <strong>{prediction.level}</strong>
                </div>

                <div className="dp-prototype-note">
                  <span>ⓘ</span>
                  <p>
                    This is a prototype risk-estimation signal based on
                    assessment data and score trends. It is not a
                    clinical diagnosis or a guaranteed prediction.
                  </p>
                </div>
              </div>
            </section>

            {/* COMPARISON CARDS */}
            <section className="dp-section">
              <div className="dp-section-heading">
                <div>
                  <span className="dp-section-kicker">
                    LONGITUDINAL MONITORING
                  </span>
                  <h2>Change Over Time</h2>
                </div>

                <span className="dp-data-badge">
                  {assessments.length} assessment
                  {assessments.length === 1 ? "" : "s"} recorded
                </span>
              </div>

              <div className="dp-stat-grid">
                <div className="dp-stat-card">
                  <div className="dp-stat-icon">🧠</div>
                  <span>Current Score</span>
                  <strong>{currentScore}</strong>
                  <small>Latest distress indicator</small>
                </div>

                <div className="dp-stat-card">
                  <div className="dp-stat-icon">↩️</div>
                  <span>Previous Score</span>
                  <strong>
                    {previousScore === null ? "—" : previousScore}
                  </strong>
                  <small>
                    {previousScore === null
                      ? "No previous assessment"
                      : "Previous recorded score"}
                  </small>
                </div>

                <div className="dp-stat-card">
                  <div className="dp-stat-icon">📊</div>
                  <span>Score Change</span>
                  <strong>
                    {scoreChange === null
                      ? "—"
                      : `${scoreChange > 0 ? "+" : ""}${scoreChange}`}
                  </strong>
                  <small>
                    {scoreChange === null
                      ? "Waiting for comparison"
                      : "Compared with previous assessment"}
                  </small>
                </div>

                <div className="dp-stat-card">
                  <div className="dp-stat-icon">
                    {trend.icon}
                  </div>
                  <span>Trend</span>
                  <strong>{trend.label}</strong>
                  <small>{trend.description}</small>
                </div>
              </div>
            </section>

            {/* TREND VISUAL */}
            <section className="dp-section">
              <div className="dp-section-heading">
                <div>
                  <span className="dp-section-kicker">
                    SCORE HISTORY
                  </span>
                  <h2>Distress Trend</h2>
                </div>
              </div>

              <div className="dp-trend-card">
                {assessments.length === 1 ? (
                  <div className="dp-first-trend">
                    <div className="dp-first-trend-icon">📍</div>

                    <div>
                      <h3>Baseline assessment recorded</h3>
                      <p>
                        Your first score is <strong>{currentScore}</strong>.
                        Complete future follow-up assessments to build a
                        longitudinal trend.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="dp-chart">
                    {[...assessments]
                      .reverse()
                      .slice(-8)
                      .map((item, index) => {
                        const score = Math.min(
                          100,
                          Math.max(0, Number(item.score) || 0)
                        );

                        const band = getRiskBand(score);

                        return (
                          <div
                            className="dp-chart-item"
                            key={item.id || index}
                          >
                            <div className="dp-chart-value">
                              {score}
                            </div>

                            <div className="dp-chart-column">
                              <div
                                className={`dp-chart-bar ${getScoreColorClass(
                                  score
                                )}`}
                                style={{
                                  height: `${Math.max(score, 5)}%`,
                                }}
                              />
                            </div>

                            <div className="dp-chart-label">
                              <strong>{band.label}</strong>
                              <span>
                                {formatDate(item.createdAt)
                                  .split(",")[0]
                                  .replace(/\s\d{4}/, "")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                <div className="dp-trend-explanation">
                  <div className="dp-trend-icon">
                    {trend.icon}
                  </div>

                  <div>
                    <strong>
                      Current trend: {trend.label}
                    </strong>

                    <p>{trend.description}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* INDICATORS */}
            <section className="dp-two-column">
              <div className="dp-panel">
                <div className="dp-panel-header">
                  <div>
                    <span className="dp-section-kicker">
                      EXPLAINABLE OUTPUT
                    </span>
                    <h2>Assessment Indicators</h2>
                  </div>

                  <span className="dp-panel-icon">🔎</span>
                </div>

                {indicatorEntries.length > 0 ? (
                  <div className="dp-indicators">
                    {indicatorEntries.map(([key, value]) => {
                      const numericValue =
                        typeof value === "number"
                          ? value
                          : null;

                      return (
                        <div
                          className="dp-indicator"
                          key={key}
                        >
                          <div className="dp-indicator-left">
                            <span className="dp-indicator-dot" />
                            <span>
                              {getIndicatorLabel(key)}
                            </span>
                          </div>

                          <div className="dp-indicator-right">
                            {numericValue !== null ? (
                              <>
                                <div className="dp-mini-bar">
                                  <div
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(0, numericValue)
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <strong>{numericValue}</strong>
                              </>
                            ) : (
                              <strong>
                                {String(value)}
                              </strong>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="dp-no-data">
                    <span>ℹ️</span>
                    <p>
                      Detailed indicator data is not available for
                      this assessment.
                    </p>
                  </div>
                )}

                <div className="dp-explain-note">
                  <strong>Why this matters</strong>
                  <p>
                    The score should not be treated as a black-box
                    decision. These indicators provide context for
                    understanding why additional monitoring or support
                    may be recommended.
                  </p>
                </div>
              </div>

              {/* SAFETY */}
              <div
                className={`dp-panel dp-safety-panel ${
                  safetyPriority === "Immediate"
                    ? "immediate"
                    : safetyPriority === "Priority"
                    ? "priority"
                    : ""
                }`}
              >
                <div className="dp-panel-header">
                  <div>
                    <span className="dp-section-kicker">
                      SAFETY PRIORITY
                    </span>
                    <h2>Safety Review</h2>
                  </div>

                  <span className="dp-panel-icon">🛡️</span>
                </div>

                <div className="dp-safety-status">
                  <span>Status</span>

                  <strong>{safetyPriority}</strong>
                </div>

                {latestAssessment.safetyFlag && (
                  <div className="dp-safety-alert">
                    <span>⚠️</span>

                    <div>
                      <strong>Safety indicator detected</strong>

                      <p>
                        The assessment contains a safety-related
                        indicator. This should be reviewed by a human
                        support professional or responsible authority
                        where appropriate.
                      </p>
                    </div>
                  </div>
                )}

                <div className="dp-safety-text">
                  {safetyPriority === "Immediate" ? (
                    <>
                      <strong>Immediate attention recommended.</strong>
                      <p>
                        If there is an immediate danger, use the
                        emergency support pathway. Where threats or
                        intimidation are present, protection support
                        may also be relevant.
                      </p>
                    </>
                  ) : safetyPriority === "Priority" ? (
                    <>
                      <strong>Priority follow-up recommended.</strong>
                      <p>
                        Consider timely human support and review
                        available safety or protection options where
                        relevant.
                      </p>
                    </>
                  ) : (
                    <>
                      <strong>Continue regular monitoring.</strong>
                      <p>
                        Keep completing follow-up assessments so that
                        meaningful changes can be identified over time.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* RECOMMENDED ACTIONS */}
            <section className="dp-section">
              <div className="dp-section-heading">
                <div>
                  <span className="dp-section-kicker">
                    NEXT STEP
                  </span>
                  <h2>Recommended Support Pathway</h2>
                </div>
              </div>

              <div className="dp-actions-card">
                <div className="dp-actions-list">
                  {recommendedActions.map((action, index) => (
                    <div
                      className="dp-action-item"
                      key={`${action}-${index}`}
                    >
                      <span>{index + 1}</span>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>

                <div className="dp-action-buttons">
                  {currentScore >= 86 && (
                    <button
                      className="dp-danger-btn"
                      onClick={handleEmergency}
                    >
                      🚨 Emergency Support
                    </button>
                  )}

                  {(currentScore >= 61 ||
                    latestAssessment?.safetyFlag) && (
                    <button
                      className="dp-protection-btn"
                      onClick={handleProtection}
                    >
                      🛡️ Protection Support
                    </button>
                  )}

                  {currentScore >= 31 && (
                    <button
                      className="dp-primary-btn"
                      onClick={handlePsychologist}
                    >
                      👨‍⚕️ Talk to Psychologist
                    </button>
                  )}

                  <button
                    className="dp-secondary-btn"
                    onClick={handleNewAssessment}
                  >
                    📋 Take Follow-up Assessment
                  </button>
                </div>
              </div>
            </section>

            {/* RECENT ASSESSMENTS */}
            <section className="dp-section">
              <div className="dp-section-heading">
                <div>
                  <span className="dp-section-kicker">
                    MONITORING HISTORY
                  </span>
                  <h2>Recent Assessments</h2>
                </div>
              </div>

              <div className="dp-history-card">
                <div className="dp-history-header">
                  <span>Date</span>
                  <span>Score</span>
                  <span>Risk</span>
                  <span>Trend</span>
                </div>

                {assessments.slice(0, 8).map((item, index) => {
                  const score = Number(item.score) || 0;
                  const band = getRiskBand(score);

                  const previous =
                    assessments[index + 1]?.score !== undefined
                      ? Number(assessments[index + 1].score)
                      : null;

                  const itemTrend = getTrend(score, previous);

                  return (
                    <div
                      className="dp-history-row"
                      key={item.id || index}
                    >
                      <span>
                        {formatDate(item.createdAt)}
                      </span>

                      <strong>{score}/100</strong>

                      <span
                        className={`dp-history-risk ${getScoreColorClass(
                          score
                        )}`}
                      >
                        {band.label}
                      </span>

                      <span
                        className={`dp-history-trend ${itemTrend.direction}`}
                      >
                        {itemTrend.icon} {itemTrend.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* RESPONSIBLE AI NOTE */}
            <section className="dp-responsible-ai">
              <div className="dp-ai-icon">🤖</div>

              <div>
                <span>RESPONSIBLE AI</span>

                <h3>
                  Screening and monitoring, not diagnosis
                </h3>

                <p>
                  SWASTPROVA uses assessment responses and available
                  trend signals to support monitoring and early
                  identification of possible distress escalation. The
                  system does not provide a medical or psychiatric
                  diagnosis. Final decisions and interventions should
                  involve appropriate human professionals and
                  authorized authorities.
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      <PredictionStyles />
    </div>
  );
}

function PredictionStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      .dp-page {
        min-height: 100vh;
        background:
          radial-gradient(circle at top left, rgba(20, 184, 166, 0.08), transparent 30%),
          radial-gradient(circle at top right, rgba(37, 99, 235, 0.07), transparent 28%),
          #f6f8fc;
        color: #172033;
        font-family:
          Inter,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
        padding: 36px 20px 70px;
      }

      .dp-container {
        max-width: 1180px;
        margin: 0 auto;
      }

      .dp-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 28px;
        margin-bottom: 30px;
      }

      .dp-eyebrow,
      .dp-section-kicker {
        color: #0f766e;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.13em;
        text-transform: uppercase;
      }

      .dp-header h1 {
        margin: 8px 0 8px;
        font-size: clamp(30px, 4vw, 46px);
        line-height: 1.08;
        letter-spacing: -0.035em;
      }

      .dp-header p {
        max-width: 680px;
        margin: 0;
        color: #667085;
        font-size: 15px;
        line-height: 1.7;
      }

      .dp-header-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .dp-primary-btn,
      .dp-secondary-btn,
      .dp-danger-btn,
      .dp-protection-btn {
        border: none;
        border-radius: 12px;
        padding: 12px 17px;
        font-size: 13px;
        font-weight: 750;
        cursor: pointer;
        transition: 0.2s ease;
        white-space: nowrap;
      }

      .dp-primary-btn {
        background: #0f766e;
        color: white;
        box-shadow: 0 8px 20px rgba(15, 118, 110, 0.18);
      }

      .dp-primary-btn:hover {
        transform: translateY(-1px);
        background: #0b625c;
      }

      .dp-secondary-btn {
        background: white;
        color: #344054;
        border: 1px solid #d9dee8;
      }

      .dp-secondary-btn:hover {
        border-color: #0f766e;
        color: #0f766e;
      }

      .dp-danger-btn {
        background: #b42318;
        color: white;
        box-shadow: 0 8px 20px rgba(180, 35, 24, 0.18);
      }

      .dp-protection-btn {
        background: #334155;
        color: white;
      }

      .dp-error {
        display: flex;
        gap: 13px;
        align-items: flex-start;
        background: #fff4f2;
        border: 1px solid #fecdca;
        border-radius: 16px;
        padding: 15px 18px;
        margin-bottom: 22px;
        color: #912018;
      }

      .dp-error p {
        margin: 4px 0 0;
        font-size: 13px;
      }

      .dp-main-grid {
        display: grid;
        grid-template-columns: 1.4fr 0.9fr;
        gap: 18px;
      }

      .dp-score-card,
      .dp-prediction-card,
      .dp-stat-card,
      .dp-trend-card,
      .dp-panel,
      .dp-actions-card,
      .dp-history-card {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #e5e9f0;
        border-radius: 22px;
        box-shadow: 0 10px 35px rgba(16, 24, 40, 0.05);
      }

      .dp-score-card {
        padding: 27px;
      }

      .dp-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
      }

      .dp-card-label {
        display: block;
        color: #98a2b3;
        font-size: 10px;
        font-weight: 850;
        letter-spacing: 0.13em;
      }

      .dp-card-top h2,
      .dp-prediction-card h2 {
        margin: 6px 0 0;
        font-size: 21px;
        letter-spacing: -0.02em;
      }

      .dp-live-badge {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 10px;
        border-radius: 999px;
        background: #ecfdf3;
        color: #027a48;
        font-size: 11px;
        font-weight: 800;
      }

      .dp-live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #12b76a;
        box-shadow: 0 0 0 4px rgba(18, 183, 106, 0.12);
      }

      .dp-score-area {
        display: flex;
        align-items: center;
        gap: 32px;
        margin: 30px 0 26px;
      }

      .dp-score-ring {
        width: 176px;
        height: 176px;
        flex: 0 0 176px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        position: relative;
        background: conic-gradient(#0f766e 0deg, #dcefeb 0deg);
      }

      .dp-score-ring::before {
        content: "";
        position: absolute;
        inset: 11px;
        background: white;
        border-radius: 50%;
      }

      .dp-score-ring.low {
        background: conic-gradient(#12b76a 0deg 108deg, #e8f8ef 108deg 360deg);
      }

      .dp-score-ring.moderate {
        background: conic-gradient(#f79009 0deg 216deg, #fff3df 216deg 360deg);
      }

      .dp-score-ring.high {
        background: conic-gradient(#f04438 0deg 306deg, #ffe8e6 306deg 360deg);
      }

      .dp-score-ring.critical {
        background: conic-gradient(#b42318 0deg 360deg, #ffe2df 360deg);
      }

      .dp-score-inner {
        position: relative;
        z-index: 1;
        text-align: center;
      }

      .dp-score-inner strong {
        display: block;
        font-size: 48px;
        line-height: 1;
        letter-spacing: -0.05em;
      }

      .dp-score-inner span {
        color: #98a2b3;
        font-size: 12px;
        font-weight: 700;
      }

      .dp-score-info {
        flex: 1;
      }

      .dp-risk-pill {
        display: inline-flex;
        padding: 6px 11px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 850;
        margin-bottom: 11px;
      }

      .dp-risk-pill.low {
        background: #ecfdf3;
        color: #027a48;
      }

      .dp-risk-pill.moderate {
        background: #fffaeb;
        color: #b54708;
      }

      .dp-risk-pill.high {
        background: #fff4ed;
        color: #c4320a;
      }

      .dp-risk-pill.critical {
        background: #fef3f2;
        color: #b42318;
      }

      .dp-score-info h3 {
        margin: 0 0 7px;
        font-size: 20px;
      }

      .dp-score-info p {
        color: #667085;
        font-size: 13px;
        line-height: 1.65;
        margin: 0 0 12px;
      }

      .dp-score-info small {
        color: #98a2b3;
      }

      .dp-scale-row,
      .dp-scale-numbers {
        display: flex;
        justify-content: space-between;
      }

      .dp-scale-row {
        margin-bottom: 7px;
        color: #667085;
        font-size: 10px;
        font-weight: 700;
      }

      .dp-scale-bar {
        display: flex;
        height: 8px;
        border-radius: 99px;
        overflow: hidden;
      }

      .dp-scale-low {
        width: 30%;
        background: #12b76a;
      }

      .dp-scale-moderate {
        width: 30%;
        background: #f79009;
      }

      .dp-scale-high {
        width: 25%;
        background: #f04438;
      }

      .dp-scale-critical {
        width: 15%;
        background: #b42318;
      }

      .dp-scale-numbers {
        margin-top: 6px;
        color: #98a2b3;
        font-size: 9px;
      }

      .dp-prediction-card {
        padding: 27px;
        position: relative;
        overflow: hidden;
      }

      .dp-prediction-card.high {
        border-color: #fecdca;
        background: linear-gradient(145deg, #fff, #fff8f7);
      }

      .dp-prediction-card.critical {
        border-color: #fda29b;
        background: linear-gradient(145deg, #fff, #fff4f2);
      }

      .dp-prediction-icon {
        width: 50px;
        height: 50px;
        border-radius: 15px;
        display: grid;
        place-items: center;
        background: #f2f4f7;
        font-size: 24px;
        margin-bottom: 20px;
      }

      .dp-prediction-card p {
        color: #667085;
        font-size: 13px;
        line-height: 1.7;
      }

      .dp-prediction-level {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
        padding: 13px 14px;
        background: #f8fafc;
        border-radius: 13px;
      }

      .dp-prediction-level span {
        color: #667085;
        font-size: 12px;
      }

      .dp-prediction-level strong {
        font-size: 13px;
      }

      .dp-prototype-note {
        display: flex;
        gap: 9px;
        margin-top: 15px;
        padding: 12px;
        background: rgba(255,255,255,0.7);
        border: 1px solid #eaecf0;
        border-radius: 12px;
      }

      .dp-prototype-note span {
        color: #667085;
      }

      .dp-prototype-note p {
        margin: 0;
        font-size: 10px;
        line-height: 1.55;
      }

      .dp-section {
        margin-top: 25px;
      }

      .dp-section-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 15px;
        margin-bottom: 14px;
      }

      .dp-section-heading h2 {
        margin: 4px 0 0;
        font-size: 22px;
        letter-spacing: -0.025em;
      }

      .dp-data-badge {
        padding: 7px 10px;
        background: #eef2ff;
        color: #4338ca;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 800;
      }

      .dp-stat-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 13px;
      }

      .dp-stat-card {
        padding: 19px;
      }

      .dp-stat-icon {
        font-size: 20px;
        margin-bottom: 15px;
      }

      .dp-stat-card span {
        display: block;
        color: #667085;
        font-size: 11px;
        font-weight: 700;
      }

      .dp-stat-card strong {
        display: block;
        margin: 7px 0 5px;
        font-size: 24px;
      }

      .dp-stat-card small {
        display: block;
        min-height: 32px;
        color: #98a2b3;
        font-size: 10px;
        line-height: 1.5;
      }

      .dp-trend-card {
        padding: 23px;
      }

      .dp-chart {
        min-height: 260px;
        display: flex;
        align-items: flex-end;
        gap: 15px;
        padding: 25px 15px 10px;
        border-bottom: 1px solid #eaecf0;
      }

      .dp-chart-item {
        flex: 1;
        min-width: 45px;
        height: 220px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
      }

      .dp-chart-value {
        margin-bottom: 7px;
        color: #344054;
        font-size: 11px;
        font-weight: 800;
      }

      .dp-chart-column {
        width: min(48px, 75%);
        height: 165px;
        display: flex;
        align-items: flex-end;
        border-radius: 9px 9px 3px 3px;
        background: #f2f4f7;
        overflow: hidden;
      }

      .dp-chart-bar {
        width: 100%;
        min-height: 8px;
        border-radius: 9px 9px 2px 2px;
      }

      .dp-chart-bar.low {
        background: #12b76a;
      }

      .dp-chart-bar.moderate {
        background: #f79009;
      }

      .dp-chart-bar.high {
        background: #f04438;
      }

      .dp-chart-bar.critical {
        background: #b42318;
      }

      .dp-chart-label {
        margin-top: 8px;
        text-align: center;
      }

      .dp-chart-label strong {
        display: block;
        font-size: 9px;
      }

      .dp-chart-label span {
        display: block;
        margin-top: 3px;
        color: #98a2b3;
        font-size: 8px;
      }

      .dp-trend-explanation,
      .dp-first-trend {
        display: flex;
        align-items: flex-start;
        gap: 13px;
        padding: 15px;
        margin-top: 18px;
        background: #f8fafc;
        border-radius: 14px;
      }

      .dp-trend-icon {
        width: 36px;
        height: 36px;
        flex: 0 0 36px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: white;
        font-size: 17px;
      }

      .dp-trend-explanation strong,
      .dp-first-trend h3 {
        font-size: 13px;
      }

      .dp-trend-explanation p,
      .dp-first-trend p {
        margin: 4px 0 0;
        color: #667085;
        font-size: 11px;
        line-height: 1.6;
      }

      .dp-two-column {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        margin-top: 25px;
      }

      .dp-panel {
        padding: 23px;
      }

      .dp-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
      }

      .dp-panel-header h2 {
        margin: 4px 0 0;
        font-size: 19px;
      }

      .dp-panel-icon {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        background: #f2f4f7;
      }

      .dp-indicators {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .dp-indicator {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .dp-indicator-left,
      .dp-indicator-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dp-indicator-left {
        color: #475467;
        font-size: 12px;
      }

      .dp-indicator-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #0f766e;
      }

      .dp-indicator-right {
        min-width: 120px;
        justify-content: flex-end;
      }

      .dp-mini-bar {
        width: 75px;
        height: 6px;
        border-radius: 99px;
        background: #eaecf0;
        overflow: hidden;
      }

      .dp-mini-bar div {
        height: 100%;
        background: #0f766e;
        border-radius: inherit;
      }

      .dp-indicator-right strong {
        color: #344054;
        font-size: 11px;
      }

      .dp-explain-note {
        margin-top: 18px;
        padding: 13px;
        background: #f8fafc;
        border-radius: 12px;
      }

      .dp-explain-note strong {
        font-size: 11px;
      }

      .dp-explain-note p {
        margin: 5px 0 0;
        color: #667085;
        font-size: 10px;
        line-height: 1.55;
      }

      .dp-safety-panel.immediate {
        border-color: #fda29b;
        background: #fffafa;
      }

      .dp-safety-panel.priority {
        border-color: #fecdca;
      }

      .dp-safety-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px;
        background: #f8fafc;
        border-radius: 13px;
        margin-bottom: 15px;
      }

      .dp-safety-status span {
        color: #667085;
        font-size: 12px;
      }

      .dp-safety-status strong {
        font-size: 12px;
      }

      .dp-safety-alert {
        display: flex;
        gap: 10px;
        padding: 13px;
        background: #fff4f2;
        border: 1px solid #fecdca;
        border-radius: 13px;
        margin-bottom: 15px;
      }

      .dp-safety-alert strong {
        font-size: 11px;
        color: #912018;
      }

      .dp-safety-alert p {
        margin: 4px 0 0;
        color: #7a271a;
        font-size: 10px;
        line-height: 1.55;
      }

      .dp-safety-text strong {
        font-size: 13px;
      }

      .dp-safety-text p {
        margin: 6px 0 0;
        color: #667085;
        font-size: 11px;
        line-height: 1.65;
      }

      .dp-actions-card {
        padding: 22px;
      }

      .dp-actions-list {
        display: grid;
        gap: 9px;
      }

      .dp-action-item {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 11px 12px;
        background: #f8fafc;
        border-radius: 12px;
      }

      .dp-action-item span {
        width: 25px;
        height: 25px;
        display: grid;
        place-items: center;
        flex: 0 0 25px;
        border-radius: 8px;
        background: #e6fffb;
        color: #0f766e;
        font-size: 10px;
        font-weight: 850;
      }

      .dp-action-item p {
        margin: 0;
        color: #475467;
        font-size: 12px;
        line-height: 1.5;
      }

      .dp-action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
        margin-top: 20px;
        padding-top: 18px;
        border-top: 1px solid #eaecf0;
      }

      .dp-history-card {
        overflow: hidden;
      }

      .dp-history-header,
      .dp-history-row {
        display: grid;
        grid-template-columns: 1.5fr 0.6fr 0.8fr 1fr;
        gap: 15px;
        align-items: center;
        padding: 14px 17px;
      }

      .dp-history-header {
        background: #f8fafc;
        color: #98a2b3;
        font-size: 10px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: 0.07em;
      }

      .dp-history-row {
        border-top: 1px solid #eaecf0;
        color: #667085;
        font-size: 11px;
      }

      .dp-history-row strong {
        color: #172033;
      }

      .dp-history-risk {
        width: fit-content;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: 850;
      }

      .dp-history-risk.low {
        background: #ecfdf3;
        color: #027a48;
      }

      .dp-history-risk.moderate {
        background: #fffaeb;
        color: #b54708;
      }

      .dp-history-risk.high {
        background: #fff4ed;
        color: #c4320a;
      }

      .dp-history-risk.critical {
        background: #fef3f2;
        color: #b42318;
      }

      .dp-history-trend {
        font-weight: 750;
      }

      .dp-history-trend.up {
        color: #d92d20;
      }

      .dp-history-trend.down {
        color: #039855;
      }

      .dp-history-trend.stable,
      .dp-history-trend.neutral {
        color: #667085;
      }

      .dp-responsible-ai {
        display: flex;
        gap: 15px;
        align-items: flex-start;
        margin-top: 25px;
        padding: 20px;
        border: 1px solid #d9e7e5;
        background: #f3fbfa;
        border-radius: 18px;
      }

      .dp-ai-icon {
        width: 42px;
        height: 42px;
        flex: 0 0 42px;
        display: grid;
        place-items: center;
        background: white;
        border-radius: 12px;
        font-size: 20px;
      }

      .dp-responsible-ai span {
        color: #0f766e;
        font-size: 9px;
        font-weight: 850;
        letter-spacing: 0.1em;
      }

      .dp-responsible-ai h3 {
        margin: 4px 0 5px;
        font-size: 14px;
      }

      .dp-responsible-ai p {
        max-width: 950px;
        margin: 0;
        color: #667085;
        font-size: 10px;
        line-height: 1.65;
      }

      .dp-loading,
      .dp-login-card,
      .dp-empty {
        max-width: 540px;
        margin: 90px auto;
        padding: 40px;
        text-align: center;
        background: white;
        border: 1px solid #e5e9f0;
        border-radius: 24px;
        box-shadow: 0 15px 45px rgba(16, 24, 40, 0.07);
      }

      .dp-spinner {
        width: 38px;
        height: 38px;
        margin: 0 auto 15px;
        border: 4px solid #dcefeb;
        border-top-color: #0f766e;
        border-radius: 50%;
        animation: dpSpin 0.8s linear infinite;
      }

      @keyframes dpSpin {
        to {
          transform: rotate(360deg);
        }
      }

      .dp-loading p {
        color: #667085;
        font-size: 13px;
      }

      .dp-login-icon,
      .dp-empty-icon {
        width: 65px;
        height: 65px;
        margin: 0 auto 18px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: #f2f4f7;
        font-size: 28px;
      }

      .dp-login-card h1,
      .dp-empty h2 {
        margin: 0 0 8px;
        font-size: 25px;
      }

      .dp-login-card p,
      .dp-empty p {
        color: #667085;
        font-size: 13px;
        line-height: 1.7;
        margin: 0 auto 22px;
      }

      .dp-login-card .dp-primary-btn,
      .dp-login-card .dp-secondary-btn,
      .dp-empty .dp-primary-btn {
        margin: 4px;
      }

      .dp-no-data {
        display: flex;
        gap: 9px;
        padding: 14px;
        background: #f8fafc;
        border-radius: 12px;
      }

      .dp-no-data p {
        margin: 0;
        color: #667085;
        font-size: 11px;
      }

      @media (max-width: 950px) {
        .dp-main-grid,
        .dp-two-column {
          grid-template-columns: 1fr;
        }

        .dp-stat-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .dp-header {
          flex-direction: column;
        }

        .dp-header-actions {
          justify-content: flex-start;
        }
      }

      @media (max-width: 650px) {
        .dp-page {
          padding: 22px 12px 50px;
        }

        .dp-score-card,
        .dp-prediction-card,
        .dp-panel,
        .dp-actions-card {
          padding: 18px;
        }

        .dp-score-area {
          flex-direction: column;
          text-align: center;
        }

        .dp-score-info {
          width: 100%;
        }

        .dp-stat-grid {
          grid-template-columns: 1fr 1fr;
        }

        .dp-history-header {
          display: none;
        }

        .dp-history-row {
          grid-template-columns: 1fr 1fr;
          padding: 15px;
        }

        .dp-chart {
          gap: 7px;
          padding-left: 3px;
          padding-right: 3px;
        }

        .dp-chart-column {
          width: 70%;
        }

        .dp-action-buttons {
          flex-direction: column;
        }

        .dp-action-buttons button {
          width: 100%;
        }

        .dp-responsible-ai {
          padding: 15px;
        }
      }
    `}</style>
  );
}

