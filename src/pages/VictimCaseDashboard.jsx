import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const getRiskBand = (score) => {
  const value = Number(score) || 0;

  if (value <= 30) return "Low";
  if (value <= 60) return "Moderate";
  if (value <= 85) return "High";
  return "Critical";
};

const getRiskClass = (risk) => {
  const value = String(risk || "").toLowerCase();

  if (value === "critical") return "critical";
  if (value === "high") return "high";
  if (value === "moderate") return "moderate";
  return "low";
};

const getTrend = (current, previous) => {
  if (previous === null || previous === undefined) {
    return {
      label: "First Assessment",
      icon: "•",
      className: "neutral",
    };
  }

  const change = Number(current) - Number(previous);

  if (change > 3) {
    return {
      label: "Worsening",
      icon: "↗",
      className: "up",
    };
  }

  if (change < -3) {
    return {
      label: "Improving",
      icon: "↘",
      className: "down",
    };
  }

  return {
    label: "Stable",
    icon: "→",
    className: "stable",
  };
};

const getPrediction = (current, previous) => {
  const score = Number(current) || 0;

  if (score >= 86) {
    return {
      level: "Critical",
      title: "Immediate Review Recommended",
      text:
        "The current distress indicator is in the Critical range. Human safety review and appropriate support pathways should be prioritized.",
    };
  }

  if (previous !== null && previous !== undefined) {
    const change = score - Number(previous);

    if (change >= 15) {
      return {
        level: "High",
        title: "Significant Escalation Signal",
        text:
          "The distress score has increased substantially compared with the previous assessment. Timely human review is recommended.",
      };
    }

    if (change >= 8 || score >= 61) {
      return {
        level: "High",
        title: "Elevated Escalation Risk",
        text:
          "The current score or recent trend indicates elevated distress. Follow-up and appropriate human support are recommended.",
      };
    }

    if (change < -3) {
      return {
        level: "Positive",
        title: "Positive Change Observed",
        text:
          "The current score has decreased compared with the previous assessment. Continue monitoring to confirm the trend.",
      };
    }
  }

  if (score >= 61) {
    return {
      level: "High",
      title: "Elevated Distress",
      text:
        "The current assessment indicates elevated distress. Continued monitoring and timely support may be appropriate.",
    };
  }

  return {
    level: "Monitoring",
    title: "Continue Monitoring",
    text:
      "The available assessment data does not indicate a major escalation. Continue scheduled monitoring and follow-up.",
  };
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

const getDateValue = (record) => {
  if (record?.createdAt?.toMillis) {
    return record.createdAt.toMillis();
  }

  if (record?.createdAt?.seconds) {
    return record.createdAt.seconds * 1000;
  }

  const parsed = new Date(record?.createdAt || 0).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
};

const getIncidentLabel = (value) => {
  const labels = {
    "Caste-based discrimination": "Caste-based Discrimination",
    "Abuse / Violence": "Abuse / Violence",
    "Threat / Intimidation": "Threat / Intimidation",
    "Social Boycott": "Social Boycott",
    "Sexual Violence": "Sexual Violence",
    "Murder / Grievous Hurt": "Murder / Grievous Hurt",
    "Arson / Property Damage": "Arson / Property Damage",
    Other: "Other",
  };

  return labels[value] || value || "Not specified";
};

const normalizeStatus = (value, fallback = "Pending") => {
  if (!value) return fallback;

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function VictimCaseDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [assessments, setAssessments] = useState([]);
  const [alerts, setAlerts] = useState([]);

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
    const loadCaseData = async () => {
      if (!user) {
        setAssessments([]);
        setAlerts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const assessmentRef = collection(db, "distressAssessments");

        const assessmentQuery = query(
          assessmentRef,
          where("userId", "==", user.uid),
          limit(50)
        );

        const assessmentSnapshot = await getDocs(
          assessmentQuery
        );

        const records = assessmentSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        records.sort((a, b) => {
          return getDateValue(b) - getDateValue(a);
        });

        setAssessments(records);

        /* ------------------------------------------
           LOAD ALERTS CONNECTED TO ASSESSMENTS
        ------------------------------------------ */

        const alertRef = collection(db, "alerts");

        const alertQuery = query(
          alertRef,
          where("userId", "==", user.uid),
          limit(50)
        );

        const alertSnapshot = await getDocs(alertQuery);

        const alertRecords = alertSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        alertRecords.sort((a, b) => {
          return getDateValue(b) - getDateValue(a);
        });

        setAlerts(alertRecords);
      } catch (err) {
        console.error("CASE DASHBOARD ERROR:", err);

        setError(
          "Unable to load case monitoring data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCaseData();
  }, [user]);

  const latest = assessments[0] || null;
  const previous = assessments[1] || null;

  const currentScore = Number(latest?.score) || 0;

  const previousScore =
    previous?.score !== undefined &&
    previous?.score !== null
      ? Number(previous.score)
      : null;

  const riskBand = getRiskBand(currentScore);
  const riskClass = getRiskClass(riskBand);

  const trend = getTrend(
    currentScore,
    previousScore
  );

  const prediction = getPrediction(
    currentScore,
    previousScore
  );

  const scoreChange =
    previousScore === null
      ? null
      : currentScore - previousScore;

  const incidentContext =
    latest?.incidentContext || {};

  const incidentType =
    incidentContext?.incidentType ||
    latest?.incidentType ||
    "Not specified";

  const facingThreat =
    incidentContext?.facingThreat ||
    latest?.facingThreat ||
    "";

  const feelsUnsafe =
    incidentContext?.feelsUnsafe ||
    latest?.feelsUnsafe ||
    "";

  const description =
    incidentContext?.description ||
    latest?.summary ||
    latest?.description ||
    "No additional incident description was recorded.";

  const safetyFlag =
    latest?.safetyFlag === true ||
    latest?.emergency === true ||
    (facingThreat === "yes" &&
      feelsUnsafe === "yes");

  const safetyPriority = useMemo(() => {
    if (
      safetyFlag ||
      riskBand === "Critical"
    ) {
      return "Immediate";
    }

    if (riskBand === "High") {
      return "Priority";
    }

    if (riskBand === "Moderate") {
      return "Monitor";
    }

    return "Routine";
  }, [safetyFlag, riskBand]);

  /* ------------------------------------------
     CONNECT LATEST ASSESSMENT WITH ALERT
  ------------------------------------------ */

  const latestAlert = useMemo(() => {
    if (!latest || alerts.length === 0) {
      return null;
    }

    const linkedAlert = alerts.find(
      (alert) =>
        alert.assessmentId === latest.id
    );

    if (linkedAlert) {
      return linkedAlert;
    }

    const sameScoreAlert = alerts.find(
      (alert) =>
        Number(alert.score) ===
          Number(latest.score) &&
        getDateValue(alert) >=
          getDateValue(latest) - 24 * 60 * 60 * 1000
    );

    return sameScoreAlert || null;
  }, [latest, alerts]);

  const reviewRequired = useMemo(() => {
    if (latest?.reviewRequired !== undefined) {
      return latest.reviewRequired === true;
    }

    if (latestAlert?.reviewRequired !== undefined) {
      return latestAlert.reviewRequired === true;
    }

    return (
      riskBand === "High" ||
      riskBand === "Critical" ||
      safetyFlag
    );
  }, [
    latest,
    latestAlert,
    riskBand,
    safetyFlag,
  ]);

  const reviewStatus = useMemo(() => {
    return normalizeStatus(
      latest?.reviewStatus ||
        latestAlert?.reviewStatus,
      reviewRequired ? "Pending" : "Not Required"
    );
  }, [
    latest,
    latestAlert,
    reviewRequired,
  ]);

  const supportRecommendation = useMemo(() => {
    return (
      latest?.supportRecommendation ||
      latestAlert?.supportRecommendation ||
      (riskBand === "Critical"
        ? "Immediate human review and appropriate safety/support pathways should be considered."
        : riskBand === "High"
        ? "Human review, timely support and closer follow-up are recommended."
        : safetyFlag
        ? "Safety concern detected. Appropriate human review and protection/support pathway should be considered."
        : riskBand === "Moderate"
        ? "Consider follow-up monitoring and appropriate support review."
        : "Continue periodic monitoring.")
    );
  }, [
    latest,
    latestAlert,
    riskBand,
    safetyFlag,
  ]);

  const supportPath = useMemo(() => {
    return (
      latest?.supportPath ||
      latestAlert?.supportPath ||
      (riskBand === "Critical"
        ? "Emergency Support + Human Review"
        : safetyFlag || riskBand === "High"
        ? "Protection Support + Human Review"
        : riskBand === "Moderate"
        ? "Psychologist / Support Review"
        : "Routine Monitoring")
    );
  }, [
    latest,
    latestAlert,
    riskBand,
    safetyFlag,
  ]);

  const supportStatus = useMemo(() => {
    return normalizeStatus(
      latest?.supportStatus ||
        latestAlert?.supportStatus,
      reviewRequired
        ? "Recommended"
        : "Not Required"
    );
  }, [
    latest,
    latestAlert,
    reviewRequired,
  ]);

  const followUpRequired = useMemo(() => {
    if (
      latest?.followUpRequired !== undefined
    ) {
      return latest.followUpRequired === true;
    }

    if (
      latestAlert?.followUpRequired !== undefined
    ) {
      return latestAlert.followUpRequired === true;
    }

    return (
      riskBand === "Moderate" ||
      riskBand === "High" ||
      riskBand === "Critical" ||
      safetyFlag
    );
  }, [
    latest,
    latestAlert,
    riskBand,
    safetyFlag,
  ]);

  const followUpStatus = useMemo(() => {
    return normalizeStatus(
      latest?.followUpStatus ||
        latestAlert?.followUpStatus,
      followUpRequired
        ? assessments.length > 1
          ? "In Progress"
          : "Pending"
        : "Not Required"
    );
  }, [
    latest,
    latestAlert,
    followUpRequired,
    assessments.length,
  ]);

  const alertStatus = useMemo(() => {
    return normalizeStatus(
      latestAlert?.status,
      latestAlert
        ? "New"
        : reviewRequired
        ? "Recommended"
        : "No Alert"
    );
  }, [
    latestAlert,
    reviewRequired,
  ]);

  const caseId = useMemo(() => {
    if (latest?.caseId) {
      return latest.caseId;
    }

    if (latest?.incidentContext?.caseId) {
      return latest.incidentContext.caseId;
    }

    if (latest?.id) {
      return `SWP-${latest.id
        .slice(0, 8)
        .toUpperCase()}`;
    }

    if (user?.uid) {
      return `SWP-${user.uid
        .slice(0, 8)
        .toUpperCase()}`;
    }

    return "SWP-PENDING";
  }, [latest, user]);

  const interventionStatus = useMemo(() => {
    if (!latest) return "Not started";

    if (
      latest.interventionStatus ||
      latest.supportStatus
    ) {
      return (
        latest.interventionStatus ||
        latest.supportStatus
      );
    }

    if (riskBand === "Critical") {
      return "Immediate review recommended";
    }

    if (riskBand === "High") {
      return "Priority follow-up recommended";
    }

    if (riskBand === "Moderate") {
      return "Monitoring and support";
    }

    return "Regular monitoring";
  }, [latest, riskBand]);

  const handleAssessment = () => {
    navigate("/assessment");
  };

  const handlePrediction = () => {
    navigate("/distress-prediction");
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
      <div className="vcd-page">
        <div className="vcd-loading">
          <div className="vcd-spinner" />
          <p>Loading case dashboard...</p>
        </div>

        <DashboardStyles />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="vcd-page">
        <div className="vcd-login-card">
          <div className="vcd-login-icon">
            🔐
          </div>

          <h1>Login Required</h1>

          <p>
            Please login to access your case monitoring
            dashboard and longitudinal distress
            information.
          </p>

          <button
            className="vcd-primary-btn"
            onClick={() => navigate("/login")}
          >
            Login to Continue
          </button>
        </div>

        <DashboardStyles />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vcd-page">
        <div className="vcd-loading">
          <div className="vcd-spinner" />
          <p>
            Loading monitoring records...
          </p>
        </div>

        <DashboardStyles />
      </div>
    );
  }

  return (
    <div className="vcd-page">
      <div className="vcd-container">

        {/* HEADER */}
        <header className="vcd-header">
          <div>
            <div className="vcd-eyebrow">
              SWASTPROVA • PS-94 CASE MONITORING
            </div>

            <h1>Victim Case Dashboard</h1>

            <p>
              A consolidated view of distress monitoring,
              incident context, risk trends and recommended
              support pathways.
            </p>
          </div>

          <div className="vcd-header-actions">
            <button
              className="vcd-secondary-btn"
              onClick={handleProgress}
            >
              ← Progress
            </button>

            <button
              className="vcd-primary-btn"
              onClick={handleAssessment}
            >
              + New Assessment
            </button>
          </div>
        </header>

        {error && (
          <div className="vcd-error">
            <span>⚠️</span>

            <div>
              <strong>
                Unable to load monitoring data
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {!latest ? (
          <div className="vcd-empty">
            <div className="vcd-empty-icon">
              📋
            </div>

            <h2>No Case Monitoring Data</h2>

            <p>
              Complete an assessment first. Your
              assessment result will create the monitoring
              record used by this dashboard.
            </p>

            <button
              className="vcd-primary-btn"
              onClick={handleAssessment}
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <>
            {/* CASE ID BAR */}
            <section className="vcd-case-bar">
              <div className="vcd-case-id">
                <span>CASE ID</span>
                <strong>{caseId}</strong>
              </div>

              <div className="vcd-case-meta">
                <div>
                  <span>Last Assessment</span>
                  <strong>
                    {formatDate(
                      latest.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Monitoring Records</span>
                  <strong>
                    {assessments.length}
                  </strong>
                </div>

                <div>
                  <span>Safety Priority</span>
                  <strong
                    className={`vcd-priority ${safetyPriority.toLowerCase()}`}
                  >
                    {safetyPriority}
                  </strong>
                </div>
              </div>
            </section>

            {/* TOP OVERVIEW */}
            <section className="vcd-overview-grid">
              <div className="vcd-risk-card">
                <div className="vcd-card-header">
                  <div>
                    <span className="vcd-card-kicker">
                      CURRENT STATUS
                    </span>

                    <h2>Current Distress</h2>
                  </div>

                  <div className="vcd-monitoring-badge">
                    <span />
                    Active Monitoring
                  </div>
                </div>

                <div className="vcd-risk-main">
                  <div
                    className={`vcd-score ${riskClass}`}
                  >
                    {currentScore}
                    <span>/100</span>
                  </div>

                  <div>
                    <span
                      className={`vcd-risk-badge ${riskClass}`}
                    >
                      {riskBand} Risk
                    </span>

                    <h3>
                      {riskBand} Distress Range
                    </h3>

                    <p>
                      Risk level is based on the
                      current assessment score and
                      configured monitoring bands.
                    </p>
                  </div>
                </div>

                <div className="vcd-risk-scale">
                  <div
                    className={`vcd-risk-progress ${riskClass}`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(2, currentScore)
                      )}%`,
                    }}
                  />
                </div>

                <div className="vcd-risk-scale-labels">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>

              {/* TREND */}
              <div className="vcd-trend-card">
                <div className="vcd-card-header">
                  <div>
                    <span className="vcd-card-kicker">
                      LONGITUDINAL TREND
                    </span>

                    <h2>Change Over Time</h2>
                  </div>

                  <div
                    className={`vcd-trend-icon ${trend.className}`}
                  >
                    {trend.icon}
                  </div>
                </div>

                <div className="vcd-trend-number">
                  {scoreChange === null ? (
                    "—"
                  ) : (
                    <>
                      {scoreChange > 0
                        ? "+"
                        : ""}
                      {scoreChange}
                    </>
                  )}
                </div>

                <div
                  className={`vcd-trend-label ${trend.className}`}
                >
                  {trend.icon} {trend.label}
                </div>

                <div className="vcd-comparison">
                  <div>
                    <span>Previous</span>
                    <strong>
                      {previousScore === null
                        ? "—"
                        : previousScore}
                    </strong>
                  </div>

                  <div className="vcd-arrow">
                    →
                  </div>

                  <div>
                    <span>Current</span>
                    <strong>
                      {currentScore}
                    </strong>
                  </div>
                </div>

                <p className="vcd-small-text">
                  {previousScore === null
                    ? "Future assessments will create a longitudinal trend."
                    : trend.label ===
                      "Worsening"
                    ? "The current score is higher than the previous recorded score."
                    : trend.label ===
                      "Improving"
                    ? "The current score is lower than the previous recorded score."
                    : "The scores are relatively stable."}
                </p>
              </div>
            </section>

            {/* INCIDENT CONTEXT */}
            <section className="vcd-section">
              <div className="vcd-section-title">
                <div>
                  <span className="vcd-card-kicker">
                    DOMAIN CONTEXT
                  </span>

                  <h2>Incident Context</h2>
                </div>

                <span className="vcd-context-badge">
                  Assessment Context
                </span>
              </div>

              <div className="vcd-context-grid">
                <div className="vcd-context-item">
                  <span>Incident Type</span>

                  <strong>
                    {getIncidentLabel(
                      incidentType
                    )}
                  </strong>
                </div>

                <div className="vcd-context-item">
                  <span>Threat Reported</span>

                  <strong>
                    {facingThreat
                      ? facingThreat === "yes"
                        ? "Yes"
                        : "No"
                      : "Not recorded"}
                  </strong>
                </div>

                <div className="vcd-context-item">
                  <span>Feels Unsafe</span>

                  <strong>
                    {feelsUnsafe
                      ? feelsUnsafe === "yes"
                        ? "Yes"
                        : "No"
                      : "Not recorded"}
                  </strong>
                </div>

                <div className="vcd-context-item full">
                  <span>
                    Situation Summary
                  </span>

                  <p>{description}</p>
                </div>
              </div>
            </section>

            {/* PREDICTION */}
            <section className="vcd-section">
              <div className="vcd-section-title">
                <div>
                  <span className="vcd-card-kicker">
                    EARLY WARNING
                  </span>

                  <h2>
                    Distress Escalation Prediction
                  </h2>
                </div>

                <button
                  className="vcd-link-btn"
                  onClick={handlePrediction}
                >
                  View Detailed Analysis →
                </button>
              </div>

              <div
                className={`vcd-prediction ${getRiskClass(
                  prediction.level
                )}`}
              >
                <div className="vcd-prediction-icon">
                  {prediction.level ===
                  "Critical"
                    ? "🚨"
                    : prediction.level ===
                      "High"
                    ? "⚠️"
                    : prediction.level ===
                      "Positive"
                    ? "📉"
                    : "📊"}
                </div>

                <div className="vcd-prediction-content">
                  <span>
                    Prediction Signal
                  </span>

                  <h3>
                    {prediction.title}
                  </h3>

                  <p>
                    {prediction.text}
                  </p>
                </div>

                <div className="vcd-prediction-level">
                  <span>Level</span>
                  <strong>
                    {prediction.level}
                  </strong>
                </div>
              </div>

              <div className="vcd-ai-note">
                <span>ⓘ</span>

                <p>
                  This is a prototype risk-estimation
                  and early-warning signal based on
                  assessment data and score trends.
                  It is not a clinical diagnosis and
                  should not replace human review.
                </p>
              </div>
            </section>

            {/* ------------------------------------------
                HUMAN REVIEW + SUPPORT WORKFLOW
            ------------------------------------------ */}

            <section className="vcd-section">
              <div className="vcd-section-title">
                <div>
                  <span className="vcd-card-kicker">
                    HUMAN-IN-THE-LOOP WORKFLOW
                  </span>

                  <h2>
                    Human Review & Support Pathway
                  </h2>
                </div>

                <span
                  className={`vcd-workflow-badge ${
                    reviewRequired
                      ? "required"
                      : "normal"
                  }`}
                >
                  {reviewRequired
                    ? "Review Required"
                    : "Routine Monitoring"}
                </span>
              </div>

              <div className="vcd-workflow-card">

                {/* REVIEW */}
                <div className="vcd-workflow-step">
                  <div className="vcd-workflow-number">
                    01
                  </div>

                  <div className="vcd-workflow-content">
                    <div className="vcd-workflow-top">
                      <div>
                        <span>
                          HUMAN REVIEW
                        </span>

                        <h3>
                          Review Status
                        </h3>
                      </div>

                      <strong
                        className={`vcd-workflow-status ${
                          reviewRequired
                            ? "pending"
                            : "not-required"
                        }`}
                      >
                        {reviewStatus}
                      </strong>
                    </div>

                    <p>
                      {reviewRequired
                        ? "The assessment has generated a signal that may require review by an appropriate human professional or authorized support authority."
                        : "No additional human review is currently required based on the available monitoring data."}
                    </p>

                    <div className="vcd-workflow-meta">
                      <span>
                        Review Required
                      </span>

                      <strong>
                        {reviewRequired
                          ? "Yes"
                          : "No"}
                      </strong>

                      <span>
                        Alert Status
                      </span>

                      <strong>
                        {alertStatus}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* SUPPORT */}
                <div className="vcd-workflow-step">
                  <div className="vcd-workflow-number">
                    02
                  </div>

                  <div className="vcd-workflow-content">
                    <div className="vcd-workflow-top">
                      <div>
                        <span>
                          SUPPORT RECOMMENDATION
                        </span>

                        <h3>
                          Recommended Next Step
                        </h3>
                      </div>

                      <strong
                        className="vcd-workflow-status support"
                      >
                        {supportStatus}
                      </strong>
                    </div>

                    <div className="vcd-recommendation-box">
                      <span>
                        Recommendation
                      </span>

                      <p>
                        {supportRecommendation}
                      </p>
                    </div>

                    <div className="vcd-support-path">
                      <span>
                        Support Path
                      </span>

                      <strong>
                        {supportPath}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* FOLLOW-UP */}
                <div className="vcd-workflow-step last">
                  <div className="vcd-workflow-number">
                    03
                  </div>

                  <div className="vcd-workflow-content">
                    <div className="vcd-workflow-top">
                      <div>
                        <span>
                          FOLLOW-UP
                        </span>

                        <h3>
                          Follow-up Assessment
                        </h3>
                      </div>

                      <strong
                        className={`vcd-workflow-status ${
                          followUpRequired
                            ? "followup"
                            : "not-required"
                        }`}
                      >
                        {followUpStatus}
                      </strong>
                    </div>

                    <p>
                      {followUpRequired
                        ? "A follow-up assessment is recommended so that the current result can be compared with previous monitoring data."
                        : "No additional follow-up is currently required. Continue routine monitoring."}
                    </p>

                    <div className="vcd-followup-actions">
                      {followUpRequired && (
                        <button
                          className="vcd-primary-btn"
                          onClick={
                            handleAssessment
                          }
                        >
                          📋 Start Follow-up
                        </button>
                      )}

                      <button
                        className="vcd-secondary-btn"
                        onClick={
                          handleProgress
                        }
                      >
                        📊 View History
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {latestAlert && (
                <div className="vcd-alert-connection">
                  <div className="vcd-alert-connection-icon">
                    🔗
                  </div>

                  <div>
                    <span>
                      ASSESSMENT → ALERT CONNECTION
                    </span>

                    <h3>
                      Monitoring alert linked to
                      current assessment
                    </h3>

                    <p>
                      This alert is connected to the
                      latest distress assessment and
                      carries the human-review,
                      support and follow-up
                      recommendations generated by
                      the monitoring workflow.
                    </p>

                    <div className="vcd-alert-connection-meta">
                      <span>
                        Alert ID
                      </span>

                      <strong>
                        {latestAlert.id}
                      </strong>

                      <span>
                        Assessment ID
                      </span>

                      <strong>
                        {latestAlert.assessmentId ||
                          latest.id}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* SAFETY + INTERVENTION */}
            <section className="vcd-two-column">
              <div
                className={`vcd-panel vcd-safety ${
                  safetyPriority === "Immediate"
                    ? "immediate"
                    : ""
                }`}
              >
                <div className="vcd-panel-header">
                  <div>
                    <span className="vcd-card-kicker">
                      SAFETY REVIEW
                    </span>

                    <h2>Safety Status</h2>
                  </div>

                  <span className="vcd-panel-icon">
                    🛡️
                  </span>
                </div>

                <div
                  className={`vcd-safety-status ${safetyPriority.toLowerCase()}`}
                >
                  <span>
                    Current Priority
                  </span>

                  <strong>
                    {safetyPriority}
                  </strong>
                </div>

                {safetyFlag ? (
                  <div className="vcd-alert-box">
                    <span>⚠️</span>

                    <div>
                      <strong>
                        Safety indicator detected
                      </strong>

                      <p>
                        Threat or safety-related
                        information was reported
                        in the assessment.
                        Appropriate human review
                        should be considered.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="vcd-safe-box">
                    <span>✓</span>

                    <div>
                      <strong>
                        No immediate safety flag
                        recorded
                      </strong>

                      <p>
                        Continue monitoring and
                        reassess if the situation
                        changes.
                      </p>
                    </div>
                  </div>
                )}

                <div className="vcd-panel-actions">
                  {(safetyFlag ||
                    riskBand === "High" ||
                    riskBand === "Critical") && (
                    <button
                      className="vcd-protection-btn"
                      onClick={handleProtection}
                    >
                      🛡️ Protection Support
                    </button>
                  )}

                  {riskBand ===
                    "Critical" && (
                    <button
                      className="vcd-danger-btn"
                      onClick={handleEmergency}
                    >
                      🚨 Emergency Support
                    </button>
                  )}
                </div>
              </div>

              <div className="vcd-panel">
                <div className="vcd-panel-header">
                  <div>
                    <span className="vcd-card-kicker">
                      SUPPORT PATHWAY
                    </span>

                    <h2>
                      Intervention Status
                    </h2>
                  </div>

                  <span className="vcd-panel-icon">
                    🤝
                  </span>
                </div>

                <div className="vcd-intervention-status">
                  <div className="vcd-status-dot" />

                  <div>
                    <strong>
                      {interventionStatus}
                    </strong>

                    <p>
                      Support recommendations
                      should be reviewed by the
                      appropriate human professional
                      or authorized authority.
                    </p>
                  </div>
                </div>

                <div className="vcd-intervention-list">
                  <div>
                    <span>01</span>

                    <p>
                      Distress monitoring
                    </p>

                    <strong>
                      Active
                    </strong>
                  </div>

                  <div>
                    <span>02</span>

                    <p>
                      Follow-up assessment
                    </p>

                    <strong>
                      {followUpRequired
                        ? followUpStatus
                        : "Not Required"}
                    </strong>
                  </div>

                  <div>
                    <span>03</span>

                    <p>
                      Human support review
                    </p>

                    <strong>
                      {reviewRequired
                        ? reviewStatus
                        : "As needed"}
                    </strong>
                  </div>

                  <div>
                    <span>04</span>

                    <p>
                      Support recommendation
                    </p>

                    <strong>
                      {supportStatus}
                    </strong>
                  </div>
                </div>

                <button
                  className="vcd-primary-btn vcd-full-btn"
                  onClick={
                    handlePsychologist
                  }
                >
                  👨‍⚕️ Connect with Psychologist
                </button>
              </div>
            </section>

            {/* MONITORING TIMELINE */}
            <section className="vcd-section">
              <div className="vcd-section-title">
                <div>
                  <span className="vcd-card-kicker">
                    CASE JOURNEY
                  </span>

                  <h2>
                    Monitoring Timeline
                  </h2>
                </div>

                <span className="vcd-context-badge">
                  {assessments.length} Record
                  {assessments.length === 1
                    ? ""
                    : "s"}
                </span>
              </div>

              <div className="vcd-timeline">
                {assessments
                  .slice(0, 8)
                  .map((item, index) => {
                    const score =
                      Number(item.score) || 0;

                    const risk =
                      getRiskBand(score);

                    const oldScore =
                      assessments[
                        index + 1
                      ]?.score !== undefined
                        ? Number(
                            assessments[
                              index + 1
                            ].score
                          )
                        : null;

                    const itemTrend =
                      getTrend(
                        score,
                        oldScore
                      );

                    const linkedItemAlert =
                      alerts.find(
                        (alert) =>
                          alert.assessmentId ===
                          item.id
                      );

                    return (
                      <div
                        className="vcd-timeline-item"
                        key={
                          item.id || index
                        }
                      >
                        <div
                          className={`vcd-timeline-dot ${getRiskClass(
                            risk
                          )}`}
                        />

                        <div className="vcd-timeline-content">
                          <div>
                            <span className="vcd-timeline-date">
                              {formatDate(
                                item.createdAt
                              )}
                            </span>

                            <h3>
                              Assessment #
                              {assessments.length -
                                index}
                            </h3>

                            {linkedItemAlert && (
                              <span className="vcd-timeline-alert">
                                ⚠ Alert linked
                              </span>
                            )}
                          </div>

                          <div className="vcd-timeline-right">
                            <strong>
                              {score}/100
                            </strong>

                            <span
                              className={`vcd-risk-badge small ${getRiskClass(
                                risk
                              )}`}
                            >
                              {risk}
                            </span>

                            <span
                              className={`vcd-timeline-trend ${itemTrend.className}`}
                            >
                              {itemTrend.icon}{" "}
                              {itemTrend.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="vcd-section">
              <div className="vcd-section-title">
                <div>
                  <span className="vcd-card-kicker">
                    QUICK ACCESS
                  </span>

                  <h2>
                    Support & Monitoring
                  </h2>
                </div>
              </div>

              <div className="vcd-quick-grid">
                <button
                  className="vcd-quick-card"
                  onClick={
                    handleAssessment
                  }
                >
                  <span>📋</span>

                  <div>
                    <strong>
                      Follow-up Assessment
                    </strong>

                    <p>
                      Update the current
                      distress status.
                    </p>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="vcd-quick-card"
                  onClick={
                    handlePrediction
                  }
                >
                  <span>📈</span>

                  <div>
                    <strong>
                      Prediction Analysis
                    </strong>

                    <p>
                      Review trend and
                      escalation signals.
                    </p>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="vcd-quick-card"
                  onClick={
                    handleProgress
                  }
                >
                  <span>📊</span>

                  <div>
                    <strong>
                      Progress & Follow-up
                    </strong>

                    <p>
                      View longitudinal
                      monitoring history.
                    </p>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="vcd-quick-card"
                  onClick={
                    handlePsychologist
                  }
                >
                  <span>🤝</span>

                  <div>
                    <strong>
                      Human Support
                    </strong>

                    <p>
                      Explore psychologist
                      support options.
                    </p>
                  </div>

                  <b>→</b>
                </button>
              </div>
            </section>

            {/* RESPONSIBLE AI */}
            <section className="vcd-responsible">
              <div className="vcd-responsible-icon">
                🤖
              </div>

              <div>
                <span>
                  RESPONSIBLE AI
                </span>

                <h3>
                  Human review remains part of
                  the decision process
                </h3>

                <p>
                  SWASTPROVA provides screening,
                  monitoring and early-warning
                  signals from available assessment
                  information. It does not
                  independently diagnose a mental
                  health condition or make final
                  protection, legal or medical
                  decisions.
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      <DashboardStyles />
    </div>
  );
}

function DashboardStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      .vcd-page {
        min-height: 100vh;
        padding: 35px 20px 70px;
        background:
          radial-gradient(circle at top left, rgba(15,118,110,.08), transparent 30%),
          radial-gradient(circle at top right, rgba(37,99,235,.06), transparent 28%),
          #f6f8fc;
        color: #172033;
        font-family:
          Inter,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      .vcd-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }

      .vcd-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 25px;
        margin-bottom: 28px;
      }

      .vcd-eyebrow,
      .vcd-card-kicker {
        color: #0f766e;
        font-size: 10px;
        font-weight: 850;
        letter-spacing: .13em;
        text-transform: uppercase;
      }

      .vcd-header h1 {
        margin: 8px 0 8px;
        font-size: clamp(30px, 4vw, 46px);
        line-height: 1.08;
        letter-spacing: -.04em;
      }

      .vcd-header p {
        max-width: 720px;
        margin: 0;
        color: #667085;
        font-size: 14px;
        line-height: 1.7;
      }

      .vcd-header-actions {
        display: flex;
        gap: 9px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .vcd-primary-btn,
      .vcd-secondary-btn,
      .vcd-danger-btn,
      .vcd-protection-btn {
        border: 0;
        border-radius: 12px;
        padding: 12px 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 800;
        transition: .2s ease;
      }

      .vcd-primary-btn {
        color: white;
        background: #0f766e;
        box-shadow: 0 8px 20px rgba(15,118,110,.17);
      }

      .vcd-primary-btn:hover {
        background: #0b625c;
        transform: translateY(-1px);
      }

      .vcd-secondary-btn {
        color: #344054;
        background: white;
        border: 1px solid #d9dee8;
      }

      .vcd-secondary-btn:hover {
        color: #0f766e;
        border-color: #0f766e;
      }

      .vcd-danger-btn {
        color: white;
        background: #b42318;
      }

      .vcd-protection-btn {
        color: white;
        background: #334155;
      }

      .vcd-error {
        display: flex;
        gap: 12px;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 15px;
        border: 1px solid #fecdca;
        background: #fff4f2;
        color: #912018;
      }

      .vcd-error strong {
        font-size: 12px;
      }

      .vcd-error p {
        margin: 4px 0 0;
        font-size: 11px;
      }

      .vcd-case-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 17px 20px;
        margin-bottom: 17px;
        background: #172033;
        color: white;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(16,24,40,.12);
      }

      .vcd-case-id span,
      .vcd-case-meta span {
        display: block;
        color: #98a2b3;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .1em;
        text-transform: uppercase;
      }

      .vcd-case-id strong {
        display: block;
        margin-top: 4px;
        font-size: 18px;
        letter-spacing: .04em;
      }

      .vcd-case-meta {
        display: flex;
        gap: 28px;
        text-align: right;
      }

      .vcd-case-meta strong {
        display: block;
        margin-top: 4px;
        font-size: 11px;
      }

      .vcd-priority.immediate {
        color: #fda29b;
      }

      .vcd-priority.priority {
        color: #fdb022;
      }

      .vcd-priority.monitor {
        color: #7ce8de;
      }

      .vcd-priority.routine {
        color: #98a2b3;
      }

      .vcd-overview-grid {
        display: grid;
        grid-template-columns: 1.25fr .75fr;
        gap: 16px;
      }

      .vcd-risk-card,
      .vcd-trend-card,
      .vcd-panel,
      .vcd-context-grid,
      .vcd-timeline,
      .vcd-quick-card {
        background: rgba(255,255,255,.96);
        border: 1px solid #e5e9f0;
        border-radius: 20px;
        box-shadow: 0 9px 32px rgba(16,24,40,.05);
      }

      .vcd-risk-card,
      .vcd-trend-card {
        padding: 24px;
      }

      .vcd-card-header,
      .vcd-section-title,
      .vcd-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .vcd-card-header h2,
      .vcd-section-title h2,
      .vcd-panel-header h2 {
        margin: 5px 0 0;
        font-size: 20px;
        letter-spacing: -.025em;
      }

      .vcd-monitoring-badge {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 10px;
        border-radius: 999px;
        background: #ecfdf3;
        color: #027a48;
        font-size: 9px;
        font-weight: 850;
      }

      .vcd-monitoring-badge span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #12b76a;
        box-shadow: 0 0 0 4px rgba(18,183,106,.12);
      }

      .vcd-risk-main {
        display: flex;
        align-items: center;
        gap: 25px;
        margin: 27px 0 23px;
      }

      .vcd-score {
        width: 125px;
        height: 125px;
        flex: 0 0 125px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #f2f4f7;
        font-size: 43px;
        font-weight: 850;
        letter-spacing: -.06em;
      }

      .vcd-score span {
        font-size: 11px;
        color: #98a2b3;
        letter-spacing: 0;
      }

      .vcd-score.low {
        color: #027a48;
        background: #ecfdf3;
      }

      .vcd-score.moderate {
        color: #b54708;
        background: #fffaeb;
      }

      .vcd-score.high {
        color: #c4320a;
        background: #fff4ed;
      }

      .vcd-score.critical {
        color: #b42318;
        background: #fef3f2;
      }

      .vcd-risk-badge {
        display: inline-flex;
        padding: 6px 10px;
        margin-bottom: 8px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 850;
      }

      .vcd-risk-badge.small {
        margin: 0;
      }

      .vcd-risk-badge.low {
        color: #027a48;
        background: #ecfdf3;
      }

      .vcd-risk-badge.moderate {
        color: #b54708;
        background: #fffaeb;
      }

      .vcd-risk-badge.high {
        color: #c4320a;
        background: #fff4ed;
      }

      .vcd-risk-badge.critical {
        color: #b42318;
        background: #fef3f2;
      }

      .vcd-risk-main h3 {
        margin: 0 0 5px;
        font-size: 16px;
      }

      .vcd-risk-main p {
        max-width: 360px;
        margin: 0;
        color: #667085;
        font-size: 11px;
        line-height: 1.6;
      }

      .vcd-risk-scale {
        height: 8px;
        overflow: hidden;
        border-radius: 99px;
        background: #eaecf0;
      }

      .vcd-risk-progress {
        height: 100%;
        border-radius: inherit;
      }

      .vcd-risk-progress.low {
        background: #12b76a;
      }

      .vcd-risk-progress.moderate {
        background: #f79009;
      }

      .vcd-risk-progress.high {
        background: #f04438;
      }

      .vcd-risk-progress.critical {
        background: #b42318;
      }

      .vcd-risk-scale-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
        color: #98a2b3;
        font-size: 8px;
        font-weight: 700;
      }

      .vcd-trend-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: #f2f4f7;
        font-size: 19px;
      }

      .vcd-trend-icon.up {
        color: #d92d20;
        background: #fff4f2;
      }

      .vcd-trend-icon.down {
        color: #039855;
        background: #ecfdf3;
      }

      .vcd-trend-number {
        margin-top: 25px;
        font-size: 48px;
        font-weight: 850;
        letter-spacing: -.06em;
      }

      .vcd-trend-label {
        font-size: 12px;
        font-weight: 850;
      }

      .vcd-trend-label.up {
        color: #d92d20;
      }

      .vcd-trend-label.down {
        color: #039855;
      }

      .vcd-trend-label.stable,
      .vcd-trend-label.neutral {
        color: #667085;
      }

      .vcd-comparison {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 20px;
        padding: 14px;
        background: #f8fafc;
        border-radius: 13px;
      }

      .vcd-comparison div:not(.vcd-arrow) {
        flex: 1;
      }

      .vcd-comparison span {
        display: block;
        color: #98a2b3;
        font-size: 9px;
        font-weight: 700;
      }

      .vcd-comparison strong {
        display: block;
        margin-top: 4px;
        font-size: 18px;
      }

      .vcd-arrow {
        color: #98a2b3;
      }

      .vcd-small-text {
        color: #667085;
        font-size: 10px;
        line-height: 1.6;
      }

      .vcd-section {
        margin-top: 24px;
      }

      .vcd-section-title {
        align-items: flex-end;
        margin-bottom: 13px;
      }

      .vcd-context-badge {
        padding: 7px 10px;
        border-radius: 999px;
        background: #eef2ff;
        color: #4338ca;
        font-size: 9px;
        font-weight: 850;
      }

      .vcd-link-btn {
        border: 0;
        background: transparent;
        color: #0f766e;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
      }

      .vcd-context-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        overflow: hidden;
      }

      .vcd-context-item {
        padding: 19px;
        background: white;
      }

      .vcd-context-item.full {
        grid-column: 1 / -1;
      }

      .vcd-context-item span {
        display: block;
        margin-bottom: 7px;
        color: #98a2b3;
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .vcd-context-item strong {
        color: #344054;
        font-size: 13px;
      }

      .vcd-context-item p {
        margin: 0;
        color: #667085;
        font-size: 11px;
        line-height: 1.65;
      }

      .vcd-prediction {
        display: flex;
        align-items: center;
        gap: 17px;
        padding: 20px;
        border: 1px solid #e5e9f0;
        border-radius: 18px;
        background: white;
        box-shadow: 0 9px 32px rgba(16,24,40,.04);
      }

      .vcd-prediction.high,
      .vcd-prediction.critical {
        border-color: #fecdca;
        background: #fffafa;
      }

      .vcd-prediction-icon {
        width: 52px;
        height: 52px;
        flex: 0 0 52px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background: #f2f4f7;
        font-size: 23px;
      }

      .vcd-prediction-content {
        flex: 1;
      }

      .vcd-prediction-content > span {
        color: #98a2b3;
        font-size: 9px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .vcd-prediction-content h3 {
        margin: 4px 0 5px;
        font-size: 15px;
      }

      .vcd-prediction-content p {
        margin: 0;
        color: #667085;
        font-size: 11px;
        line-height: 1.6;
      }

      .vcd-prediction-level {
        min-width: 85px;
        padding: 11px;
        text-align: center;
        background: #f8fafc;
        border-radius: 11px;
      }

      .vcd-prediction-level span {
        display: block;
        color: #98a2b3;
        font-size: 8px;
      }

      .vcd-prediction-level strong {
        display: block;
        margin-top: 4px;
        font-size: 11px;
      }

      .vcd-ai-note {
        display: flex;
        gap: 8px;
        margin-top: 9px;
        padding: 11px 13px;
        background: #f8fafc;
        border-radius: 11px;
      }

      .vcd-ai-note p {
        margin: 0;
        color: #667085;
        font-size: 9px;
        line-height: 1.6;
      }

      /* ------------------------------------------
         HUMAN REVIEW WORKFLOW
      ------------------------------------------ */

      .vcd-workflow-badge {
        padding: 7px 11px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: 850;
      }

      .vcd-workflow-badge.required {
        color: #b42318;
        background: #fef3f2;
        border: 1px solid #fecdca;
      }

      .vcd-workflow-badge.normal {
        color: #027a48;
        background: #ecfdf3;
        border: 1px solid #abefc6;
      }

      .vcd-workflow-card {
        background: white;
        border: 1px solid #e5e9f0;
        border-radius: 20px;
        box-shadow: 0 9px 32px rgba(16,24,40,.05);
        overflow: hidden;
      }

      .vcd-workflow-step {
        position: relative;
        display: flex;
        gap: 18px;
        padding: 22px;
        border-bottom: 1px solid #eaecf0;
      }

      .vcd-workflow-step.last {
        border-bottom: 0;
      }

      .vcd-workflow-number {
        width: 38px;
        height: 38px;
        flex: 0 0 38px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: #eef7f6;
        color: #0f766e;
        font-size: 10px;
        font-weight: 850;
      }

      .vcd-workflow-content {
        flex: 1;
      }

      .vcd-workflow-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
      }

      .vcd-workflow-top > div > span {
        color: #98a2b3;
        font-size: 8px;
        font-weight: 850;
        letter-spacing: .1em;
      }

      .vcd-workflow-top h3 {
        margin: 4px 0 0;
        font-size: 14px;
      }

      .vcd-workflow-status {
        display: inline-flex;
        padding: 6px 9px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: 850;
        white-space: nowrap;
      }

      .vcd-workflow-status.pending {
        color: #b42318;
        background: #fef3f2;
      }

      .vcd-workflow-status.not-required {
        color: #667085;
        background: #f2f4f7;
      }

      .vcd-workflow-status.support {
        color: #175cd3;
        background: #eff8ff;
      }

      .vcd-workflow-status.followup {
        color: #b54708;
        background: #fffaeb;
      }

      .vcd-workflow-content > p {
        margin: 8px 0 0;
        color: #667085;
        font-size: 10px;
        line-height: 1.65;
      }

      .vcd-workflow-meta {
        display: flex;
        align-items: center;
        gap: 9px;
        flex-wrap: wrap;
        margin-top: 13px;
        padding-top: 11px;
        border-top: 1px solid #f0f2f5;
      }

      .vcd-workflow-meta span {
        color: #98a2b3;
        font-size: 8px;
        font-weight: 750;
        text-transform: uppercase;
      }

      .vcd-workflow-meta strong {
        color: #344054;
        font-size: 9px;
        margin-right: 8px;
      }

      .vcd-recommendation-box {
        margin-top: 13px;
        padding: 13px;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #eaecf0;
      }

      .vcd-recommendation-box span,
      .vcd-support-path span {
        display: block;
        margin-bottom: 5px;
        color: #98a2b3;
        font-size: 8px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .vcd-recommendation-box p {
        margin: 0;
        color: #344054;
        font-size: 10px;
        line-height: 1.6;
      }

      .vcd-support-path {
        margin-top: 10px;
      }

      .vcd-support-path strong {
        color: #0f766e;
        font-size: 10px;
      }

      .vcd-followup-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 13px;
      }

      .vcd-alert-connection {
        display: flex;
        gap: 13px;
        margin-top: 10px;
        padding: 15px;
        border-radius: 14px;
        background: #f3fbfa;
        border: 1px solid #d9e7e5;
      }

      .vcd-alert-connection-icon {
        width: 38px;
        height: 38px;
        flex: 0 0 38px;
        display: grid;
        place-items: center;
        background: white;
        border-radius: 10px;
      }

      .vcd-alert-connection span {
        color: #0f766e;
        font-size: 8px;
        font-weight: 850;
        letter-spacing: .08em;
      }

      .vcd-alert-connection h3 {
        margin: 4px 0;
        font-size: 12px;
      }

      .vcd-alert-connection p {
        margin: 0;
        color: #667085;
        font-size: 9px;
        line-height: 1.6;
      }

      .vcd-alert-connection-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }

      .vcd-alert-connection-meta span {
        color: #98a2b3;
      }

      .vcd-alert-connection-meta strong {
        color: #344054;
        font-size: 8px;
        word-break: break-all;
        margin-right: 8px;
      }

      .vcd-two-column {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 24px;
      }

      .vcd-panel {
        padding: 22px;
      }

      .vcd-panel-icon {
        width: 39px;
        height: 39px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        background: #f2f4f7;
      }

      .vcd-safety.immediate {
        border-color: #fda29b;
      }

      .vcd-safety-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 13px;
        margin: 18px 0 12px;
        border-radius: 12px;
        background: #f8fafc;
      }

      .vcd-safety-status span {
        color: #667085;
        font-size: 10px;
      }

      .vcd-safety-status strong {
        font-size: 11px;
      }

      .vcd-safety-status.immediate strong {
        color: #b42318;
      }

      .vcd-safety-status.priority strong {
        color: #c4320a;
      }

      .vcd-safety-status.monitor strong {
        color: #b54708;
      }

      .vcd-alert-box,
      .vcd-safe-box {
        display: flex;
        gap: 10px;
        padding: 13px;
        border-radius: 12px;
      }

      .vcd-alert-box {
        background: #fff4f2;
        border: 1px solid #fecdca;
      }

      .vcd-safe-box {
        background: #ecfdf3;
        border: 1px solid #abefc6;
      }

      .vcd-alert-box strong,
      .vcd-safe-box strong {
        display: block;
        font-size: 11px;
      }

      .vcd-alert-box strong {
        color: #912018;
      }

      .vcd-safe-box strong {
        color: #027a48;
      }

      .vcd-alert-box p,
      .vcd-safe-box p {
        margin: 4px 0 0;
        font-size: 9px;
        line-height: 1.55;
        color: #667085;
      }

      .vcd-panel-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 15px;
      }

      .vcd-intervention-status {
        display: flex;
        gap: 11px;
        margin: 20px 0;
        padding: 13px;
        background: #f8fafc;
        border-radius: 12px;
      }

      .vcd-status-dot {
        width: 9px;
        height: 9px;
        flex: 0 0 9px;
        margin-top: 4px;
        border-radius: 50%;
        background: #0f766e;
        box-shadow: 0 0 0 5px rgba(15,118,110,.1);
      }

      .vcd-intervention-status strong {
        font-size: 11px;
      }

      .vcd-intervention-status p {
        margin: 4px 0 0;
        color: #667085;
        font-size: 9px;
        line-height: 1.6;
      }

      .vcd-intervention-list {
        display: grid;
        gap: 8px;
        margin-bottom: 15px;
      }

      .vcd-intervention-list > div {
        display: grid;
        grid-template-columns: 30px 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 9px;
        border-bottom: 1px solid #eaecf0;
      }

      .vcd-intervention-list span {
        color: #98a2b3;
        font-size: 9px;
        font-weight: 850;
      }

      .vcd-intervention-list p {
        margin: 0;
        color: #667085;
        font-size: 10px;
      }

      .vcd-intervention-list strong {
        font-size: 9px;
      }

      .vcd-full-btn {
        width: 100%;
      }

      .vcd-timeline {
        padding: 20px 23px;
      }

      .vcd-timeline-item {
        position: relative;
        display: flex;
        gap: 15px;
        padding-bottom: 18px;
      }

      .vcd-timeline-item:last-child {
        padding-bottom: 0;
      }

      .vcd-timeline-item:not(:last-child)::after {
        content: "";
        position: absolute;
        left: 7px;
        top: 16px;
        bottom: 0;
        width: 1px;
        background: #d9dee8;
      }

      .vcd-timeline-dot {
        position: relative;
        z-index: 1;
        width: 15px;
        height: 15px;
        flex: 0 0 15px;
        margin-top: 2px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 1px #d9dee8;
      }

      .vcd-timeline-dot.low {
        background: #12b76a;
      }

      .vcd-timeline-dot.moderate {
        background: #f79009;
      }

      .vcd-timeline-dot.high {
        background: #f04438;
      }

      .vcd-timeline-dot.critical {
        background: #b42318;
      }

      .vcd-timeline-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        gap: 15px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eaecf0;
      }

      .vcd-timeline-item:last-child .vcd-timeline-content {
        border-bottom: 0;
      }

      .vcd-timeline-date {
        color: #98a2b3;
        font-size: 9px;
      }

      .vcd-timeline-content h3 {
        margin: 4px 0 0;
        font-size: 12px;
      }

      .vcd-timeline-alert {
        display: inline-flex;
        margin-top: 6px;
        padding: 4px 7px;
        border-radius: 999px;
        color: #b42318;
        background: #fef3f2;
        font-size: 8px;
        font-weight: 800;
      }

      .vcd-timeline-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .vcd-timeline-right > strong {
        font-size: 12px;
      }

      .vcd-timeline-trend {
        font-size: 9px;
        font-weight: 750;
      }

      .vcd-timeline-trend.up {
        color: #d92d20;
      }

      .vcd-timeline-trend.down {
        color: #039855;
      }

      .vcd-timeline-trend.stable,
      .vcd-timeline-trend.neutral {
        color: #667085;
      }

      .vcd-quick-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .vcd-quick-card {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 16px;
        text-align: left;
        cursor: pointer;
        transition: .2s ease;
      }

      .vcd-quick-card:hover {
        transform: translateY(-2px);
        border-color: #0f766e;
      }

      .vcd-quick-card > span {
        width: 38px;
        height: 38px;
        flex: 0 0 38px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        background: #f2f4f7;
        font-size: 18px;
      }

      .vcd-quick-card div {
        flex: 1;
      }

      .vcd-quick-card strong {
        display: block;
        font-size: 10px;
      }

      .vcd-quick-card p {
        margin: 4px 0 0;
        color: #98a2b3;
        font-size: 8px;
        line-height: 1.5;
      }

      .vcd-quick-card b {
        color: #98a2b3;
      }

      .vcd-responsible {
        display: flex;
        gap: 14px;
        margin-top: 24px;
        padding: 19px;
        border: 1px solid #d9e7e5;
        background: #f3fbfa;
        border-radius: 17px;
      }

      .vcd-responsible-icon {
        width: 41px;
        height: 41px;
        flex: 0 0 41px;
        display: grid;
        place-items: center;
        background: white;
        border-radius: 11px;
        font-size: 19px;
      }

      .vcd-responsible span {
        color: #0f766e;
        font-size: 8px;
        font-weight: 850;
        letter-spacing: .1em;
      }

      .vcd-responsible h3 {
        margin: 4px 0 5px;
        font-size: 13px;
      }

      .vcd-responsible p {
        margin: 0;
        color: #667085;
        font-size: 9px;
        line-height: 1.6;
      }

      .vcd-loading,
      .vcd-login-card,
      .vcd-empty {
        max-width: 540px;
        margin: 90px auto;
        padding: 40px;
        text-align: center;
        background: white;
        border: 1px solid #e5e9f0;
        border-radius: 22px;
        box-shadow: 0 15px 45px rgba(16,24,40,.07);
      }

      .vcd-spinner {
        width: 38px;
        height: 38px;
        margin: 0 auto 15px;
        border: 4px solid #dcefeb;
        border-top-color: #0f766e;
        border-radius: 50%;
        animation: vcdSpin .8s linear infinite;
      }

      @keyframes vcdSpin {
        to {
          transform: rotate(360deg);
        }
      }

      .vcd-loading p {
        color: #667085;
        font-size: 12px;
      }

      .vcd-login-icon,
      .vcd-empty-icon {
        width: 62px;
        height: 62px;
        display: grid;
        place-items: center;
        margin: 0 auto 17px;
        border-radius: 17px;
        background: #f2f4f7;
        font-size: 27px;
      }

      .vcd-login-card h1,
      .vcd-empty h2 {
        margin: 0 0 8px;
        font-size: 24px;
      }

      .vcd-login-card p,
      .vcd-empty p {
        margin: 0 auto 20px;
        color: #667085;
        font-size: 12px;
        line-height: 1.7;
      }

      @media (max-width: 1000px) {
        .vcd-overview-grid,
        .vcd-two-column {
          grid-template-columns: 1fr;
        }

        .vcd-quick-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .vcd-header {
          flex-direction: column;
        }

        .vcd-header-actions {
          justify-content: flex-start;
        }
      }

      @media (max-width: 700px) {
        .vcd-page {
          padding: 22px 12px 50px;
        }

        .vcd-case-bar {
          flex-direction: column;
          align-items: flex-start;
        }

        .vcd-case-meta {
          width: 100%;
          justify-content: space-between;
          gap: 10px;
          text-align: left;
        }

        .vcd-context-grid {
          grid-template-columns: 1fr;
        }

        .vcd-context-item.full {
          grid-column: auto;
        }

        .vcd-risk-main {
          flex-direction: column;
          text-align: center;
        }

        .vcd-risk-main p {
          margin: 0 auto;
        }

        .vcd-prediction {
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .vcd-prediction-level {
          margin-left: 69px;
        }

        .vcd-timeline-content {
          flex-direction: column;
        }

        .vcd-timeline-right {
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .vcd-quick-grid {
          grid-template-columns: 1fr;
        }

        .vcd-panel-actions {
          flex-direction: column;
        }

        .vcd-panel-actions button {
          width: 100%;
        }

        .vcd-workflow-top {
          flex-direction: column;
        }

        .vcd-workflow-meta {
          align-items: flex-start;
        }

        .vcd-followup-actions {
          flex-direction: column;
        }

        .vcd-followup-actions button {
          width: 100%;
        }

        .vcd-alert-connection {
          align-items: flex-start;
        }
      }
    `}</style>
  );
}