import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function BookSession() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  // -------------------------------
  // HANDLE INPUT
  // -------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------------
  // SUBMIT BOOKING
  // -------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({
      type: "",
      message: "",
    });

    // Provider email required
    if (!providerEmail) {
      setStatus({
        type: "error",
        message:
          "Provider email is not available. Please go back and select the provider again.",
      });
      return;
    }

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.date ||
      !formData.time
    ) {
      setStatus({
        type: "error",
        message: "Please fill all required booking details.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),

        providerName,
        providerRole,
        providerEmail,

        date: formData.date,
        time: formData.time,

        paymentMethod: formData.paymentMethod,
        sessionFee,

        message: formData.message.trim(),
      };

      const response = await fetch(
        "https://swastprova-2.onrender.com/book-appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      // Safely read response
      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          success: false,
          message:
            "Server returned an invalid response. Please try again later.",
        };
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to send booking request."
        );
      }

      // Success
      setStatus({
        type: "success",
        message:
          data.message ||
          "Session request sent successfully! Confirmation emails have been sent.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        paymentMethod: "cash",
        message: "",
      });
    } catch (error) {
      console.error("BOOKING ERROR:", error);

      setStatus({
        type: "error",
        message:
          error.message ||
          "Unable to send booking request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "20px",
            color: "#2563eb",
          }}
        >
          ← Back
        </button>

        {/* MAIN CARD */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* HEADER */}

          <div style={{ marginBottom: "25px" }}>
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "30px",
                color: "#111827",
              }}
            >
              Book a Session
            </h1>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "15px",
              }}
            >
              Schedule a session with your selected provider.
            </p>
          </div>

          {/* PROVIDER DETAILS */}

          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "25px",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "20px",
                color: "#1e3a8a",
              }}
            >
              Provider Details
            </h2>

            <p style={{ margin: "7px 0" }}>
              <strong>Name:</strong> {providerName}
            </p>

            <p style={{ margin: "7px 0" }}>
              <strong>Role:</strong> {providerRole}
            </p>

            <p style={{ margin: "7px 0" }}>
              <strong>Session Fee:</strong> ₹{sessionFee}
            </p>

            <p
              style={{
                margin: "7px 0",
                wordBreak: "break-word",
              }}
            >
              <strong>Email:</strong> {providerEmail || "Not available"}
            </p>
          </div>

          {/* STATUS MESSAGE */}

          {status.message && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
                background:
                  status.type === "success"
                    ? "#ecfdf5"
                    : "#fef2f2",
                border:
                  status.type === "success"
                    ? "1px solid #a7f3d0"
                    : "1px solid #fecaca",
                color:
                  status.type === "success"
                    ? "#047857"
                    : "#b91c1c",
              }}
            >
              {status.message}
            </div>
          )}

          {/* BOOKING FORM */}

          <form onSubmit={handleSubmit}>
            {/* NAME */}

            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Full Name *
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                style={inputStyle}
              />
            </div>

            {/* EMAIL */}

            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="email"
                style={labelStyle}
              >
                Email Address *
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={inputStyle}
              />
            </div>

            {/* PHONE */}

            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="phone"
                style={labelStyle}
              >
                Phone Number *
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                style={inputStyle}
              />
            </div>

            {/* DATE + TIME */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
                marginBottom: "18px",
              }}
            >
              <div>
                <label
                  htmlFor="date"
                  style={labelStyle}
                >
                  Session Date *
                </label>

                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="time"
                  style={labelStyle}
                >
                  Session Time *
                </label>

                <input
                  id="time"
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* PAYMENT */}

            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="paymentMethod"
                style={labelStyle}
              >
                Payment Method
              </label>

              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="cash">
                  Cash / Pay Later
                </option>

                <option value="upi">
                  UPI
                </option>

                <option value="online">
                  Online Payment
                </option>
              </select>
            </div>

            {/* MESSAGE */}

            <div style={{ marginBottom: "25px" }}>
              <label
                htmlFor="message"
                style={labelStyle}
              >
                Additional Message
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us anything you'd like the provider to know..."
                rows="5"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "120px",
                }}
              />
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "10px",
                padding: "15px 20px",
                background: loading
                  ? "#93c5fd"
                  : "#2563eb",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Sending Request..."
                : "Book Session"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------------------
// STYLES
// -------------------------------

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "9px",
  fontSize: "15px",
  outline: "none",
  background: "#ffffff",
};

export default BookSession;