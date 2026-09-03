import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

import { askGemini } from "./gemini.js";
import { analyzeAssessment } from "./services/assessmentAI.js";
import { calculateSVI } from "./services/sviEngine.js";

dotenv.config();

/* =========================
   APP CONFIGURATION
========================= */

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

/* =========================
   ENVIRONMENT CHECK
========================= */

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing");
} else {
  console.log("✅ GEMINI_API_KEY loaded");
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS is missing");
} else {
  console.log("✅ Email configuration loaded");
}

/* =========================
   OTP STORAGE
========================= */

const loginOTPs = new Map();

/* =========================
   OTP GENERATOR
========================= */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* =========================
   NODEMAILER TRANSPORTER
========================= */

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* =========================
   HOME ROUTE
========================= */

app.get("/", (req, res) => {
  res.status(200).send("🚀 Swastprova Backend Running...");
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

/* =========================
   LOGIN - SEND OTP
========================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 LOGIN REQUEST:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured",
      });
    }

    const otp = generateOTP();

    const expiresAt = Date.now() + 5 * 60 * 1000;

    loginOTPs.set(email.toLowerCase(), {
      otp,
      expiresAt,
      attempts: 0,
    });

    console.log(`🔢 OTP generated for ${email}`);

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "🔐 Swastprova Login Verification OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 12px;
        ">

          <h2 style="text-align:center;">
            🩷 Swastprova
          </h2>

          <h3>Login Verification</h3>

          <p>Your Swastprova login OTP is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 25px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for <strong>5 minutes</strong>.
          </p>

          <p>
            If you did not request this OTP, please ignore this email.
          </p>

          <br />

          <p>
            Regards,<br />
            <strong>Swastprova Team</strong>
          </p>

        </div>
      `,
    });

    console.log(`📩 OTP sent successfully to ${email}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    console.error("Error message:", error?.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send login OTP",
    });
  }
});

/* =========================
   VERIFY LOGIN OTP
========================= */

app.post("/login/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("🔎 VERIFY OTP:", email);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const key = email.toLowerCase();

    const savedOTP = loginOTPs.get(key);

    if (!savedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (Date.now() > savedOTP.expiresAt) {
      loginOTPs.delete(key);

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (savedOTP.attempts >= 5) {
      loginOTPs.delete(key);

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    if (savedOTP.otp !== otp.toString()) {
      savedOTP.attempts += 1;

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    loginOTPs.delete(key);

    console.log(`✅ OTP VERIFIED: ${email}`);

    return res.status(200).json({
      success: true,
      message: "Login successful",

      user: {
        email: email.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("❌ OTP VERIFY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
});

/* =========================
   RESEND LOGIN OTP
========================= */

app.post("/login/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured",
      });
    }

    const otp = generateOTP();

    const expiresAt = Date.now() + 5 * 60 * 1000;

    loginOTPs.set(email.toLowerCase(), {
      otp,
      expiresAt,
      attempts: 0,
    });

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "🔐 Swastprova New Login OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 12px;
        ">

          <h2 style="text-align:center;">
            🩷 Swastprova
          </h2>

          <h3>New Login OTP</h3>

          <p>Your new OTP is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 25px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for <strong>5 minutes</strong>.
          </p>

          <br />

          <p>
            Regards,<br />
            <strong>Swastprova Team</strong>
          </p>

        </div>
      `,
    });

    console.log(`📩 New OTP sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ RESEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
});

/* =========================
   CONTACT FORM
========================= */

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured",
      });
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      replyTo: email,

      to: process.env.EMAIL_USER,

      subject: `📩 New Message from ${name}`,

      html: `
        <div style="font-family: Arial, sans-serif;">

          <h2>📩 New Contact Message</h2>

          <p>
            <strong>Name:</strong> ${name}
          </p>

          <p>
            <strong>Email:</strong> ${email}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div style="
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
          ">
            ${message}
          </div>

        </div>
      `,
    });

    console.log(`📩 Contact message received from ${email}`);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ CONTACT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

/* =========================
   CONNECT MENTOR
========================= */

app.post("/connect-mentor", async (req, res) => {
  try {
    const { mentorName, mentorField } = req.body;

    if (!mentorName || !mentorField) {
      return res.status(400).json({
        success: false,
        message: "Missing mentor data",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured",
      });
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: process.env.EMAIL_USER,

      subject: "🎯 New Mentor Request",

      html: `
        <div style="font-family: Arial, sans-serif;">

          <h2>🎯 New Mentor Request</h2>

          <p>
            <strong>Mentor Name:</strong>
            ${mentorName}
          </p>

          <p>
            <strong>Field:</strong>
            ${mentorField}
          </p>

          <p>
            A new mentor connection request has been received.
          </p>

        </div>
      `,
    });

    console.log(
      `🎯 Mentor request received: ${mentorName}`
    );

    return res.status(200).json({
      success: true,
      message: "Mentor request sent",
    });
  } catch (error) {
    console.error("❌ MENTOR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed mentor request",
    });
  }
});

/* =========================
   AI STRESS & TRAUMA ASSESSMENT
========================= */

app.post("/assessment/analyze", async (req, res) => {
  try {
    console.log("🧠 ASSESSMENT API HIT");

    const {
      text = "",
      answers = {},
    } = req.body;

    /* ---------- VALIDATION ---------- */

    const hasText =
      typeof text === "string" &&
      text.trim().length > 0;

    const hasAnswers =
      answers &&
      typeof answers === "object" &&
      Object.keys(answers).length > 0;

    if (!hasText && !hasAnswers) {
      return res.status(400).json({
        success: false,
        message: "Assessment information is required",
      });
    }

    /* ---------- GEMINI API CHECK ---------- */

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Gemini API key missing");

      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured",
      });
    }

    /* ---------- AI ANALYSIS ---------- */

    console.log("🤖 Running assessment AI...");

    const aiResult = await analyzeAssessment({
      text,
      answers,
    });

    console.log(
      "✅ Assessment AI analysis received"
    );

    /* ---------- SVI CALCULATION ---------- */

    const sviResult = calculateSVI(aiResult);

    console.log(
      "📊 SVI SCORE:",
      sviResult.sviScore
    );

    console.log(
      "⚠️ RISK LEVEL:",
      sviResult.riskLevel
    );

    /* ---------- RESPONSE ---------- */

    return res.status(200).json({
      success: true,

      assessment: {
        indicators:
          aiResult.indicators || [],

        confidence:
          typeof aiResult.confidence === "number"
            ? aiResult.confidence
            : 0,

        recommendedSupport:
          aiResult.recommendedSupport || [],
      },

      sviScore:
        sviResult.sviScore,

      riskLevel:
        sviResult.riskLevel,
    });

  } catch (error) {
    console.error(
      "❌ ASSESSMENT ERROR:",
      error
    );

    console.error(
      "Error message:",
      error?.message || error
    );

    return res.status(500).json({
      success: false,
      message: "Assessment analysis failed",
    });
  }
});

/* =========================
   GEMINI CHAT
========================= */

app.post("/chat", async (req, res) => {
  try {
    console.log("🔥 CHAT HIT");

    const { message } = req.body;

    console.log(
      "📝 User message:",
      message
    );

    if (
      !message ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Message required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "❌ Gemini API key missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "Gemini API key is not configured",
      });
    }

    console.log(
      "🤖 Sending request to Gemini..."
    );

    const reply = await askGemini(message);

    console.log(
      "✅ Gemini response received"
    );

    if (
      !reply ||
      !reply.trim()
    ) {
      console.error(
        "❌ Empty AI response"
      );

      return res.status(500).json({
        success: false,
        message:
          "AI returned an empty response",
      });
    }

    console.log(
      "🤖 AI REPLY:",
      reply
    );

    return res.status(200).json({
      success: true,
      reply: reply.trim(),
    });

  } catch (error) {
    console.error(
      "❌ AI ERROR:",
      error
    );

    console.error(
      "Error message:",
      error?.message
    );

    console.error(
      "Error status:",
      error?.status
    );

    console.error(
      "Error name:",
      error?.name
    );

    return res.status(500).json({
      success: false,
      message: "AI error occurred",
    });
  }
});

/* =========================
   BOOK APPOINTMENT
========================= */

app.post("/book-appointment", async (req, res) => {
  try {
    console.log("📅 BOOKING API HIT");

    const {
      customerName,
      customerEmail,
      customerPhone,
      providerName,
      providerRole,
      providerEmail,
      date,
      time,
      paymentMethod,
      sessionFee,
      message,
    } = req.body;

    console.log(
      "📋 Booking data:",
      req.body
    );

    /* ---------- VALIDATION ---------- */

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !providerName ||
      !providerEmail ||
      !date ||
      !time ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required booking details are missing",
      });
    }

    /* ---------- EMAIL CHECK ---------- */

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.error(
        "❌ Email service is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured",
      });
    }

    /* ---------- CREATE TRANSPORTER ---------- */

    const transporter =
      createTransporter();

    /* ---------- ADMIN EMAIL ---------- */

    const adminEmail =
      process.env.ADMIN_EMAIL ||
      process.env.EMAIL_USER;

    /* ---------- ROLE ---------- */

    const readableRole =
      providerRole === "psychologist"
        ? "Psychologist"
        : "Mentor";

    /* ---------- SEND EMAIL ---------- */

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: [
        adminEmail,
        providerEmail,
      ],

      replyTo: customerEmail,

      subject:
        `📅 New ${readableRole} Session Booking - ${providerName}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: auto;
          padding: 25px;
          border: 1px solid #ddd;
          border-radius: 12px;
        ">

          <h2 style="
            text-align: center;
            margin-bottom: 25px;
          ">
            📅 New ${readableRole} Session Booking
          </h2>

          <h3>👨‍⚕️ Provider Details</h3>

          <p>
            <strong>Name:</strong>
            ${providerName}
          </p>

          <p>
            <strong>Role:</strong>
            ${readableRole}
          </p>

          <p>
            <strong>Email:</strong>
            ${providerEmail}
          </p>

          <hr />

          <h3>👤 Customer Details</h3>

          <p>
            <strong>Name:</strong>
            ${customerName}
          </p>

          <p>
            <strong>Email:</strong>
            ${customerEmail}
          </p>

          <p>
            <strong>Phone:</strong>
            ${customerPhone}
          </p>

          <hr />

          <h3>🗓️ Session Details</h3>

          <p>
            <strong>Date:</strong>
            ${date}
          </p>

          <p>
            <strong>Time:</strong>
            ${time}
          </p>

          <p>
            <strong>Payment Method:</strong>
            ${paymentMethod}
          </p>

          <p>
            <strong>Session Fee:</strong>
            ₹${sessionFee || "500"}
          </p>

          ${
            message
              ? `
                <p>
                  <strong>Customer Message:</strong>
                </p>

                <div style="
                  padding: 15px;
                  background: #f5f5f5;
                  border-radius: 8px;
                ">
                  ${message}
                </div>
              `
              : ""
          }

          <hr />

          <p style="
            text-align: center;
            color: #666;
          ">
            This booking request was submitted through
            <strong>Swastprova</strong>.
          </p>

        </div>
      `,
    });

    console.log(
      `📩 Booking email sent to admin and provider: ${providerEmail}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Booking request sent successfully",
    });

  } catch (error) {
    console.error(
      "❌ BOOKING ERROR:",
      error
    );

    console.error(
      "Error message:",
      error?.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send booking request",
    });
  }
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  console.log(
    `❌ ROUTE NOT FOUND: ${req.method} ${req.originalUrl}`
  );

  return res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "❌ SERVER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    "===================================="
  );

  console.log(
    "🚀 Swastprova Backend Running"
  );

  console.log(
    `🌐 Port: ${PORT}`
  );

  console.log(
    "📅 Booking API: /book-appointment"
  );

  console.log(
    "💬 Chat API: /chat"
  );

  console.log(
    "🧠 Assessment API: /assessment/analyze"
  );

  console.log(
    "🔐 Login API: /login"
  );

  console.log(
    "===================================="
  );
});