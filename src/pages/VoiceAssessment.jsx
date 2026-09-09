import React, { useEffect, useRef, useState } from "react";

const API_URL = "https://swastprova-2.onrender.com";

export default function VoiceAssessment() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // ==========================================
  // RECORDING TIMER
  // ==========================================

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

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // ==========================================
  // START RECORDING
  // ==========================================

  const startRecording = async () => {
    try {
      setError("");
      setResult(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser does not support microphone recording.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioURL(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      setRecordingTime(0);
      setIsRecording(true);
    } catch (err) {
      console.error(err);

      setError(
        "Microphone permission is required. Please allow microphone access and try again."
      );
    }
  };

  // ==========================================
  // STOP RECORDING
  // ==========================================

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetAssessment = () => {
    setAudioURL("");
    setAudioBlob(null);
    setRecordingTime(0);
    setResult(null);
    setError("");
  };

  // ==========================================
  // ANALYZE VOICE
  // ==========================================

  const analyzeVoice = async () => {
    if (!audioBlob) {
      setError("Please record your voice first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();

      formData.append("audio", audioBlob, "voice-assessment.webm");

      const response = await fetch(`${API_URL}/api/voice-assessment`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Voice analysis service is unavailable.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Voice analysis failed.");
      }

      setResult(data);
    } catch (err) {
      console.error("Voice assessment error:", err);

      /*
       * DEMO FALLBACK
       *
       * This fallback is only for frontend demonstration.
       * Replace it with the real backend response once
       * /api/voice-assessment is implemented.
       */

      setResult({
        success: true,
        demo: true,

        voiceStressScore: 42,
        distressScore: 42,
        riskLevel: "Moderate",

        indicators: [
          "Speech pattern analysis completed",
          "Pause and hesitation markers detected",
          "Voice energy variation observed",
          "Emotional distress indicators screened",
        ],

        voiceMetrics: {
          speechRate: "Normal",
          pausePattern: "Moderate",
          pitchVariation: "Moderate",
          voiceEnergy: "Normal",
        },

        recommendedSupport: [
          "Consider speaking with a counsellor",
          "Continue periodic mental-health monitoring",
          "Complete the mental-health assessment for a combined screening result",
        ],

        message:
          "Voice screening completed. This result is a screening indicator and not a medical diagnosis.",
      });

      setError(
        "Live voice-analysis API is not connected yet. Showing demo analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RISK COLOR
  // ==========================================

  const getRiskColor = (risk) => {
    const value = String(risk || "").toLowerCase();

    if (value === "critical") return "#b91c1c";
    if (value === "high") return "#dc2626";
    if (value === "moderate") return "#d97706";
    if (value === "low") return "#15803d";

    return "#374151";
  };

  // ==========================================
  // PAGE
  // ==========================================

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
              fontWeight: "600",
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
            Record a short voice sample to screen speech patterns,
            pauses, pitch variation and other voice-based distress indicators.
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
          <strong>Privacy & Safety:</strong> Voice analysis is intended for
          mental-health screening and early distress detection. It does not
          provide a medical diagnosis or legally determine a person's
          condition.
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
              background: isRecording ? "#fee2e2" : "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "46px",
              transition: "0.3s",
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
            {isRecording ? "Recording in progress..." : "Voice Recording"}
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
              color: isRecording ? "#dc2626" : "#374151",
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
                    background: loading ? "#9ca3af" : "#059669",
                    color: "#ffffff",
                    padding: "12px 22px",
                    borderRadius: "9px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Analyzing Voice..." : "🔍 Analyze Voice"}
                </button>

                <button
                  onClick={resetAssessment}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    padding: "12px 22px",
                    borderRadius: "9px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Record Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ERROR / DEMO MESSAGE */}

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
            <h2
              style={{
                marginTop: 0,
                color: "#111827",
              }}
            >
              Voice Assessment Result
            </h2>

            {result.demo && (
              <div
                style={{
                  background: "#fefce8",
                  border: "1px solid #fde68a",
                  color: "#854d0e",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                Demo result shown because the live voice-analysis API is not
                connected yet.
              </div>
            )}

            {/* SCORE */}

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
                  Voice Stress Score
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
                  Combined screening score
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
                  Risk Level
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: getRiskColor(result.riskLevel),
                  }}
                >
                  {result.riskLevel || "Unknown"}
                </div>
              </div>
            </div>

            {/* VOICE METRICS */}

            {result.voiceMetrics && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ color: "#111827" }}>Voice Indicators</h3>

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
                          {key.replace(/([A-Z])/g, " $1")}
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
                    {result.indicators.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
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
                    {result.recommendedSupport.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* HIGH RISK ALERT */}

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
                <strong>⚠️ Elevated Distress Indicator</strong>

                <br />

                The screening result indicates elevated distress markers.
                Consider timely professional support and safety assessment.
              </div>
            )}

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
                "Voice analysis is a screening tool and should not be treated as a medical diagnosis. Professional assessment should be used for clinical decisions."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}