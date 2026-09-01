import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function MentorRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    bio: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

      const user = userCredential.user;

      await setDoc(doc(db, "providers", user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialization: form.specialization,
        experience: form.experience,
        bio: form.bio,
        role: "mentor",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert(
        "Your mentor application has been submitted. Please wait for admin approval."
      );

      navigate("/mentors");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please use another email."
        );
      } else if (err.code === "auth/weak-password") {
        setError(
          "Password should be at least 6 characters."
        );
      } else if (err.code === "auth/invalid-email") {
        setError(
          "Please enter a valid email address."
        );
      } else {
        setError(
          err.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mentor-page">

      {/* ================= HEADER ================= */}

      <div className="mentor-container">

        <div className="mentor-header">

          <div className="mentor-icon">
            🎓
          </div>

          <h1 className="mentor-title">
            Join Swastprova as a Mentor
          </h1>

          <p className="mentor-description">
            Share your knowledge, experience and guidance
            to help people grow and achieve their goals.
          </p>

        </div>


        {/* ================= FORM CARD ================= */}

        <div className="mentor-card">

          <div className="mentor-top-line"></div>

          <div className="mentor-card-content">

            {/* HEADER */}

            <div className="form-main-header">

              <h2>
                Mentor Information
              </h2>

              <p>
                Please provide accurate information for
                verification.
              </p>

            </div>


            {/* ERROR */}

            {error && (
              <div className="form-error">

                <span>⚠️</span>

                <p>{error}</p>

              </div>
            )}


            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit}
              className="mentor-form"
            >

              {/* ================= PERSONAL ================= */}

              <div className="form-section">

                <div className="form-section-header">

                  <div className="section-icon blue">
                    👤
                  </div>

                  <div>
                    <h3>
                      Personal Information
                    </h3>

                    <p>
                      Basic contact details
                    </p>
                  </div>

                </div>


                <div className="form-grid">

                  <FormField
                    label="Full Name"
                    required
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </FormField>


                  <FormField
                    label="Email Address"
                    required
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="example@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </FormField>


                  <FormField
                    label="Phone Number"
                    required
                  >
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </FormField>

                </div>

              </div>


              {/* ================= PROFESSIONAL ================= */}

              <div className="form-section">

                <div className="form-section-header">

                  <div className="section-icon violet">
                    💼
                  </div>

                  <div>
                    <h3>
                      Mentoring Details
                    </h3>

                    <p>
                      Your expertise and experience
                    </p>
                  </div>

                </div>


                <div className="form-grid">

                  <FormField
                    label="Specialization"
                    required
                  >
                    <input
                      type="text"
                      name="specialization"
                      placeholder="e.g. Career, Education, Technology"
                      value={form.specialization}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </FormField>


                  <FormField
                    label="Experience"
                    required
                  >
                    <input
                      type="text"
                      name="experience"
                      placeholder="e.g. 3 Years"
                      value={form.experience}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </FormField>

                </div>

              </div>


              {/* ================= ABOUT ================= */}

              <div className="form-section">

                <div className="form-section-header">

                  <div className="section-icon green">
                    ✨
                  </div>

                  <div>
                    <h3>
                      About You
                    </h3>

                    <p>
                      Tell users about your mentoring approach
                    </p>
                  </div>

                </div>


                <FormField label="Mentor Bio">

                  <textarea
                    name="bio"
                    placeholder="Tell us about your experience, skills and how you can help people..."
                    value={form.bio}
                    onChange={handleChange}
                    rows={5}
                    className="form-input textarea"
                  />

                </FormField>

              </div>


              {/* ================= ACCOUNT ================= */}

              <div className="form-section">

                <div className="form-section-header">

                  <div className="section-icon yellow">
                    🔐
                  </div>

                  <div>
                    <h3>
                      Account Security
                    </h3>

                    <p>
                      Create your login password
                    </p>
                  </div>

                </div>


                <FormField
                  label="Create Password"
                  required
                >

                  <input
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                    className="form-input"
                  />

                </FormField>

              </div>


              {/* ================= REVIEW ================= */}

              <div className="review-box">

                <span className="review-icon">
                  ℹ️
                </span>

                <div>

                  <h4>
                    Application Review
                  </h4>

                  <p>
                    After submitting this form, your
                    application will be reviewed by the
                    Swastprova admin team. Your mentor
                    profile will become visible to users
                    only after approval.
                  </p>

                </div>

              </div>


              {/* ================= SUBMIT ================= */}

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >

                {loading ? (
                  <span className="loading-content">

                    <span className="spinner"></span>

                    Submitting Application...

                  </span>
                ) : (
                  "Apply as Mentor →"
                )}

              </button>


              {/* ================= BACK ================= */}

              <button
                type="button"
                onClick={() =>
                  navigate("/mentors")
                }
                className="back-button"
              >
                ← Back to Mentors
              </button>

            </form>

          </div>

        </div>


        {/* ================= TRUST ================= */}

        <div className="trust-section">

          <span>✓ Secure Registration</span>

          <span>✓ Admin Verification</span>

          <span>✓ Professional Profile</span>

        </div>

      </div>


      {/* ================= RESPONSIVE CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }


        .mentor-page {
          width: 100%;
          max-width: 100vw;
          min-height: 100vh;

          padding: 40px 20px 70px;

          background:
            linear-gradient(
              135deg,
              #f8fafc,
              #eff6ff,
              #f5f3ff
            );

          overflow-x: hidden;
        }


        .mentor-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }


        /* HEADER */

        .mentor-header {
          width: 100%;
          text-align: center;
          margin-bottom: 35px;
        }


        .mentor-icon {
          width: 72px;
          height: 72px;

          margin: 0 auto 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          font-size: 35px;

          box-shadow:
            0 12px 30px
            rgba(37,99,235,0.20);
        }


        .mentor-title {
          width: 100%;

          margin: 0;

          color: #0f172a;

          font-size: clamp(
            30px,
            5vw,
            48px
          );

          line-height: 1.15;

          font-weight: 900;

          letter-spacing: -1px;

          word-break: normal;
          overflow-wrap: normal;
          white-space: normal;
        }


        .mentor-description {
          width: 100%;
          max-width: 650px;

          margin: 15px auto 0;

          color: #64748b;

          font-size: 16px;

          line-height: 1.7;

          word-break: normal;
        }


        /* CARD */

        .mentor-card {
          width: 100%;
          max-width: 100%;

          background: #ffffff;

          border-radius: 25px;

          border: 1px solid #e2e8f0;

          box-shadow:
            0 25px 70px
            rgba(15,23,42,0.08);

          overflow: hidden;
        }


        .mentor-top-line {
          width: 100%;
          height: 6px;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #7c3aed,
              #9333ea
            );
        }


        .mentor-card-content {
          width: 100%;
          padding: 40px;
        }


        /* HEADER */

        .form-main-header {
          margin-bottom: 30px;
        }


        .form-main-header h2 {
          margin: 0;

          color: #0f172a;

          font-size: 25px;

          font-weight: 800;

          line-height: 1.3;
        }


        .form-main-header p {
          margin: 7px 0 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.5;
        }


        /* ERROR */

        .form-error {
          width: 100%;

          display: flex;

          align-items: flex-start;

          gap: 12px;

          margin-bottom: 25px;

          padding: 15px;

          border-radius: 13px;

          background: #fef2f2;

          border: 1px solid #fecaca;

          color: #b91c1c;
        }


        .form-error p {
          margin: 0;

          font-size: 14px;

          line-height: 1.5;

          word-break: break-word;
        }


        /* FORM */

        .mentor-form {
          width: 100%;
          max-width: 100%;
        }


        .form-section {
          width: 100%;
          margin-bottom: 35px;
        }


        .form-section-header {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 18px;
        }


        .section-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          font-size: 20px;
        }


        .section-icon.blue {
          background: #dbeafe;
        }


        .section-icon.violet {
          background: #ede9fe;
        }


        .section-icon.green {
          background: #dcfce7;
        }


        .section-icon.yellow {
          background: #fef3c7;
        }


        .form-section-header h3 {
          margin: 0;

          color: #1e293b;

          font-size: 18px;

          font-weight: 800;

          line-height: 1.3;
        }


        .form-section-header p {
          margin: 3px 0 0;

          color: #94a3b8;

          font-size: 12px;

          line-height: 1.4;
        }


        /* GRID */

        .form-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 20px;
        }


        /* FIELD */

        .form-field {
          width: 100%;
          min-width: 0;
        }


        .form-label {
          display: block;

          margin-bottom: 8px;

          color: #334155;

          font-size: 14px;

          font-weight: 700;
        }


        /* INPUT */

        .form-input {
          display: block;

          width: 100%;
          max-width: 100%;
          min-width: 0;

          padding: 14px 15px;

          border: 1px solid #cbd5e1;

          border-radius: 13px;

          background: #f8fafc;

          color: #0f172a;

          font-family: inherit;

          font-size: 15px;

          line-height: 1.5;

          outline: none;

          box-sizing: border-box;

          transition: 0.2s ease;
        }


        .form-input::placeholder {
          color: #94a3b8;
        }


        .form-input:focus {
          background: #ffffff;

          border-color: #6366f1;

          box-shadow:
            0 0 0 4px
            rgba(99,102,241,0.10);
        }


        .textarea {
          resize: vertical;
          min-height: 130px;
        }


        /* REVIEW */

        .review-box {
          width: 100%;

          display: flex;

          align-items: flex-start;

          gap: 12px;

          padding: 18px;

          margin-bottom: 25px;

          border-radius: 15px;

          background: #eff6ff;

          border: 1px solid #dbeafe;
        }


        .review-icon {
          flex-shrink: 0;
          font-size: 21px;
        }


        .review-box h4 {
          margin: 0 0 5px;

          color: #1e3a8a;

          font-size: 14px;

          font-weight: 800;
        }


        .review-box p {
          margin: 0;

          color: #475569;

          font-size: 13px;

          line-height: 1.6;

          word-break: normal;
        }


        /* SUBMIT */

        .submit-button {
          display: block;

          width: 100%;
          max-width: 100%;

          padding: 15px 20px;

          border: none;

          border-radius: 14px;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #7c3aed
            );

          color: #ffffff;

          font-family: inherit;

          font-size: 15px;

          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 10px 25px
            rgba(37,99,235,0.20);

          transition: 0.25s ease;
        }


        .submit-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 15px 30px
            rgba(37,99,235,0.25);
        }


        .submit-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }


        /* LOADING */

        .loading-content {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 10px;
        }


        .spinner {
          width: 19px;
          height: 19px;

          border: 2px solid
            rgba(255,255,255,0.5);

          border-top-color: #ffffff;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;
        }


        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* BACK */

        .back-button {
          display: block;

          width: 100%;

          margin-top: 12px;

          padding: 13px 20px;

          border: 1px solid #e2e8f0;

          border-radius: 12px;

          background: #ffffff;

          color: #64748b;

          font-family: inherit;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .back-button:hover {
          background: #f8fafc;
        }


        /* TRUST */

        .trust-section {
          display: flex;

          align-items: center;

          justify-content: center;

          flex-wrap: wrap;

          gap: 18px;

          margin-top: 22px;

          color: #94a3b8;

          font-size: 12px;

          font-weight: 600;

          text-align: center;
        }


        /* TABLET */

        @media (max-width: 768px) {

          .mentor-page {
            padding:
              30px 15px 50px;
          }


          .mentor-card-content {
            padding:
              28px 22px;
          }


          .form-grid {
            grid-template-columns: 1fr;
            gap: 17px;
          }


          .mentor-title {
            font-size: 34px;
          }

        }


        /* MOBILE */

        @media (max-width: 480px) {

          .mentor-page {
            padding:
              25px 10px 40px;
          }


          .mentor-header {
            margin-bottom: 25px;
          }


          .mentor-icon {
            width: 62px;
            height: 62px;

            font-size: 30px;

            border-radius: 17px;
          }


          .mentor-title {
            width: 100%;

            font-size: 29px;

            line-height: 1.18;

            letter-spacing: -0.5px;

            word-break: keep-all;

            overflow-wrap: normal;
          }


          .mentor-description {
            font-size: 14px;

            line-height: 1.6;
          }


          .mentor-card {
            border-radius: 19px;
          }


          .mentor-card-content {
            padding:
              22px 14px;
          }


          .form-main-header h2 {
            font-size: 21px;
          }


          .form-main-header p {
            font-size: 13px;
          }


          .form-section-header {
            gap: 9px;
          }


          .section-icon {
            width: 39px;
            height: 39px;

            font-size: 18px;
          }


          .form-section-header h3 {
            font-size: 16px;
          }


          .form-section-header p {
            font-size: 11px;
          }


          .form-input {
            padding:
              13px 12px;

            font-size: 16px;
          }


          .review-box {
            padding: 14px;
            gap: 9px;
          }


          .review-box p {
            font-size: 12px;
            line-height: 1.55;
          }


          .submit-button {
            padding:
              15px 12px;

            font-size: 14px;
          }


          .trust-section {
            gap: 9px;
            font-size: 10px;
          }

        }


        /* VERY SMALL PHONE */

        @media (max-width: 360px) {

          .mentor-page {
            padding:
              20px 7px 35px;
          }


          .mentor-card-content {
            padding:
              20px 11px;
          }


          .mentor-title {
            font-size: 26px;
          }


          .mentor-description {
            font-size: 13px;
          }


          .form-main-header h2 {
            font-size: 19px;
          }


          .form-input {
            font-size: 16px;
          }


          .submit-button {
            font-size: 13px;
          }

        }

      `}</style>

    </div>
  );
}


/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  required,
  children,
}) {
  return (
    <div className="form-field">

      <label className="form-label">

        {label}

        {required && (
          <span
            style={{
              color: "#ef4444",
              marginLeft: "4px",
            }}
          >
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}