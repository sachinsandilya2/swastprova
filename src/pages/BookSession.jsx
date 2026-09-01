import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookSession() {
  const location = useLocation();
  const navigate = useNavigate();

  /*
    Mentor / Psychologist page se data:

    navigate("/book-session", {
      state: {
        providerName: "Dr. Rahul",
        providerRole: "psychologist",
        providerEmail: "doctor@example.com",
        sessionFee: "500",
      },
    });
  */

  const provider = location.state || {};

  const providerName =
    provider.providerName ||
    provider.name ||
    "Provider";

  const providerRole =
    provider.providerRole ||
    provider.role ||
    "mentor";

  const providerEmail =
    provider.providerEmail ||
    provider.email ||
    "";

  const sessionFee =
    provider.sessionFee ||
    provider.fee ||
    "500";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    paymentMethod: "cash",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT BOOKING ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!providerEmail) {
      setError(
        "Provider email is not available. Please try again from the provider page."
      );
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.date) {
      setError("Please select a date.");
      return;
    }

    if (!formData.time) {
      setError("Please select a time slot.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://swastprova-2.onrender.com/book-appointment",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,

            providerName,
            providerRole,
            providerEmail,

            date: formData.date,
            time: formData.time,

            paymentMethod: formData.paymentMethod,

            sessionFee,

            message: formData.message,
          }),
        }
      );

      /*
        IMPORTANT:
        Direct response.json() nahi kar rahe.
        Pehle text read karenge, phir JSON parse karenge.
      */

      const responseText = await response.text();

      console.log("Booking API Status:", response.status);
      console.log("Booking API Response:", responseText);

      let data = null;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "Backend returned non-JSON response:",
          responseText
        );

        throw new Error(
          `Server returned an invalid response. Status: ${response.status}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Booking failed."
        );
      }

      setSuccess(
        "Session request sent successfully! You will receive confirmation by email."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        paymentMethod: "cash",
        message: "",
      });

    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err.message ||
          "Unable to book session. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">

      {/* ================= HEADER ================= */}

      <div className="booking-header">

        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="header-content">

          <div className="header-icon">
            {providerRole === "psychologist"
              ? "🧠"
              : "🎓"}
          </div>

          <div>
            <p className="small-title">
              Swastprova
            </p>

            <h1>
              Book Your Session
            </h1>

            <p>
              Schedule a session with your{" "}
              {providerRole === "psychologist"
                ? "psychologist"
                : "mentor"}
            </p>
          </div>

        </div>

      </div>


      {/* ================= MAIN ================= */}

      <main className="booking-container">

        {/* PROVIDER CARD */}

        <div className="provider-summary">

          <div className="provider-summary-icon">
            {providerRole === "psychologist"
              ? "🧠"
              : "🎓"}
          </div>

          <div className="provider-summary-info">

            <span className="provider-type">
              {providerRole === "psychologist"
                ? "Psychologist"
                : "Mentor"}
            </span>

            <h2>
              {providerName}
            </h2>

            <p>
              Professional Session
            </p>

          </div>

          <div className="session-price">

            <span>
              Session Fee
            </span>

            <strong>
              ₹{sessionFee}
            </strong>

          </div>

        </div>


        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSubmit}
          className="booking-form"
        >

          {/* YOUR DETAILS */}

          <div className="section-title">

            <span>👤</span>

            <div>
              <h2>
                Your Details
              </h2>

              <p>
                Enter your contact information
              </p>
            </div>

          </div>


          <div className="form-grid">

            {/* NAME */}

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

            </div>


            {/* PHONE */}

            <div className="form-group">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />

            </div>

          </div>


          {/* ================= SESSION DETAILS ================= */}

          <div className="section-title session-section">

            <span>📅</span>

            <div>

              <h2>
                Choose Session
              </h2>

              <p>
                Select your preferred date and time
              </p>

            </div>

          </div>


          <div className="form-grid">

            {/* DATE */}

            <div className="form-group">

              <label>
                Select Date
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={handleChange}
                required
              />

            </div>


            {/* TIME */}

            <div className="form-group">

              <label>
                Select Time Slot
              </label>

              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select a time slot
                </option>

                <option value="09:00 AM">
                  09:00 AM
                </option>

                <option value="10:00 AM">
                  10:00 AM
                </option>

                <option value="11:00 AM">
                  11:00 AM
                </option>

                <option value="12:00 PM">
                  12:00 PM
                </option>

                <option value="02:00 PM">
                  02:00 PM
                </option>

                <option value="03:00 PM">
                  03:00 PM
                </option>

                <option value="04:00 PM">
                  04:00 PM
                </option>

                <option value="05:00 PM">
                  05:00 PM
                </option>

                <option value="06:00 PM">
                  06:00 PM
                </option>

                <option value="07:00 PM">
                  07:00 PM
                </option>

                <option value="08:00 PM">
                  08:00 PM
                </option>

              </select>

            </div>

          </div>


          {/* ================= PAYMENT ================= */}

          <div className="section-title session-section">

            <span>💳</span>

            <div>

              <h2>
                Payment Method
              </h2>

              <p>
                Choose how you want to pay
              </p>

            </div>

          </div>


          <div className="payment-options">

            {/* CASH */}

            <label
              className={`payment-card ${
                formData.paymentMethod === "cash"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={
                  formData.paymentMethod === "cash"
                }
                onChange={handleChange}
              />

              <div className="payment-icon">
                💵
              </div>

              <div>

                <strong>
                  Cash
                </strong>

                <p>
                  Pay directly during the session
                </p>

              </div>

            </label>


            {/* QR */}

            <label
              className={`payment-card ${
                formData.paymentMethod === "qr"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="paymentMethod"
                value="qr"
                checked={
                  formData.paymentMethod === "qr"
                }
                onChange={handleChange}
              />

              <div className="payment-icon">
                📱
              </div>

              <div>

                <strong>
                  QR Payment
                </strong>

                <p>
                  Scan QR to make payment
                </p>

              </div>

            </label>

          </div>


          {/* QR AREA */}

          {formData.paymentMethod === "qr" && (

            <div className="qr-box">

              <div className="qr-placeholder">
                <span>
                  QR
                </span>
              </div>

              <div>

                <h3>
                  QR Payment
                </h3>

                <p>
                  QR payment will be available
                  here.
                </p>

                <small>
                  Payment verification will be
                  added later.
                </small>

              </div>

            </div>

          )}


          {/* ================= MESSAGE ================= */}

          <div className="form-group message-group">

            <label>
              Additional Message
              <span>
                (Optional)
              </span>
            </label>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us anything you'd like the provider to know..."
              rows="4"
            />

          </div>


          {/* ================= ERROR ================= */}

          {error && (

            <div className="message-box error-box">
              ❌ {error}
            </div>

          )}


          {/* ================= SUCCESS ================= */}

          {success && (

            <div className="message-box success-box">
              ✅ {success}
            </div>

          )}


          {/* ================= BOOK BUTTON ================= */}

          <button
            type="submit"
            disabled={loading}
            className="book-button"
          >

            {loading ? (
              <>
                <span className="button-spinner"></span>
                Sending Request...
              </>
            ) : (
              <>
                📅 Book Session
              </>
            )}

          </button>


          <p className="secure-note">
            🔒 Your booking information will only
            be shared with Swastprova and your
            selected provider.
          </p>

        </form>

      </main>


      {/* ================= CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .booking-page {
          min-height: 100vh;

          background:
            linear-gradient(
              135deg,
              #f8fafc,
              #eef2ff,
              #fdf2f8
            );

          color: #0f172a;

          padding-bottom: 60px;
        }


        /* HEADER */

        .booking-header {
          background: #ffffff;

          border-bottom:
            1px solid #e2e8f0;

          padding:
            22px 32px;
        }


        .back-button {
          border: none;

          background: transparent;

          color: #475569;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          padding: 6px 0;

          margin-bottom: 18px;
        }


        .back-button:hover {
          color: #2563eb;
        }


        .header-content {
          max-width: 1100px;

          margin: auto;

          display: flex;

          align-items: center;

          gap: 15px;
        }


        .header-icon {
          width: 58px;
          height: 58px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #ede9fe
            );

          font-size: 27px;

          flex-shrink: 0;
        }


        .small-title {
          margin: 0 0 3px;

          color: #2563eb;

          font-size: 11px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 1.2px;
        }


        .header-content h1 {
          margin: 0;

          font-size: 30px;

          font-weight: 900;

          line-height: 1.2;
        }


        .header-content p:last-child {
          margin: 5px 0 0;

          color: #64748b;

          font-size: 13px;
        }


        /* CONTAINER */

        .booking-container {
          width: 100%;

          max-width: 900px;

          margin: 30px auto;

          padding: 0 20px;
        }


        /* PROVIDER */

        .provider-summary {
          display: flex;

          align-items: center;

          gap: 15px;

          padding: 20px;

          background: #ffffff;

          border:
            1px solid #e2e8f0;

          border-radius: 20px;

          box-shadow:
            0 5px 20px
            rgba(15,23,42,0.05);

          margin-bottom: 20px;
        }


        .provider-summary-icon {
          width: 55px;
          height: 55px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background: #f1f5f9;

          font-size: 25px;

          flex-shrink: 0;
        }


        .provider-summary-info {
          flex: 1;

          min-width: 0;
        }


        .provider-type {
          display: inline-block;

          padding: 4px 9px;

          border-radius: 999px;

          background: #dbeafe;

          color: #1d4ed8;

          font-size: 9px;

          font-weight: 800;

          text-transform: uppercase;
        }


        .provider-summary-info h2 {
          margin: 5px 0 2px;

          font-size: 19px;

          font-weight: 900;
        }


        .provider-summary-info p {
          margin: 0;

          color: #64748b;

          font-size: 12px;
        }


        .session-price {
          text-align: right;

          flex-shrink: 0;
        }


        .session-price span {
          display: block;

          color: #94a3b8;

          font-size: 10px;
        }


        .session-price strong {
          display: block;

          margin-top: 3px;

          color: #16a34a;

          font-size: 23px;

          font-weight: 900;
        }


        /* FORM */

        .booking-form {
          background: #ffffff;

          border:
            1px solid #e2e8f0;

          border-radius: 22px;

          padding: 28px;

          box-shadow:
            0 5px 25px
            rgba(15,23,42,0.05);
        }


        .section-title {
          display: flex;

          align-items: center;

          gap: 11px;

          margin-bottom: 20px;
        }


        .section-title > span {
          width: 40px;
          height: 40px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #f1f5f9;

          font-size: 18px;
        }


        .section-title h2 {
          margin: 0;

          font-size: 18px;

          font-weight: 900;
        }


        .section-title p {
          margin: 2px 0 0;

          color: #94a3b8;

          font-size: 11px;
        }


        .session-section {
          margin-top: 30px;
        }


        .form-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 15px;
        }


        .form-group {
          min-width: 0;
        }


        .form-group label {
          display: block;

          margin-bottom: 7px;

          color: #334155;

          font-size: 12px;

          font-weight: 800;
        }


        .form-group label span {
          color: #94a3b8;

          font-weight: 500;

          margin-left: 4px;
        }


        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;

          padding:
            13px 14px;

          border:
            1px solid #e2e8f0;

          border-radius: 11px;

          background: #f8fafc;

          color: #0f172a;

          font-family: inherit;

          font-size: 13px;

          outline: none;

          transition: 0.2s ease;
        }


        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          background: #ffffff;

          border-color: #3b82f6;

          box-shadow:
            0 0 0 3px
            rgba(59,130,246,0.1);
        }


        .form-group textarea {
          resize: vertical;

          min-height: 100px;
        }


        .message-group {
          margin-top: 25px;
        }


        /* PAYMENT */

        .payment-options {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 12px;
        }


        .payment-card {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 15px;

          border:
            1px solid #e2e8f0;

          border-radius: 14px;

          background: #ffffff;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .payment-card:hover {
          border-color: #93c5fd;

          background: #f8fbff;
        }


        .payment-card.selected {
          border-color: #3b82f6;

          background: #eff6ff;

          box-shadow:
            0 0 0 2px
            rgba(59,130,246,0.08);
        }


        .payment-card input {
          accent-color: #2563eb;
        }


        .payment-icon {
          width: 40px;
          height: 40px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #f1f5f9;

          font-size: 19px;

          flex-shrink: 0;
        }


        .payment-card strong {
          display: block;

          color: #334155;

          font-size: 13px;
        }


        .payment-card p {
          margin: 3px 0 0;

          color: #94a3b8;

          font-size: 10px;
        }


        /* QR */

        .qr-box {
          display: flex;

          align-items: center;

          gap: 15px;

          margin-top: 15px;

          padding: 18px;

          border:
            1px dashed #93c5fd;

          border-radius: 15px;

          background: #eff6ff;
        }


        .qr-placeholder {
          width: 100px;
          height: 100px;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #ffffff;

          border:
            5px solid #0f172a;

          flex-shrink: 0;
        }


        .qr-placeholder span {
          font-size: 24px;

          font-weight: 900;

          color: #0f172a;
        }


        .qr-box h3 {
          margin: 0;

          font-size: 15px;
        }


        .qr-box p {
          margin: 5px 0;

          color: #64748b;

          font-size: 12px;
        }


        .qr-box small {
          color: #94a3b8;

          font-size: 10px;
        }


        /* MESSAGES */

        .message-box {
          margin-top: 18px;

          padding: 13px 15px;

          border-radius: 11px;

          font-size: 12px;

          font-weight: 700;

          line-height: 1.5;
        }


        .error-box {
          background: #fef2f2;

          border:
            1px solid #fecaca;

          color: #b91c1c;
        }


        .success-box {
          background: #f0fdf4;

          border:
            1px solid #bbf7d0;

          color: #15803d;
        }


        /* BUTTON */

        .book-button {
          width: 100%;

          margin-top: 22px;

          padding: 15px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          border: none;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          color: #ffffff;

          font-family: inherit;

          font-size: 14px;

          font-weight: 900;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .book-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 8px 20px
            rgba(37,99,235,0.2);
        }


        .book-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }


        .button-spinner {
          width: 17px;
          height: 17px;

          border:
            2px solid
            rgba(255,255,255,0.4);

          border-top-color: #ffffff;

          border-radius: 50%;

          animation:
            spin 0.7s linear infinite;
        }


        .secure-note {
          margin: 13px 0 0;

          text-align: center;

          color: #94a3b8;

          font-size: 10px;

          line-height: 1.5;
        }


        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* ================= MOBILE ================= */

        @media (max-width: 768px) {

          .booking-header {
            padding:
              18px 15px;
          }


          .header-content {
            align-items: flex-start;
          }


          .header-icon {
            width: 48px;
            height: 48px;

            border-radius: 14px;

            font-size: 22px;
          }


          .header-content h1 {
            font-size: 23px;
          }


          .header-content p:last-child {
            font-size: 11px;
          }


          .booking-container {
            margin: 20px auto;

            padding:
              0 12px;
          }


          .provider-summary {
            padding: 15px;

            border-radius: 17px;
          }


          .provider-summary-icon {
            width: 45px;
            height: 45px;

            border-radius: 12px;

            font-size: 20px;
          }


          .provider-summary-info h2 {
            font-size: 16px;
          }


          .session-price strong {
            font-size: 19px;
          }


          .booking-form {
            padding: 20px 15px;

            border-radius: 18px;
          }


          .form-grid {
            grid-template-columns: 1fr;
          }


          .payment-options {
            grid-template-columns: 1fr;
          }

        }


        @media (max-width: 480px) {

          .booking-header {
            padding:
              15px 12px;
          }


          .back-button {
            margin-bottom: 13px;
          }


          .header-icon {
            width: 42px;
            height: 42px;

            font-size: 19px;
          }


          .header-content h1 {
            font-size: 20px;
          }


          .header-content p:last-child {
            font-size: 10px;
          }


          .booking-container {
            padding:
              0 8px;
          }


          .provider-summary {
            align-items: flex-start;

            flex-wrap: wrap;
          }


          .provider-summary-info {
            flex: 1;
          }


          .session-price {
            width: 100%;

            padding-top: 8px;

            border-top:
              1px solid #f1f5f9;

            text-align: left;
          }


          .session-price strong {
            font-size: 18px;
          }


          .booking-form {
            padding:
              18px 12px;
          }


          .section-title h2 {
            font-size: 16px;
          }


          .section-title > span {
            width: 36px;
            height: 36px;

            font-size: 16px;
          }


          .qr-box {
            align-items: flex-start;

            flex-direction: column;
          }


          .qr-placeholder {
            width: 90px;
            height: 90px;
          }

        }

      `}</style>

    </div>
  );
}