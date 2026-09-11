import React, { useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

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

export default function Assessment() {
  const [activeSection, setActiveSection] = useState(null);
  const [scstForm, setScstForm] = useState(initialScstForm);
  const [personalForm, setPersonalForm] = useState(initialPersonalForm);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scstSubmitted, setScstSubmitted] = useState(false);
  const [monitoringRecord, setMonitoringRecord] = useState(null);

  /* =========================
     RISK HELPERS
  ========================= */

  const getDistressBand = (score) => {
    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) return "Unknown";

    if (numericScore <= 30) return "Low";
    if (numericScore <= 60) return "Moderate";
    if (numericScore <= 85) return "High";

    return "Critical";
  };

  const getTrend = (previousScore, currentScore) => {
    if (
      previousScore === null ||
      previousScore === undefined ||
      Number.isNaN(Number(previousScore))
    ) {
      return {
        label: "Baseline",
        direction: "baseline",
        change: null,
        description: "No previous assessment is available for comparison.",
      };
    }

    const previous = Number(previousScore);
    const current = Number(currentScore);
    const change = current - previous;

    if (change >= 5) {
      return {
        label: "Worsening",
        direction: "up",
        change,
        description:
          "The current distress score is higher than the previous assessment.",
      };
    }

    if (change <= -5) {
      return {
        label: "Improving",
        direction: "down",
        change,
        description:
          "The current distress score is lower than the previous assessment.",
      };
    }

    return {
      label: "Stable",
      direction: "stable",
      change,
      description:
        "The current distress score is relatively close to the previous assessment.",
    };
  };

  const getPrediction = (score, trend, emergency) => {
    const numericScore = Number(score);

    if (emergency || numericScore >= 86) {
      return {
        level: "Critical Monitoring Priority",
        message:
          "Current indicators suggest that immediate human review and appropriate safety/support pathways should be considered.",
      };
    }

    if (trend.label === "Worsening" && numericScore >= 61) {
      return {
        level: "Elevated Escalation Risk",
        message:
          "The distress level is elevated and the recent trend is worsening. Closer human follow-up is recommended.",
      };
    }

    if (trend.label === "Worsening") {
      return {
        level: "Possible Escalation",
        message:
          "The recent distress trend is worsening. Continued monitoring and support follow-up are recommended.",
      };
    }

    if (numericScore >= 61) {
      return {
        level: "High Monitoring Priority",
        message:
          "The current distress level is elevated. Timely human review and closer follow-up are recommended.",
      };
    }

    if (numericScore >= 31) {
      return {
        level: "Continued Monitoring",
        message:
          "Periodic reassessment and appropriate support follow-up are recommended.",
      };
    }

    return {
      level: "Routine Monitoring",
      message:
        "Continue periodic monitoring and use available support resources when needed.",
    };
  };

  /* =========================
     SUPPORT / REVIEW WORKFLOW
  ========================= */

  const getSupportRecommendation = ({
    riskBand,
    safetyFlag,
    safetyPriority,
  }) => {
    if (safetyFlag || riskBand === "Critical") {
      return {
        reviewRequired: true,
        reviewStatus: "Pending",
        supportRecommendation:
          "Immediate human review and appropriate safety/support pathway should be considered.",
        supportPath: safetyFlag
          ? "Protection Support / Emergency Support"
          : "Emergency Support / Psychologist",
        followUpRequired: true,
        followUpStatus: "Pending",
        priority:
          safetyPriority ||
          (riskBand === "Critical" ? "Critical" : "High"),
      };
    }

    if (riskBand === "High") {
      return {
        reviewRequired: true,
        reviewStatus: "Pending",
        supportRecommendation:
          "Timely human review and closer support follow-up are recommended.",
        supportPath: "Psychologist / Protection Support",
        followUpRequired: true,
        followUpStatus: "Pending",
        priority: safetyPriority || "High",
      };
    }

    if (riskBand === "Moderate") {
      return {
        reviewRequired: true,
        reviewStatus: "Pending",
        supportRecommendation:
          "Support review and periodic follow-up are recommended.",
        supportPath: "Psychologist / Mentorship",
        followUpRequired: true,
        followUpStatus: "Pending",
        priority: safetyPriority || "Moderate",
      };
    }

    return {
      reviewRequired: false,
      reviewStatus: "Not Required",
      supportRecommendation: "Continue periodic monitoring.",
      supportPath: "Routine Monitoring",
      followUpRequired: true,
      followUpStatus: "Scheduled",
      priority: safetyPriority || "Normal",
    };
  };

  /* =========================
     PREVIOUS ASSESSMENT
  ========================= */

  const getPreviousAssessment = async (userId) => {
    if (!userId) return null;

    try {
      const q = query(
        collection(db, "distressAssessments"),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const assessments = snapshot.docs.map((doc) => {
        const data = doc.data();

        let createdTime = 0;

        if (data.createdAt?.toMillis) {
          createdTime = data.createdAt.toMillis();
        } else if (data.createdAt?.seconds) {
          createdTime = data.createdAt.seconds * 1000;
        } else if (data.timestamp) {
          createdTime = new Date(data.timestamp).getTime();
        }

        return {
          id: doc.id,
          ...data,
          _createdTime: createdTime,
        };
      });

      assessments.sort(
        (a, b) => Number(b._createdTime) - Number(a._createdTime)
      );

      return assessments[0] || null;
    } catch (err) {
      console.error("Previous assessment error:", err);
      return null;
    }
  };

  /* =========================
     CREATE ALERT
  ========================= */

  const createRiskAlert = async ({
    userId,
    assessmentId,
    score,
    riskBand,
    safetyFlag,
    safetyPriority,
    reason,
    recommendedAction,
    supportRecommendation,
  }) => {
    if (!userId) return null;

    try {
      const alertType =
        riskBand === "Critical"
          ? "CRITICAL_RISK"
          : riskBand === "High"
          ? "HIGH_RISK"
          : safetyFlag
          ? "SAFETY_ALERT"
          : "MONITORING_ALERT";

      const reviewRequired =
        riskBand === "High" ||
        riskBand === "Critical" ||
        safetyFlag;

      const followUpRequired =
        riskBand !== "Low" || safetyFlag;

      const alertRef = await addDoc(collection(db, "alerts"), {
        userId,
        assessmentId: assessmentId || null,

        score: Number(score),
        riskLevel: riskBand,

        alertType,

        safetyFlag: Boolean(safetyFlag),
        safetyPriority: safetyPriority || "Normal",

        reason:
          reason ||
          "Assessment result requires monitoring/review.",

        recommendedAction:
          recommendedAction ||
          "Human review and appropriate support follow-up.",

        /* =========================
           HUMAN REVIEW WORKFLOW
        ========================= */

        reviewRequired,
        reviewStatus: reviewRequired ? "Pending" : "Not Required",

        /* =========================
           SUPPORT RECOMMENDATION
        ========================= */

        supportRecommendation:
          supportRecommendation ||
          recommendedAction ||
          "Continue periodic monitoring.",

        supportStatus: reviewRequired ? "Recommended" : "Routine",

        /* =========================
           FOLLOW-UP WORKFLOW
        ========================= */

        followUpRequired,
        followUpStatus: followUpRequired
          ? "Pending"
          : "Not Required",

        status: "New",

        createdAt: serverTimestamp(),

        reviewedBy: null,
        reviewedAt: null,

        supportProvidedBy: null,
        supportProvidedAt: null,

        followUpCompletedAt: null,
      });

      console.log("Risk alert created:", alertRef.id);

      return alertRef.id;
    } catch (err) {
      console.error("Risk alert creation error:", err);
      return null;
    }
  };

  /* =========================
     DYNAMIC MONITORING
  ========================= */

  const createDynamicMonitoringRecord = async ({
    normalizedResult,
    assessmentType,
    incidentContext = {},
  }) => {
    const numericScore = Number(normalizedResult.score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      return null;
    }

    const user = auth.currentUser;

    /* =========================
       NOT LOGGED IN
    ========================= */

    if (!user) {
      const riskBand = getDistressBand(numericScore);

      const emergency =
        normalizedResult.emergency === true ||
        String(normalizedResult.stage || "").toLowerCase().includes("critical");

      const trend = getTrend(null, numericScore);

      const prediction = getPrediction(
        numericScore,
        trend,
        emergency
      );

      const safetyFlag = false;

      const safetyPriority =
        riskBand === "Critical"
          ? "Critical"
          : riskBand === "High"
          ? "High"
          : riskBand === "Moderate"
          ? "Moderate"
          : "Normal";

      const workflow = getSupportRecommendation({
        riskBand,
        safetyFlag,
        safetyPriority,
      });

      const localRecord = {
        id: null,
        score: numericScore,
        riskBand,
        previousScore: null,
        scoreChange: null,

        trend: trend.label,
        trendDirection: trend.direction,
        trendDescription: trend.description,

        predictionLevel: prediction.level,
        predictionMessage: prediction.message,

        emergency,
        safetyFlag,
        safetyPriority,

        alertId: null,

        reviewRequired: workflow.reviewRequired,
        reviewStatus: workflow.reviewStatus,

        supportRecommendation:
          workflow.supportRecommendation,

        supportPath: workflow.supportPath,
        supportStatus: workflow.reviewRequired
          ? "Recommended"
          : "Routine",

        followUpRequired: workflow.followUpRequired,
        followUpStatus: workflow.followUpStatus,

        savedToFirebase: false,
      };

      setMonitoringRecord(localRecord);

      return localRecord;
    }

    try {
      const previousAssessment =
        await getPreviousAssessment(user.uid);

      const previousScore =
        previousAssessment &&
        previousAssessment.score !== undefined
          ? Number(previousAssessment.score)
          : null;

      const trend = getTrend(
        previousScore,
        numericScore
      );

      const emergency =
        normalizedResult.emergency === true ||
        String(normalizedResult.stage || "")
          .toLowerCase()
          .includes("critical");

      const riskBand = getDistressBand(numericScore);

      /* =========================
         SAFETY FLAG
      ========================= */

      const safetyFlag =
        incidentContext.facingThreat === "Yes" &&
        incidentContext.feelsUnsafe === "Yes";

      let safetyPriority = "Normal";

      if (safetyFlag && riskBand === "Critical") {
        safetyPriority = "Critical";
      } else if (
        safetyFlag &&
        (riskBand === "High" || riskBand === "Moderate")
      ) {
        safetyPriority = "High";
      } else if (safetyFlag) {
        safetyPriority = "High";
      } else if (riskBand === "Critical") {
        safetyPriority = "Critical";
      } else if (riskBand === "High") {
        safetyPriority = "High";
      } else if (riskBand === "Moderate") {
        safetyPriority = "Moderate";
      }

      const prediction = getPrediction(
        numericScore,
        trend,
        emergency || safetyFlag
      );

      /* =========================
         SUPPORT WORKFLOW
      ========================= */

      const workflow = getSupportRecommendation({
        riskBand,
        safetyFlag,
        safetyPriority,
      });

      let recommendedAction =
        "Continue periodic monitoring.";

      if (riskBand === "Moderate") {
        recommendedAction =
          "Consider follow-up monitoring and appropriate support review.";
      }

      if (riskBand === "High") {
        recommendedAction =
          "Human review, timely support and closer follow-up are recommended.";
      }

      if (riskBand === "Critical") {
        recommendedAction =
          "Immediate human review and appropriate safety/support pathways should be considered.";
      }

      if (safetyFlag) {
        recommendedAction =
          "Safety concern detected. Consider immediate human review and appropriate protection/support pathway.";
      }

      const reasonParts = [
        `Current distress score: ${numericScore}/100.`,
        `Risk level: ${riskBand}.`,
      ];

      if (previousScore !== null) {
        reasonParts.push(
          `Previous score: ${previousScore}/100.`
        );

        if (trend.change !== null) {
          const sign = trend.change > 0 ? "+" : "";
          reasonParts.push(
            `Change: ${sign}${trend.change}.`
          );
        }

        reasonParts.push(
          `Trend: ${trend.label}.`
        );
      }

      if (incidentContext.facingThreat === "Yes") {
        reasonParts.push("User reported facing a threat.");
      }

      if (incidentContext.feelsUnsafe === "Yes") {
        reasonParts.push(
          "User reported feeling unsafe."
        );
      }

      const assessmentRef = await addDoc(
        collection(db, "distressAssessments"),
        {
          userId: user.uid,

          assessmentType,

          score: numericScore,
          riskBand,

          stage:
            normalizedResult.stage || riskBand,

          previousScore,

          previousAssessmentId:
            previousAssessment?.id || null,

          scoreChange: trend.change,

          trend: trend.label,
          trendDirection: trend.direction,
          trendDescription: trend.description,

          predictionLevel: prediction.level,
          predictionMessage: prediction.message,

          emergency,

          safetyFlag,
          safetyPriority,

          incidentContext,

          summary:
            normalizedResult.summary || "",

          indicators:
            normalizedResult.indicators || [],

          professional:
            normalizedResult.professional || [],

          recommendedActions:
            normalizedResult.doNow || [],

          avoid:
            normalizedResult.avoid || [],

          supportOptions:
            normalizedResult.support || [],

          /* =========================
             HUMAN REVIEW
          ========================= */

          reviewRequired:
            workflow.reviewRequired,

          reviewStatus:
            workflow.reviewStatus,

          /* =========================
             SUPPORT
          ========================= */

          supportRecommendation:
            workflow.supportRecommendation,

          supportPath:
            workflow.supportPath,

          supportStatus:
            workflow.reviewRequired
              ? "Recommended"
              : "Routine",

          /* =========================
             FOLLOW-UP
          ========================= */

          followUpRequired:
            workflow.followUpRequired,

          followUpStatus:
            workflow.followUpStatus,

          createdAt: serverTimestamp(),

          source: "SWASTPROVA Assessment",

          monitoringType:
            "PS-94 Dynamic Distress Monitoring",
        }
      );

      let alertId = null;

      if (
        riskBand === "High" ||
        riskBand === "Critical" ||
        safetyFlag
      ) {
        alertId = await createRiskAlert({
          userId: user.uid,

          assessmentId:
            assessmentRef.id,

          score: numericScore,

          riskBand,

          safetyFlag,

          safetyPriority,

          reason: reasonParts.join(" "),

          recommendedAction,

          supportRecommendation:
            workflow.supportRecommendation,
        });
      }

      const finalRecord = {
        id: assessmentRef.id,

        score: numericScore,
        riskBand,

        previousScore,

        scoreChange: trend.change,

        trend: trend.label,
        trendDirection: trend.direction,
        trendDescription: trend.description,

        predictionLevel: prediction.level,
        predictionMessage: prediction.message,

        emergency,

        safetyFlag,
        safetyPriority,

        alertId,

        /* =========================
           HUMAN REVIEW
        ========================= */

        reviewRequired:
          workflow.reviewRequired,

        reviewStatus:
          workflow.reviewStatus,

        /* =========================
           SUPPORT
        ========================= */

        supportRecommendation:
          workflow.supportRecommendation,

        supportPath:
          workflow.supportPath,

        supportStatus:
          workflow.reviewRequired
            ? "Recommended"
            : "Routine",

        /* =========================
           FOLLOW-UP
        ========================= */

        followUpRequired:
          workflow.followUpRequired,

        followUpStatus:
          workflow.followUpStatus,

        savedToFirebase: true,
      };

      setMonitoringRecord(finalRecord);

      return finalRecord;
    } catch (err) {
      console.error(
        "Dynamic monitoring error:",
        err
      );

      return null;
    }
  };

  /* =========================
     FORM HANDLERS
  ========================= */

  const handleScstChange = (e) => {
    const { name, value } = e.target;

    setScstForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;

    setPersonalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openSection = (section) => {
    setActiveSection(section);
    setResult(null);
    setMonitoringRecord(null);
    setError("");
  };

  const closeAssessment = () => {
    setActiveSection(null);
    setResult(null);
    setMonitoringRecord(null);
    setError("");
  };

  /* =========================
     SC/ST SUBMIT
  ========================= */

  const submitScstAssessment = async (e) => {
    e.preventDefault();

    setError("");

    if (!scstForm.relatedIncident) {
      setError(
        "Please select whether the situation is related to an incident."
      );
      return;
    }

    if (
      scstForm.relatedIncident === "Yes" &&
      !scstForm.incidentType
    ) {
      setError("Please select the incident type.");
      return;
    }

    if (!scstForm.facingThreat) {
      setError(
        "Please select whether you are facing any threat."
      );
      return;
    }

    if (!scstForm.feelsUnsafe) {
      setError(
        "Please select whether you currently feel unsafe."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/assessment/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            assessmentType: "scst",

            relatedIncident:
              scstForm.relatedIncident,

            incidentType:
              scstForm.incidentType,

            facingThreat:
              scstForm.facingThreat,

            feelsUnsafe:
              scstForm.feelsUnsafe,

            description:
              scstForm.description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Assessment failed."
        );
      }

      setResult(data);
      setScstSubmitted(true);

      const normalized = normalizeResult(data);

      await createDynamicMonitoringRecord({
        normalizedResult: normalized,

        assessmentType: "SC/ST Incident Assessment",

        incidentContext: {
          relatedIncident:
            scstForm.relatedIncident,

          incidentType:
            scstForm.incidentType,

          facingThreat:
            scstForm.facingThreat,

          feelsUnsafe:
            scstForm.feelsUnsafe,
        },
      });
    } catch (err) {
      console.error(
        "SC/ST assessment error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete the assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PERSONAL SUBMIT
  ========================= */

  const submitPersonalAssessment = async (e) => {
    e.preventDefault();

    setError("");

    const text =
      personalForm.situation.trim();

    if (!text) {
      setError(
        "Please describe your current situation."
      );
      return;
    }

    if (text.length < 30) {
      setError(
        "Please provide a little more detail so the assessment can be meaningful."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/assessment/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            assessmentType: "personal",

            text,

            situation: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Assessment failed."
        );
      }

      setResult(data);

      const normalized = normalizeResult(data);

      await createDynamicMonitoringRecord({
        normalizedResult: normalized,

        assessmentType:
          "Personal Distress Assessment",

        incidentContext: {
          situationProvided: true,
        },
      });
    } catch (err) {
      console.error(
        "Personal assessment error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete the assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESULT HELPERS
  ========================= */

  const getRiskClass = (risk) => {
    switch (String(risk).toLowerCase()) {
      case "low":
        return "risk-low";

      case "moderate":
        return "risk-moderate";

      case "high":
        return "risk-high";

      case "critical":
        return "risk-critical";

      default:
        return "risk-unknown";
    }
  };

  const getDynamicRiskClass = (risk) => {
    switch (String(risk).toLowerCase()) {
      case "low":
        return "dynamic-low";

      case "moderate":
        return "dynamic-moderate";

      case "high":
        return "dynamic-high";

      case "critical":
        return "dynamic-critical";

      default:
        return "dynamic-unknown";
    }
  };

  const getTrendClass = (trend) => {
    switch (trend) {
      case "Worsening":
        return "trend-worsening";

      case "Improving":
        return "trend-improving";

      case "Stable":
        return "trend-stable";

      default:
        return "trend-baseline";
    }
  };

  const getValue = (obj, keys, fallback = "") => {
    for (const key of keys) {
      if (
        obj &&
        obj[key] !== undefined &&
        obj[key] !== null
      ) {
        return obj[key];
      }
    }

    return fallback;
  };

  const getArray = (obj, keys) => {
    for (const key of keys) {
      if (Array.isArray(obj?.[key])) {
        return obj[key];
      }
    }

    return [];
  };

  /* =========================
     NORMALIZE API RESULT
  ========================= */

  const normalizeResult = (apiResult) => {
    const source =
      apiResult?.result ||
      apiResult?.analysis ||
      apiResult?.data ||
      apiResult ||
      {};

    const rawScore = getValue(
      source,
      [
        "distressScore",
        "distress_score",
        "score",
        "mentalHealthScore",
      ],
      0
    );

    const numericScore = Number(rawScore);

    const score = Number.isNaN(numericScore)
      ? 0
      : Math.max(
          0,
          Math.min(100, numericScore)
        );

    const stage = getValue(
      source,
      [
        "stage",
        "riskLevel",
        "risk_level",
        "severity",
        "distressLevel",
      ],
      getDistressBand(score)
    );

    const summary = getValue(
      source,
      ["summary", "message", "overview"],
      ""
    );

    const emergency =
      Boolean(
        getValue(
          source,
          [
            "emergency",
            "emergencyFlag",
            "emergency_flag",
            "urgent",
          ],
          false
        )
      ) ||
      String(stage)
        .toLowerCase()
        .includes("critical");

    return {
      score,

      stage,

      summary,

      indicators: getArray(source, [
        "indicators",
        "riskIndicators",
        "signs",
      ]),

      professional: getArray(source, [
        "professional",
        "professionalSupport",
        "professionalRecommendations",
      ]),

      doNow: getArray(source, [
        "doNow",
        "actions",
        "recommendedActions",
        "immediateActions",
      ]),

      avoid: getArray(source, [
        "avoid",
        "thingsToAvoid",
      ]),

      support: getArray(source, [
        "support",
        "supportOptions",
        "resources",
      ]),

      emergency,
    };
  };

  /* =========================
     NAVIGATION
  ========================= */

  const goToPage = (path) => {
    window.location.href = path;
  };

  /* =========================
     DYNAMIC MONITORING UI
  ========================= */

  const renderDynamicMonitoring = () => {
    if (!monitoringRecord) return null;

    const {
      score,
      riskBand,
      previousScore,
      scoreChange,
      trend,
      trendDescription,
      predictionLevel,
      predictionMessage,
      safetyFlag,
      safetyPriority,
      savedToFirebase,
      alertId,

      reviewRequired,
      reviewStatus,

      supportRecommendation,
      supportPath,
      supportStatus,

      followUpRequired,
      followUpStatus,
    } = monitoringRecord;

    const isHighOrCritical =
      riskBand === "High" ||
      riskBand === "Critical";

    const isCritical =
      riskBand === "Critical";

    return (
      <div
        className={`dynamic-monitoring-card ${
          isCritical
            ? "dynamic-critical-card"
            : isHighOrCritical
            ? "dynamic-high-card"
            : ""
        }`}
      >
        <div className="dynamic-header">
          <div>
            <div className="small-label">
              PS-94
            </div>

            <h3>
              Dynamic Distress Monitoring
            </h3>

            <p>
              Current assessment is compared
              with previous assessment data to
              monitor distress trends and
              escalation risk.
            </p>
          </div>

          <div
            className={`dynamic-risk-badge ${getDynamicRiskClass(
              riskBand
            )}`}
          >
            {riskBand}
          </div>
        </div>

        {isHighOrCritical && (
          <div
            className={`risk-alert-banner ${
              isCritical
                ? "risk-alert-critical"
                : ""
            }`}
          >
            <strong>
              {isCritical
                ? "Critical Risk Alert"
                : "High Risk Alert"}
            </strong>

            <p>
              {isCritical
                ? "Immediate human review and appropriate safety/support pathways should be considered."
                : "Timely human review and closer follow-up may be appropriate."}
            </p>
          </div>
        )}

        {safetyFlag && (
          <div className="safety-alert-banner">
            <strong>
              Safety Concern Detected
            </strong>

            <p>
              The assessment indicates that
              the user reported facing a threat
              and feeling unsafe. This increases
              the support priority without
              changing the numerical distress
              score.
            </p>

            <span>
              Safety Priority:{" "}
              <b>{safetyPriority}</b>
            </span>
          </div>
        )}

        <div className="monitoring-score-grid">
          <div className="monitoring-score-box">
            <span>Current Score</span>
            <strong>{score}/100</strong>
          </div>

          <div className="monitoring-score-box">
            <span>Previous Score</span>
            <strong>
              {previousScore !== null &&
              previousScore !== undefined
                ? `${previousScore}/100`
                : "Baseline"}
            </strong>
          </div>

          <div className="monitoring-score-box">
            <span>Score Change</span>
            <strong>
              {scoreChange === null ||
              scoreChange === undefined
                ? "—"
                : scoreChange > 0
                ? `+${scoreChange}`
                : scoreChange}
            </strong>
          </div>
        </div>

        <div className="monitoring-info-grid">
          <div className="monitoring-info-box">
            <span>Trend</span>

            <div
              className={`trend-badge ${getTrendClass(
                trend
              )}`}
            >
              {trend}
            </div>

            <p>
              {trendDescription}
            </p>
          </div>

          <div className="monitoring-info-box">
            <span>
              Dynamic Prediction
            </span>

            <strong>
              {predictionLevel}
            </strong>

            <p>
              {predictionMessage}
            </p>
          </div>
        </div>

        {/* =========================
            HUMAN REVIEW + SUPPORT
        ========================= */}

        <div className="review-support-card">
          <div className="review-support-header">
            <div>
              <span className="small-label">
                RESPONSE WORKFLOW
              </span>

              <h4>
                Human Review & Support Pathway
              </h4>
            </div>

            <span
              className={`workflow-status ${
                reviewStatus === "Pending"
                  ? "workflow-pending"
                  : "workflow-normal"
              }`}
            >
              {reviewStatus}
            </span>
          </div>

          <div className="workflow-grid">
            <div className="workflow-item">
              <span>
                Human Review
              </span>

              <strong>
                {reviewRequired
                  ? "Required"
                  : "Not Required"}
              </strong>
            </div>

            <div className="workflow-item">
              <span>
                Review Status
              </span>

              <strong>
                {reviewStatus}
              </strong>
            </div>

            <div className="workflow-item">
              <span>
                Priority
              </span>

              <strong>
                {safetyPriority || "Normal"}
              </strong>
            </div>

            <div className="workflow-item">
              <span>
                Follow-up
              </span>

              <strong>
                {followUpRequired
                  ? followUpStatus
                  : "Not Required"}
              </strong>
            </div>
          </div>

          <div className="recommendation-box">
            <span>
              Recommended Support
            </span>

            <p>
              {supportRecommendation ||
                "Continue periodic monitoring."}
            </p>
          </div>

          <div className="support-path-box">
            <span>
              Suggested Support Path
            </span>

            <strong>
              {supportPath ||
                "Routine Monitoring"}
            </strong>

            <small>
              Support status:{" "}
              {supportStatus || "Routine"}
            </small>
          </div>

          <div className="workflow-note">
            <strong>
              Workflow Note:
            </strong>{" "}
            This alert is marked for human
            review. SWASTPROVA does not
            automatically assign a human
            reviewer or provide a medical
            diagnosis.
          </div>

          {alertId && (
            <div className="alert-reference">
              Alert created and linked with
              this assessment.
            </div>
          )}
        </div>

        {savedToFirebase ? (
          <div className="firebase-success">
            ✓ Dynamic monitoring record,
            review workflow and follow-up
            status saved to Firebase.
          </div>
        ) : (
          <div className="firebase-note">
            Login is required to permanently
            save monitoring history and alerts.
          </div>
        )}

        <div className="monitoring-disclaimer">
          <strong>
            Monitoring only:
          </strong>{" "}
          This score is intended for
          screening, monitoring and support
          prioritization. It is not a medical
          diagnosis.
        </div>
      </div>
    );
  };

  /* =========================
     SUPPORT ACTIONS
  ========================= */

  const renderSupportActions = () => {
    if (!monitoringRecord) return null;

    const {
      riskBand,
      safetyFlag,
      reviewRequired,
      supportRecommendation,
      followUpRequired,
    } = monitoringRecord;

    const needsPrioritySupport =
      riskBand === "High" ||
      riskBand === "Critical" ||
      safetyFlag;

    if (!needsPrioritySupport) {
      return (
        <div className="support-actions-card">
          <div>
            <span className="small-label">
              NEXT STEP
            </span>

            <h3>
              Continue Monitoring
            </h3>

            <p>
              Your current result does not
              indicate a priority safety
              alert. Periodic monitoring and
              support remain available.
            </p>
          </div>

          <div className="support-button-grid">
            <button
              type="button"
              className="support-button outline"
              onClick={() =>
                goToPage("/progress")
              }
            >
              View Progress
            </button>

            <button
              type="button"
              className="support-button psychologist"
              onClick={() =>
                goToPage("/psychologists")
              }
            >
              Talk to Psychologist
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`support-actions-card ${
          riskBand === "Critical"
            ? "support-critical"
            : "support-high"
        }`}
      >
        <div>
          <span className="small-label">
            HUMAN SUPPORT PATHWAY
          </span>

          <h3>
            {riskBand === "Critical"
              ? "Immediate Human Support"
              : "Timely Human Support"}
          </h3>

          <p>
            {supportRecommendation ||
              "Human review and appropriate support follow-up are recommended."}
          </p>
        </div>

        <div className="support-button-grid">
          <button
            type="button"
            className="support-button psychologist"
            onClick={() =>
              goToPage("/psychologists")
            }
          >
            Talk to Psychologist
          </button>

          <button
            type="button"
            className="support-button support"
            onClick={() =>
              goToPage("/emergency-support")
            }
          >
            Get Support
          </button>

          {(riskBand === "High" ||
            riskBand === "Critical" ||
            safetyFlag) && (
            <button
              type="button"
              className="support-button protection"
              onClick={() =>
                goToPage("/protection-support")
              }
            >
              Protection Support
            </button>
          )}

          {riskBand === "Critical" && (
            <button
              type="button"
              className="support-button emergency"
              onClick={() =>
                goToPage("/emergency-support")
              }
            >
              Emergency Support
            </button>
          )}

          <button
            type="button"
            className="support-button outline"
            onClick={() =>
              goToPage("/progress")
            }
          >
            View Progress
          </button>
        </div>

        {followUpRequired && (
          <div className="follow-up-note">
            ✓ Follow-up monitoring is required
            and can be compared with future
            assessments.
          </div>
        )}
      </div>
    );
  };

  /* =========================
     RESULT
  ========================= */

  const renderResult = () => {
    if (!result) return null;

    const normalized =
      normalizeResult(result);

    const dynamicRiskBand =
      getDistressBand(
        normalized.score
      );

    const isEmergency =
      normalized.emergency ||
      dynamicRiskBand === "Critical" ||
      String(normalized.stage)
        .toLowerCase()
        .includes("critical");

    return (
      <div className="result-section">
        <div className="result-header">
          <span className="small-label">
            ASSESSMENT RESULT
          </span>

          <h2>
            Your Current Assessment
          </h2>

          <p>
            This result is intended for
            screening and support
            prioritization.
          </p>
        </div>

        {isEmergency && (
          <div className="urgent-box">
            <strong>
              Priority Support Recommended
            </strong>

            <p>
              The current indicators suggest
              that timely human review and
              appropriate support pathways
              should be considered.
            </p>

            <button
              type="button"
              onClick={() =>
                goToPage("/emergency-support")
              }
            >
              Open Support Options
            </button>
          </div>
        )}

        <div className="score-card">
          <div>
            <span>
              Distress Score
            </span>

            <strong>
              {normalized.score}
              <small>/100</small>
            </strong>
          </div>

          <div
            className={`risk-badge ${getRiskClass(
              dynamicRiskBand
            )}`}
          >
            {dynamicRiskBand}
          </div>
        </div>

        {renderDynamicMonitoring()}

        {renderSupportActions()}

        {normalized.summary && (
          <div className="result-card">
            <h3>
              Assessment Summary
            </h3>

            <p>
              {normalized.summary}
            </p>
          </div>
        )}

        {normalized.indicators.length >
          0 && (
          <div className="result-card">
            <h3>
              Observed Indicators
            </h3>

            <div className="result-list">
              {normalized.indicators.map(
                (item, index) => (
                  <div
                    className="result-item"
                    key={index}
                  >
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {normalized.professional.length >
          0 && (
          <div className="result-card">
            <h3>
              Professional Support
            </h3>

            <div className="result-list">
              {normalized.professional.map(
                (item, index) => (
                  <div
                    className="result-item"
                    key={index}
                  >
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {normalized.doNow.length > 0 && (
          <div className="result-card">
            <h3>
              What You Can Do Now
            </h3>

            <div className="result-list">
              {normalized.doNow.map(
                (item, index) => (
                  <div
                    className="result-item"
                    key={index}
                  >
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {normalized.avoid.length > 0 && (
          <div className="result-card">
            <h3>
              Things to Avoid
            </h3>

            <div className="result-list">
              {normalized.avoid.map(
                (item, index) => (
                  <div
                    className="result-item"
                    key={index}
                  >
                    <span>•</span>
                    <p>{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {normalized.support.length > 0 && (
          <div className="result-card">
            <h3>
              Available Support
            </h3>

            <div className="result-list">
              {normalized.support.map(
                (item, index) => (
                  <div
                    className="result-item"
                    key={index}
                  >
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div className="disclaimer">
          <strong>
            Important:
          </strong>{" "}
          This assessment is a screening and
          support tool, not a medical
          diagnosis. Please consult a
          qualified mental-health professional
          for clinical evaluation or treatment
          decisions.
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setResult(null);
            setMonitoringRecord(null);

            if (
              activeSection === "personal"
            ) {
              setPersonalForm(
                initialPersonalForm
              );
            }
          }}
        >
          Take Assessment Again
        </button>
      </div>
    );
  };

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div className="assessment-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .assessment-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 40px 20px 70px;
          font-family: Inter, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #172033;
        }

        .assessment-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .assessment-hero {
          text-align: center;
          margin-bottom: 35px;
        }

        .assessment-hero .eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #0f766e;
          margin-bottom: 10px;
        }

        .assessment-hero h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.15;
          font-weight: 800;
          color: #10213a;
        }

        .assessment-hero p {
          max-width: 700px;
          margin: 14px auto 0;
          color: #64748b;
          font-size: 16px;
          line-height: 1.7;
        }

        .section-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .section-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
          cursor: pointer;
          transition: 0.25s ease;
          text-align: left;
        }

        .section-card:hover {
          transform: translateY(-2px);
          border-color: #0f766e;
          box-shadow: 0 12px 30px rgba(15, 118, 110, 0.08);
        }

        .section-card.active {
          border-color: #0f766e;
          box-shadow: 0 12px 30px rgba(15, 118, 110, 0.12);
        }

        .section-card h3 {
          margin: 0 0 8px;
          font-size: 18px;
        }

        .section-card p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
        }

        .form-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          margin-bottom: 25px;
        }

        .form-card h2 {
          margin: 0 0 8px;
          font-size: 25px;
        }

        .form-description {
          color: #64748b;
          margin: 0 0 25px;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #334155;
        }

        .form-group select,
        .form-group textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 13px 14px;
          font: inherit;
          outline: none;
          background: #fff;
          transition: 0.2s ease;
        }

        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
        }

        .form-group textarea {
          min-height: 130px;
          resize: vertical;
        }

        .radio-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .radio-option {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
        }

        .radio-option:hover {
          border-color: #0f766e;
        }

        .radio-option input {
          accent-color: #0f766e;
        }

        .primary-button,
        .secondary-button {
          border: none;
          border-radius: 12px;
          padding: 13px 20px;
          font-weight: 700;
          cursor: pointer;
          font-size: 15px;
        }

        .primary-button {
          background: #0f766e;
          color: white;
          width: 100%;
        }

        .primary-button:hover {
          background: #115e59;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-button {
          background: #e2e8f0;
          color: #334155;
          width: 100%;
          margin-top: 15px;
        }

        .error-box {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 18px;
          line-height: 1.5;
        }

        .result-section {
          margin-top: 35px;
        }

        .result-header {
          text-align: center;
          margin-bottom: 22px;
        }

        .small-label {
          display: block;
          color: #0f766e;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.3px;
          margin-bottom: 5px;
        }

        .result-header h2 {
          margin: 0;
          font-size: 28px;
        }

        .result-header p {
          color: #64748b;
        }

        .score-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 25px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .score-card span {
          display: block;
          color: #64748b;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .score-card strong {
          font-size: 42px;
          line-height: 1;
        }

        .score-card strong small {
          font-size: 17px;
          color: #64748b;
        }

        .risk-badge,
        .dynamic-risk-badge,
        .workflow-status,
        .trend-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 800;
        }

        .risk-low,
        .dynamic-low {
          background: #dcfce7;
          color: #166534;
        }

        .risk-moderate,
        .dynamic-moderate {
          background: #fef3c7;
          color: #92400e;
        }

        .risk-high,
        .dynamic-high {
          background: #ffedd5;
          color: #c2410c;
        }

        .risk-critical,
        .dynamic-critical {
          background: #fee2e2;
          color: #b91c1c;
        }

        .risk-unknown,
        .dynamic-unknown {
          background: #e2e8f0;
          color: #475569;
        }

        .dynamic-monitoring-card {
          background: #ffffff;
          border: 1px solid #dbe4ee;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 20px;
        }

        .dynamic-high-card {
          border-color: #fed7aa;
        }

        .dynamic-critical-card {
          border-color: #fecaca;
        }

        .dynamic-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .dynamic-header h3 {
          margin: 0 0 7px;
          font-size: 21px;
        }

        .dynamic-header p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
        }

        .risk-alert-banner {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 14px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .risk-alert-critical {
          background: #fff1f2;
          border-color: #fecdd3;
        }

        .risk-alert-banner strong,
        .safety-alert-banner strong {
          display: block;
          margin-bottom: 5px;
        }

        .risk-alert-banner p,
        .safety-alert-banner p {
          margin: 0;
          color: #475569;
          line-height: 1.55;
          font-size: 14px;
        }

        .safety-alert-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 14px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .safety-alert-banner span {
          display: block;
          margin-top: 10px;
          font-size: 13px;
          color: #991b1b;
        }

        .monitoring-score-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }

        .monitoring-score-box {
          background: #f8fafc;
          border-radius: 14px;
          padding: 17px;
          text-align: center;
        }

        .monitoring-score-box span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 7px;
        }

        .monitoring-score-box strong {
          font-size: 22px;
        }

        .monitoring-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 18px;
        }

        .monitoring-info-box {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 17px;
        }

        .monitoring-info-box > span {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .monitoring-info-box strong {
          display: block;
          margin-bottom: 7px;
        }

        .monitoring-info-box p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.55;
          margin: 8px 0 0;
        }

        .trend-worsening {
          background: #fee2e2;
          color: #b91c1c;
        }

        .trend-improving {
          background: #dcfce7;
          color: #166534;
        }

        .trend-stable,
        .trend-baseline {
          background: #e2e8f0;
          color: #475569;
        }

        .review-support-card {
          border: 1px solid #dbe4ee;
          background: #f8fafc;
          border-radius: 16px;
          padding: 19px;
          margin-top: 18px;
        }

        .review-support-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 16px;
        }

        .review-support-header h4 {
          margin: 0;
          font-size: 18px;
        }

        .workflow-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .workflow-normal {
          background: #dcfce7;
          color: #166534;
        }

        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .workflow-item {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 13px;
        }

        .workflow-item span {
          display: block;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 6px;
        }

        .workflow-item strong {
          font-size: 13px;
        }

        .recommendation-box,
        .support-path-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          margin-top: 10px;
        }

        .recommendation-box span,
        .support-path-box span {
          display: block;
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .recommendation-box p {
          margin: 0;
          line-height: 1.55;
          font-size: 14px;
        }

        .support-path-box strong {
          display: block;
          margin-bottom: 5px;
        }

        .support-path-box small {
          color: #64748b;
        }

        .workflow-note {
          margin-top: 14px;
          padding: 12px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          line-height: 1.55;
        }

        .alert-reference {
          margin-top: 10px;
          color: #0f766e;
          font-size: 12px;
          font-weight: 700;
        }

        .firebase-success {
          margin-top: 15px;
          padding: 12px 14px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          border-radius: 10px;
          font-size: 13px;
        }

        .firebase-note {
          margin-top: 15px;
          padding: 12px 14px;
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
        }

        .monitoring-disclaimer {
          margin-top: 15px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .support-actions-card {
          background: #ffffff;
          border: 1px solid #dbe4ee;
          border-radius: 18px;
          padding: 23px;
          margin-bottom: 20px;
        }

        .support-high {
          border-color: #fed7aa;
        }

        .support-critical {
          border-color: #fecaca;
        }

        .support-actions-card h3 {
          margin: 0 0 7px;
          font-size: 21px;
        }

        .support-actions-card p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
        }

        .support-button-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .support-button {
          border: none;
          border-radius: 11px;
          padding: 11px 15px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
        }

        .support-button.blue,
        .support-button.support {
          background: #0f766e;
          color: #fff;
        }

        .support-button.psychologist {
          background: #2563eb;
          color: #fff;
        }

        .support-button.protection {
          background: #7c3aed;
          color: #fff;
        }

        .support-button.emergency {
          background: #dc2626;
          color: #fff;
        }

        .support-button.outline {
          background: #fff;
          color: #334155;
          border: 1px solid #cbd5e1;
        }

        .follow-up-note {
          margin-top: 15px;
          padding: 11px 13px;
          background: #eff6ff;
          color: #1d4ed8;
          border-radius: 10px;
          font-size: 13px;
        }

        .result-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 18px;
        }

        .result-card h3 {
          margin: 0 0 15px;
          font-size: 19px;
        }

        .result-card p {
          color: #475569;
          line-height: 1.7;
          margin: 0;
        }

        .result-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .result-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .result-item span {
          color: #0f766e;
          font-weight: 800;
        }

        .result-item p {
          margin: 0;
          color: #475569;
          line-height: 1.55;
        }

        .urgent-box {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 18px;
        }

        .urgent-box strong {
          color: #b91c1c;
        }

        .urgent-box p {
          color: #475569;
          line-height: 1.6;
        }

        .urgent-box button {
          background: #dc2626;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 11px 15px;
          cursor: pointer;
          font-weight: 700;
        }

        .disclaimer {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          padding: 15px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width: 760px) {
          .assessment-page {
            padding: 25px 14px 50px;
          }

          .assessment-hero h1 {
            font-size: 30px;
          }

          .section-selector,
          .radio-grid,
          .monitoring-info-grid {
            grid-template-columns: 1fr;
          }

          .monitoring-score-grid {
            grid-template-columns: 1fr;
          }

          .workflow-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dynamic-header,
          .review-support-header,
          .score-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .form-card,
          .dynamic-monitoring-card,
          .support-actions-card,
          .result-card {
            padding: 18px;
          }
        }

        @media (max-width: 450px) {
          .workflow-grid {
            grid-template-columns: 1fr;
          }

          .support-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="assessment-container">
        <div className="assessment-hero">
          <span className="eyebrow">
            SWASTPROVA • AI-ASSISTED ASSESSMENT
          </span>

          <h1>
            Understand Your Current
            Situation
          </h1>

          <p>
            This assessment helps identify
            distress indicators, monitor
            changes over time and connect
            users with appropriate support
            pathways.
          </p>
        </div>

        {!result && (
          <>
            <div className="section-selector">
              <div
                className={`section-card ${
                  activeSection === "scst"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  openSection("scst")
                }
              >
                <h3>
                  Incident / SC-ST Assessment
                </h3>

                <p>
                  For users who want to share
                  information related to
                  discrimination, violence,
                  threats, social boycott or
                  related incidents.
                </p>
              </div>

              <div
                className={`section-card ${
                  activeSection === "personal"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  openSection("personal")
                }
              >
                <h3>
                  Personal Distress Assessment
                </h3>

                <p>
                  Describe your current
                  emotional situation and
                  receive a screening-oriented
                  support assessment.
                </p>
              </div>
            </div>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            {activeSection === "scst" && (
              <div className="form-card">
                <h2>
                  Incident Assessment
                </h2>

                <p className="form-description">
                  Please answer only what you
                  are comfortable sharing.
                </p>

                <form
                  onSubmit={
                    submitScstAssessment
                  }
                >
                  <div className="form-group">
                    <label>
                      Is your current
                      situation related to
                      an incident?
                    </label>

                    <div className="radio-grid">
                      {["Yes", "No"].map(
                        (option) => (
                          <label
                            className="radio-option"
                            key={option}
                          >
                            <input
                              type="radio"
                              name="relatedIncident"
                              value={option}
                              checked={
                                scstForm.relatedIncident ===
                                option
                              }
                              onChange={
                                handleScstChange
                              }
                            />

                            {option}
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {scstForm.relatedIncident ===
                    "Yes" && (
                    <div className="form-group">
                      <label>
                        Incident Type
                      </label>

                      <select
                        name="incidentType"
                        value={
                          scstForm.incidentType
                        }
                        onChange={
                          handleScstChange
                        }
                      >
                        <option value="">
                          Select incident type
                        </option>

                        {incidentTypes.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>
                      Are you currently
                      facing any threat?
                    </label>

                    <div className="radio-grid">
                      {["Yes", "No"].map(
                        (option) => (
                          <label
                            className="radio-option"
                            key={option}
                          >
                            <input
                              type="radio"
                              name="facingThreat"
                              value={option}
                              checked={
                                scstForm.facingThreat ===
                                option
                              }
                              onChange={
                                handleScstChange
                              }
                            />

                            {option}
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Do you currently feel
                      unsafe?
                    </label>

                    <div className="radio-grid">
                      {["Yes", "No"].map(
                        (option) => (
                          <label
                            className="radio-option"
                            key={option}
                          >
                            <input
                              type="radio"
                              name="feelsUnsafe"
                              value={option}
                              checked={
                                scstForm.feelsUnsafe ===
                                option
                              }
                              onChange={
                                handleScstChange
                              }
                            />

                            {option}
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Describe your situation
                      (optional)
                    </label>

                    <textarea
                      name="description"
                      value={
                        scstForm.description
                      }
                      onChange={
                        handleScstChange
                      }
                      placeholder="Share anything you feel comfortable sharing..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    {loading
                      ? "Analyzing..."
                      : "Start Assessment"}
                  </button>
                </form>
              </div>
            )}

            {activeSection ===
              "personal" && (
              <div className="form-card">
                <h2>
                  Personal Distress
                  Assessment
                </h2>

                <p className="form-description">
                  Tell us about what you are
                  currently experiencing. There
                  is no right or wrong answer.
                </p>

                <form
                  onSubmit={
                    submitPersonalAssessment
                  }
                >
                  <div className="form-group">
                    <label>
                      What are you currently
                      experiencing?
                    </label>

                    <textarea
                      name="situation"
                      value={
                        personalForm.situation
                      }
                      onChange={
                        handlePersonalChange
                      }
                      placeholder="For example: I have been feeling stressed, isolated, worried or unable to focus..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    {loading
                      ? "Analyzing..."
                      : "Start Assessment"}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {result && renderResult()}
      </div>
    </div>
  );
}