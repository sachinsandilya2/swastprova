import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectionSupport() {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
  };

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
          maxWidth: "950px",
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
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "7px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            Safety & Protection Support
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "32px",
              color: "#111827",
            }}
          >
            Victim & Witness Protection Support
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              lineHeight: 1.7,
              fontSize: "15px",
            }}
          >
            If you are facing threats, intimidation, harassment or feel
            unsafe, this section helps you identify appropriate safety,
            legal and support pathways.
          </p>
        </div>

        {/* EMERGENCY ALERT */}

        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            color: "#991b1b",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            ⚠️ Immediate Safety Concern?
          </h3>

          <p
            style={{
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            If you are in immediate danger, contact local emergency
            services or a trusted authority immediately. Do not wait for
            an online assessment if urgent physical safety is at risk.
          </p>

          <button
            onClick={() => goTo("/emergency-support")}
            style={{
              border: "none",
              background: "#dc2626",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "9px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🚨 Get Emergency Help
          </button>
        </div>

        {/* SUPPORT OPTIONS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          {/* VICTIM PROTECTION */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              🛡️
            </div>

            <h3 style={{ color: "#111827" }}>
              Victim Protection
            </h3>

            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              For individuals facing threats or safety concerns related
              to their complaint or incident.
            </p>

            <button
              onClick={() => goTo("/assessment")}
              style={{
                border: "none",
                background: "#4f46e5",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              View Protection Pathway
            </button>
          </div>

          {/* WITNESS PROTECTION */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              👥
            </div>

            <h3 style={{ color: "#111827" }}>
              Witness Protection
            </h3>

            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              Support pathway for witnesses experiencing intimidation,
              threats or pressure related to a case.
            </p>

            <button
              onClick={() => goTo("/contact")}
              style={{
                border: "none",
                background: "#059669",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Witness Support
            </button>
          </div>

          {/* LEGAL ASSISTANCE */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              ⚖️
            </div>

            <h3 style={{ color: "#111827" }}>
              Legal Assistance
            </h3>

            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              Connect the user with appropriate legal-aid or professional
              assistance for understanding available legal options.
            </p>

            <button
              onClick={() => goTo("/contact")}
              style={{
                border: "none",
                background: "#7c3aed",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Seek Legal Support
            </button>
          </div>

          {/* RELOCATION */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              🏠
            </div>

            <h3 style={{ color: "#111827" }}>
              Relocation / Safe Shelter
            </h3>

            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              Where appropriate, the system can recommend contacting
              authorized authorities regarding relocation or safe-shelter
              support.
            </p>

            <button
              onClick={() => goTo("/contact")}
              style={{
                border: "none",
                background: "#ea580c",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Explore Safety Options
            </button>
          </div>

          {/* COUNSELLING */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              🧠
            </div>

            <h3 style={{ color: "#111827" }}>
              Mental Health Support
            </h3>

            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              Connect with counselling or professional mental-health
              support when elevated distress is detected.
            </p>

            <button
              onClick={() => goTo("/assessment")}
              style={{
                border: "none",
                background: "#0891b2",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Mental Health Assessment
            </button>
          </div>

          {/* HELPLINE */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              📞
            </div>

            <h3 style={{ color: "#111827" }}>
              Helpline / Assistance
            </h3>

            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              Access the appropriate helpline or support channel
              configured by the implementing authority.
            </p>

            <button
              onClick={() => goTo("/contact")}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* SC/ST SUPPORT */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "25px",
            marginBottom: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#111827",
            }}
          >
            SC/ST-Related Incident Support
          </h2>

          <p
            style={{
              color: "#6b7280",
              lineHeight: 1.7,
            }}
          >
            If the reported incident is related to an SC/ST-related
            complaint or atrocity, the system can recommend appropriate
            legal aid, protection, rehabilitation and other support
            pathways through authorized channels.
          </p>

          <div
            style={{
              background: "#f9fafb",
              padding: "15px",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            This platform does not determine whether an incident legally
            constitutes an offence. Legal determination should be made by
            the appropriate authority or qualified legal professional.
          </div>
        </div>

        {/* PRIVACY */}

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "14px",
            padding: "18px",
            color: "#1e40af",
            fontSize: "13px",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}
        >
          <strong>🔒 Privacy & Consent</strong>

          <br />

          Personal information and safety-related information should be
          handled according to applicable privacy, security and legal
          requirements. Share sensitive information only through trusted
          and authorized channels.
        </div>

        {/* BACK BUTTON */}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              padding: "12px 24px",
              borderRadius: "9px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}