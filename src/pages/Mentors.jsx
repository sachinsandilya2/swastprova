import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Mentors() {
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const q = query(
          collection(db, "providers"),
          where("role", "==", "mentor"),
          where("status", "==", "approved")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMentors(data);
      } catch (error) {
        console.error("Error loading mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleBookSession = (mentor) => {
    navigate("/book-session", {
      state: {
        providerId: mentor.id,
        providerName: mentor.name,
        providerEmail: mentor.email,
        providerRole: "mentor",
        sessionFee: mentor.fee || "500",
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
          🎯 Find Mentors
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: "1.1rem",
          }}
        >
          Find and connect with experienced mentors.
        </p>

        <button
          onClick={() => navigate("/mentor-register")}
          style={{
            marginTop: "20px",
            marginBottom: "40px",
            padding: "12px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Register as Mentor
        </button>

        {loading && (
          <p style={{ color: "#475569" }}>
            Loading mentors...
          </p>
        )}

        {!loading && mentors.length === 0 && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>No approved mentors available yet.</h3>

            <p style={{ color: "#64748b" }}>
              Approved mentors will appear here.
            </p>
          </div>
        )}

        {!loading && mentors.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "25px",
            }}
          >
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "20px",
                  boxShadow:
                    "0 10px 20px rgba(0,0,0,0.08)",
                  textAlign: "left",
                }}
              >
                <h3>{mentor.name}</h3>

                <p>
                  <strong>Specialization:</strong>{" "}
                  {mentor.specialization}
                </p>

                <p>
                  <strong>Experience:</strong>{" "}
                  {mentor.experience}
                </p>

                {mentor.bio && (
                  <p>
                    <strong>About:</strong> {mentor.bio}
                  </p>
                )}

                <button
                  onClick={() => handleBookSession(mentor)}
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
}