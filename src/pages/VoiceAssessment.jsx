import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

const API_URL =
  import.meta.env.VITE_API_URL || "https://swastprova-2.onrender.com";

export default function VoiceAssessment() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // =====================================================
  // FIREBASE AUTH
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // =====================================================
  // RECORDING TIMER
  // =====================================================

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // =====================================================
  // START RECORDING
  // =====================================================

  const startRecording = async () => {
    try {
      setError("");
      setResult(null);
      setSaved(false);

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError("Your browser does not support microphone recording.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      let mimeType = "audio/webm";

      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          mimeType = "";
        }
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const actualType =
          mediaRecorder.mimeType || mimeType || "audio/webm";

        const blob = new Blob(audioChunksRef.current, {
          type: actualType,
        });

        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioURL(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);

      setRecordingTime(0);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);

      setError(
        "Microphone permission is required. Please allow microphone access and try again."
      );
    }
  };

  // =====================================================
  // STOP RECORDING
  // =====================================================

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetAssessment = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    setAudioURL("");
    setAudioBlob(null);
    setRecordingTime(0);
    setResult(null);
    setError("");
    setSaved(false);
  };

  // =====================================================
  // SAVE RESULT TO FIRESTORE
  // =====================================================

  const saveResultToFirebase = async (data) => {
    if (!user) {
      return;
    }

    try {
      await addDoc(collection(db, "distressAssessments"), {
        userId: user.uid,

        assessmentType: "Voice Assessment",
        source: "AI Voice Screening",
        monitoringType: "PS-94 Dynamic Distress Monitoring",

        voiceStressScore:
          Number(data.voiceStressScore ?? data.distressScore ?? 0),

        distressScore: Number(data.distressScore ?? 0),

        riskLevel: data.riskLevel || "Unknown",

        voiceMetrics: data.voiceMetrics || {},

        indicators: Array.isArray(data.indicators)
          ? data.indicators
          : [],

        recommendedSupport: Array.isArray(data.recommendedSupport)
          ? data.recommendedSupport
          : [],

        summary: data.summary || "",
        message: data.message || "",

        safetyFlag: Boolean(data.safetyFlag),
        safetyPriority: data.safetyPriority || "Normal",

        createdAt: serverTimestamp(),
      });

      setSaved(true);
    } catch (firebaseError) {
      console.error("Firebase save error:", firebaseError);

      setError(
        "Voice analysis completed, but the result could not be saved to monitoring history."
      );
    }
  };

  // =====================================================
  // ANALYZE VOICE WITH GEMINI
  // =====================================================

  const analyzeVoice = async () => {
    if (!audioBlob) {
      setError("Please record your voice first.");
      return;
    }

    if (recordingTime < 10) {
      setError(
        "Please record at least 10 seconds of natural speech for a better screening."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setSaved(false);

      const formData = new FormData();

      const extension = audioBlob.type.includes("mp4")
        ? "mp4"
        : "webm";

      formData.append(
        "audio",
        audioBlob,
        `voice-assessment.${extension}`
      );

      const response = await fetch(
        `${API_URL}/api/voice-assessment`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from voice-analysis server."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Voice analysis failed with status ${response.status}.`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Voice analysis failed."
        );
      }

      setResult(data);

      await saveResultToFirebase(data);
    } catch (err) {
      console.error("Voice assessment error:", err);

      setError(
        err.message ||
          "Unable to analyze the voice. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RISK COLOR
  // =====================================================

  const getRiskColor = (risk) => {
    const value = String(risk || "").toLowerCase();

    if (value === "critical") return "#b91c1c";
    if (value === "high") return "#dc2626";
    if (value === "moderate") return "#d97706";
    if (value === "low") return "#15803d";

    return "#374151";
  };

  // =====================================================
  // RISK BACKGROUND
  // =====================================================

  const getRiskBackground = (risk) => {
    const value = String(risk || "").toLowerCase();

    if (value === "critical") return "#fef2f2";
    if (value === "high") return "#fff1f2";
    if (value === "moderate") return "#fffbeb";
    if (value === "low") return "#f0fdf4";

    return "#f9fafb";
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "30px",
            marginBottom: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#eef2ff",
              color: "#4338ca",
              padding: "7px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            AI Voice Screening
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "32px",
              color: "#111827",
            }}
          >
            Voice Mental Health Assessment
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              lineHeight: 1.7,
              fontSize: "15px",
            }}
          >
            Record a short natural voice sample. SWASTPROVA analyzes
            speech-related indicators such as pauses, speech pattern,
            pitch variation and voice energy to generate a screening
            indicator.
          </p>
        </div>

        {/* PRIVACY NOTICE */}

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "24px",
            color: "#1e40af",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          <strong>Privacy & Safety:</strong> This is an AI-assisted
          screening system. It does not diagnose depression, PTSD,
          anxiety or any other medical condition. Voice indicators
          should not be treated as clinical proof.
        </div>

        {/* RECORDING CARD */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "30px",
            marginBottom: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "110px",
              height: "110px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: isRecording
                ? "#fee2e2"
                : "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "46px",
            }}
          >
            {isRecording ? "🔴" : "🎙️"}
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#111827",
            }}
          >
            {isRecording
              ? "Recording in progress..."
              : "Voice Recording"}
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "20px",
            }}
          >
            {isRecording
              ? "Speak naturally about how you are feeling."
              : "Record approximately 20–60 seconds of natural speech."}
          </p>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: isRecording
                ? "#dc2626"
                : "#374151",
              marginBottom: "20px",
            }}
          >
            {formatTime(recordingTime)}
          </div>

          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                border: "none",
                background: "#4f46e5",
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🎙️ Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                border: "none",
                background: "#dc2626",
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ⏹ Stop Recording
            </button>
          )}

          {audioURL && !isRecording && (
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                background: "#f9fafb",
                borderRadius: "12px",
              }}
            >
              <p
                style={{
                  marginTop: 0,
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Recorded Voice
              </p>

              <audio
                controls
                src={audioURL}
                style={{
                  width: "100%",
                  maxWidth: "500px",
                }}
              />

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={analyzeVoice}
                  disabled={loading}
                  style={{
                    border: "none",
                    background: loading
                      ? "#9ca3af"
                      : "#059669",
                    color: "#ffffff",
                    padding: "12px 22px",
                    borderRadius: "9px",
                    fontWeight: "600",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {loading
                    ? "🤖 Gemini Analyzing..."
                    : "🤖 Analyze with Gemini"}
                </button>

                <button
                  onClick={resetAssessment}
                  disabled={loading}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    padding: "12px 22px",
                    borderRadius: "9px",
                    fontWeight: "600",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Record Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "24px",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        {/* RESULT */}

        {result && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "30px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                Voice Assessment Result
              </h2>

              {saved && (
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "7px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  ✓ Saved to Monitoring
                </span>
              )}
            </div>

            {/* GEMINI BADGE */}

            <div
              style={{
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                color: "#3730a3",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "13px",
              }}
            >
              🤖 <strong>Gemini AI Analysis:</strong> The recorded
              voice was processed through the SWASTPROVA backend for
              AI-assisted voice screening.
            </div>

            {/* SCORES */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "14px",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  Voice Stress Indicator
                </div>

                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#4f46e5",
                  }}
                >
                  {result.voiceStressScore ?? "—"}
                </div>

                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "12px",
                  }}
                >
                  Screening indicator
                </div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "14px",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  Dynamic Distress Score
                </div>

                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#111827",
                  }}
                >
                  {result.distressScore ?? "—"}
                </div>

                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "12px",
                  }}
                >
                  PS-94 monitoring indicator
                </div>
              </div>

              <div
                style={{
                  background: getRiskBackground(
                    result.riskLevel
                  ),
                  borderRadius: "14px",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  Risk Level
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: getRiskColor(
                      result.riskLevel
                    ),
                  }}
                >
                  {result.riskLevel || "Unknown"}
                </div>
              </div>
            </div>

            {/* VOICE METRICS */}

            {result.voiceMetrics && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ color: "#111827" }}>
                  Voice Indicators
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {Object.entries(result.voiceMetrics).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                          padding: "14px",
                        }}
                      >
                        <div
                          style={{
                            color: "#6b7280",
                            fontSize: "13px",
                            marginBottom: "5px",
                            textTransform: "capitalize",
                          }}
                        >
                          {key.replace(
                            /([A-Z])/g,
                            " $1"
                          )}
                        </div>

                        <strong
                          style={{
                            color: "#374151",
                          }}
                        >
                          {value}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* INDICATORS */}

            {Array.isArray(result.indicators) &&
              result.indicators.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ color: "#111827" }}>
                    Detected Indicators
                  </h3>

                  <ul
                    style={{
                      paddingLeft: "20px",
                      color: "#4b5563",
                      lineHeight: 1.8,
                    }}
                  >
                    {result.indicators.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* SUMMARY */}

            {result.summary && (
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  padding: "18px",
                  marginBottom: "20px",
                  color: "#374151",
                  lineHeight: 1.7,
                }}
              >
                <strong>AI Screening Summary</strong>

                <p
                  style={{
                    marginBottom: 0,
                    marginTop: "8px",
                  }}
                >
                  {result.summary}
                </p>
              </div>
            )}

            {/* RECOMMENDATIONS */}

            {Array.isArray(result.recommendedSupport) &&
              result.recommendedSupport.length > 0 && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color: "#166534",
                    }}
                  >
                    Recommended Support
                  </h3>

                  <ul
                    style={{
                      paddingLeft: "20px",
                      color: "#166534",
                      lineHeight: 1.8,
                    }}
                  >
                    {result.recommendedSupport.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* HIGH / CRITICAL */}

            {["high", "critical"].includes(
              String(result.riskLevel || "").toLowerCase()
            ) && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "18px",
                  borderRadius: "14px",
                  marginBottom: "20px",
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  ⚠️ Elevated Distress Indicator
                </strong>

                <p
                  style={{
                    marginBottom: 0,
                  }}
                >
                  The screening result indicates elevated
                  distress-related markers. Consider timely
                  professional support and appropriate safety
                  assessment.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "15px",
                  }}
                >
                  <button
                    onClick={() =>
                      navigate("/psychologists")
                    }
                    style={{
                      border: "none",
                      background: "#dc2626",
                      color: "#fff",
                      padding: "11px 18px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Talk to Psychologist
                  </button>

                  <button
                    onClick={() =>
                      navigate("/emergency-support")
                    }
                    style={{
                      border:
                        "1px solid #dc2626",
                      background: "#fff",
                      color: "#dc2626",
                      padding: "11px 18px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Emergency Support
                  </button>

                  <button
                    onClick={() =>
                      navigate("/protection-support")
                    }
                    style={{
                      border:
                        "1px solid #7f1d1d",
                      background: "#fff",
                      color: "#7f1d1d",
                      padding: "11px 18px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Protection Support
                  </button>
                </div>
              </div>
            )}

            {/* MONITORING BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() =>
                  navigate("/progress")
                }
                style={{
                  border: "none",
                  background: "#4f46e5",
                  color: "#fff",
                  padding: "12px 18px",
                  borderRadius: "9px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                📈 View Distress Progress
              </button>

              <button
                onClick={() =>
                  navigate("/distress-prediction")
                }
                style={{
                  border:
                    "1px solid #c7d2fe",
                  background: "#eef2ff",
                  color: "#3730a3",
                  padding: "12px 18px",
                  borderRadius: "9px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                🔮 View Prediction
              </button>

              <button
                onClick={() =>
                  navigate("/victim-case-dashboard")
                }
                style={{
                  border:
                    "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  padding: "12px 18px",
                  borderRadius: "9px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                📋 Case Dashboard
              </button>
            </div>

            {/* DISCLAIMER */}

            <div
              style={{
                background: "#f9fafb",
                borderRadius: "12px",
                padding: "15px",
                color: "#6b7280",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              {result.message ||
                "Voice analysis is an AI-assisted screening indicator and should not be treated as a medical diagnosis. Professional assessment should be used for clinical decisions."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}