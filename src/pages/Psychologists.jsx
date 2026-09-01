import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const Psychologists = () => {
  const navigate = useNavigate();

  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const q = query(
          collection(db, "providers"),
          where("role", "==", "psychologist"),
          where("status", "==", "approved")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPsychologists(data);
      } catch (error) {
        console.error("Error loading psychologists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, []);

  // Book Session
  const handleBookSession = (psychologist) => {
    navigate("/book-session", {
      state: {
        providerId: psychologist.id,
        providerName: psychologist.name,
        providerEmail: psychologist.email,
        providerRole: "psychologist",
        sessionFee: psychologist.fee || "500",
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#e0f2fe,#fce7f3)",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#2563eb",
            fontSize: "3rem",
          }}
        >
          👨‍⚕️ Find Psychologists
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: "1.1rem",
            marginBottom: "25px",
          }}
        >
          Connect with qualified psychologists and mental health
          professionals.
        </p>

        {/* Register Button */}
        <button
          onClick={() => navigate("/psychologist-register")}
          style={{
            marginBottom: "40px",
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Register as Psychologist
        </button>

        {/* Loading */}
        {loading && (
          <p style={{ color: "#475569" }}>
            Loading psychologists...
          </p>
        )}

        {/* No Psychologists */}
        {!loading && psychologists.length === 0 && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>No approved psychologists available yet.</h3>

            <p style={{ color: "#64748b" }}>
              Approved psychologists will appear here.
            </p>
          </div>
        )}

        {/* Psychologist Cards */}
        {!loading && psychologists.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "25px",
            }}
          >
            {psychologists.map((psychologist) => (
              <div
                key={psychologist.id}
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "20px",
                  boxShadow:
                    "0 10px 20px rgba(0,0,0,0.08)",
                  textAlign: "left",
                }}
              >
                <h3
                  style={{
                    marginBottom: "10px",
                    color: "#1e293b",
                  }}
                >
                  {psychologist.name}
                </h3>

                <p
                  style={{
                    color: "#475569",
                    marginBottom: "8px",
                  }}
                >
                  <strong>Specialization:</strong>{" "}
                  {psychologist.specialization}
                </p>

                {psychologist.qualification && (
                  <p
                    style={{
                      color: "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Qualification:</strong>{" "}
                    {psychologist.qualification}
                  </p>
                )}

                {psychologist.experience && (
                  <p
                    style={{
                      color: "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Experience:</strong>{" "}
                    {psychologist.experience}
                  </p>
                )}

                <button
                  onClick={() => handleBookSession(psychologist)}
                  style={{
                    marginTop: "10px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Psychologists;