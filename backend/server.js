import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

/* ================= ENV CHECK ================= */

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing");
} else {
  console.log("✅ GEMINI_API_KEY loaded");
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS is missing");
}

/* ================= GEMINI SETUP ================= */

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

/* ================= OTP STORAGE ================= */

// Temporary OTP storage
const loginOTPs = new Map();

/* ================= HELPER FUNCTIONS ================= */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.status(200).send("🚀 Swastprova Backend Running...");
});

/* ================= SERVER HEALTH ================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

/* =========================================================
   ================= LOGIN + OTP ===========================
   ========================================================= */

/* ================= LOGIN - SEND OTP ================= */

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

    // Generate OTP
    const otp = generateOTP();

    // OTP valid for 5 minutes
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Store OTP
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
          background: #f8fafc;
          padding: 30px;
        ">

          <div style="
            max-width: 500px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          ">

            <h2 style="
              color: #2563eb;
              margin-bottom: 10px;
            ">
              Swastprova
            </h2>

            <h3>
              Login Verification
            </h3>

            <p>
              Your login verification OTP is:
            </p>

            <div style="
              font-size: 34px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #2563eb;
              padding: 20px 0;
            ">
              ${otp}
            </div>

            <p>
              This OTP is valid for
              <strong>5 minutes</strong>.
            </p>

            <p style="
              color: #64748b;
              font-size: 14px;
            ">
              If you did not request this OTP,
              please ignore this email.
            </p>

            <hr />

            <p style="
              color: #94a3b8;
              font-size: 12px;
            ">
              Swastprova — Building a Healthier
              & Stronger Future
            </p>

          </div>
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

/* ================= VERIFY OTP ================= */

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

    /* OTP EXPIRY */

    if (Date.now() > savedOTP.expiresAt) {
      loginOTPs.delete(key);

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    /* OTP ATTEMPTS */

    if (savedOTP.attempts >= 5) {
      loginOTPs.delete(key);

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    /* WRONG OTP */

    if (savedOTP.otp !== otp.toString()) {
      savedOTP.attempts += 1;

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    /* OTP CORRECT */

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

/* ================= RESEND OTP ================= */

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
          font-family: Arial;
          padding: 30px;
        ">

          <h2 style="
            color: #2563eb;
          ">
            Swastprova
          </h2>

          <p>
            Your new login OTP is:
          </p>

          <h1 style="
            color: #2563eb;
            letter-spacing: 8px;
          ">
            ${otp}
          </h1>

          <p>
            This OTP is valid for
            <strong>5 minutes</strong>.
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

/* =========================================================
   ================= CONTACT API ===========================
   ========================================================= */

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,

      subject: `📩 New Message from ${name}`,

      html: `
        <div style="font-family:Arial;padding:20px">

          <h2>New Contact Message</h2>

          <p>
            <b>Name:</b> ${name}
          </p>

          <p>
            <b>Email:</b> ${email}
          </p>

          <p>
            <b>Message:</b> ${message}
          </p>

        </div>
      `,
    });

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

/* =========================================================
   ================= MENTOR API ============================
   ========================================================= */

app.post("/connect-mentor", async (req, res) => {
  try {
    const { mentorName, mentorField } = req.body;

    if (!mentorName || !mentorField) {
      return res.status(400).json({
        success: false,
        message: "Missing mentor data",
      });
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,

      subject: "🎯 New Mentor Request",

      html: `
        <div style="
          font-family:Arial;
          padding:20px;
        ">

          <h2>
            Mentor Request
          </h2>

          <p>
            <b>Mentor:</b>
            ${mentorName}
          </p>

          <p>
            <b>Field:</b>
            ${mentorField}
          </p>

        </div>
      `,
    });

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

/* =========================================================
   ================= AI CHAT ===============================
   ========================================================= */

app.post("/chat", async (req, res) => {
  try {
    console.log("🔥 CHAT HIT");

    const { message } = req.body;

    console.log("📝 User message:", message);

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Gemini API key missing");

      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured",
      });
    }

    if (!ai) {
      return res.status(500).json({
        success: false,
        message: "Gemini AI is not initialized",
      });
    }

    const prompt = `
You are Swastprova AI.

Rules:

- Give helpful answers.
- Use simple language.
- Be supportive and motivational.
- Do not make up facts.
- Ask one useful reflection question when appropriate.
- Give one practical action step when appropriate.

User:
${message}
`;

    console.log(
      "🤖 Sending request to Gemini..."
    );

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log(
      "✅ Gemini response received"
    );

    const reply = response.text;

    if (!reply || !reply.trim()) {
      console.error(
        "❌ Empty AI response"
      );

      return res.status(500).json({
        success: false,
        message: "AI returned an empty response",
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

/* =========================================================
   ================= START SERVER ==========================
   ========================================================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Swastprova Backend Running on port ${PORT}`
  );

  console.log(
    `🌐 Port: ${PORT}`
  );
});