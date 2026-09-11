import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import multer from "multer";

import {
  askGemini,
  generateSVIInsight,
  analyzeVoiceWithGemini,
} from "./gemini.js";

import { analyzeAssessment } from "./services/assessmentAI.js";
import { calculateSVI } from "./services/sviEngine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://swastprova.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin
      // Example: Postman, curl, server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json({ limit: "10mb" }));

/* =========================================================
   MULTER - VOICE AUDIO UPLOAD
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "audio/webm",
      "audio/ogg",
      "audio/wav",
      "audio/x-wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/m4a",
    ];

    const baseMimeType = String(file.mimetype || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (allowedMimeTypes.includes(baseMimeType)) {
      cb(null, true);
    } else {
      console.log(
        "Unsupported audio type:",
        file.mimetype
      );

      cb(
        new Error(
          `Unsupported audio format: ${file.mimetype}`
        )
      );
    }
  },
});

/* =========================================================
   ENVIRONMENT CHECK
========================================================= */

console.log("=================================");
console.log("SWASTPROVA BACKEND");
console.log("=================================");

console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY
    ? "Loaded"
    : "Missing"
);

console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER
    ? "Loaded"
    : "Missing"
);

console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? "Loaded"
    : "Missing"
);

console.log(
  "ADMIN_EMAIL:",
  process.env.ADMIN_EMAIL ||
    "swastprova@gmail.com"
);

console.log("PORT:", PORT);

/* =========================================================
   EMAIL CONFIGURATION
========================================================= */

const createTransporter = () => {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.warn(
      "⚠️ Email credentials are missing."
    );

    return null;
  }

  const transporter =
    nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

  return transporter;
};

const transporter = createTransporter();

/* =========================================================
   NODEMAILER SMTP VERIFICATION
========================================================= */

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error(
        "❌ NODEMAILER SMTP ERROR:"
      );

      console.error(error);
    } else {
      console.log(
        "✅ NODEMAILER SMTP READY"
      );
    }
  });
}

/* =========================================================
   HELPERS
========================================================= */

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

const getAdminEmail = () => {
  return (
    process.env.ADMIN_EMAIL ||
    "swastprova@gmail.com"
  );
};

/* =========================================================
   OTP STORAGE
========================================================= */

const loginOTPs = new Map();
const registerOTPs = new Map();

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "SWASTPROVA Backend is running 🚀",
    status: "online",
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message:
      "SWASTPROVA backend healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   LOGIN - SEND OTP
========================================================= */

app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address",
      });
    }

    if (!transporter) {
      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured",
      });
    }

    const otp = generateOTP();

    loginOTPs.set(normalizedEmail, {
      otp,
      expiresAt:
        Date.now() + 5 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,

      subject:
        "SWASTPROVA Login OTP",

      text: `
Your SWASTPROVA login OTP is:

${otp}

This OTP is valid for 5 minutes.

If you did not request this login, please ignore this email.

SWASTPROVA Team
      `,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          max-width:600px;
          margin:auto;
          padding:30px;
          border:1px solid #ddd;
          border-radius:12px;
        ">
          <h2>SWASTPROVA Login</h2>

          <p>Your login OTP is:</p>

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            margin:25px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for
            <strong>5 minutes</strong>.
          </p>

          <p>
            If you did not request this login,
            please ignore this email.
          </p>

          <hr />

          <p>SWASTPROVA Team</p>
        </div>
      `,
    });

    console.log(
      `Login OTP sent to ${normalizedEmail}`
    );

    return res.json({
      success: true,
      message:
        "OTP sent successfully",
    });
  } catch (error) {
    console.error(
      "LOGIN OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send login OTP",
    });
  }
});

/* =========================================================
   LOGIN - VERIFY OTP
========================================================= */

app.post(
  "/login/verify-otp",
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const record =
        loginOTPs.get(normalizedEmail);

      if (!record) {
        return res.status(400).json({
          success: false,
          message:
            "OTP not found. Please request a new OTP.",
        });
      }

      if (Date.now() > record.expiresAt) {
        loginOTPs.delete(normalizedEmail);

        return res.status(400).json({
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        });
      }

      if (
        String(otp).trim() !==
        record.otp
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      loginOTPs.delete(normalizedEmail);

      return res.json({
        success: true,
        message:
          "Login successful",

        user: {
          email: normalizedEmail,
        },
      });
    } catch (error) {
      console.error(
        "VERIFY LOGIN OTP ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to verify OTP",
      });
    }
  }
);

/* =========================================================
   LOGIN - RESEND OTP
========================================================= */

app.post(
  "/login/resend-otp",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid email address",
        });
      }

      if (!transporter) {
        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured",
        });
      }

      const otp = generateOTP();

      loginOTPs.set(normalizedEmail, {
        otp,
        expiresAt:
          Date.now() + 5 * 60 * 1000,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,

        subject:
          "SWASTPROVA New Login OTP",

        text: `
Your new SWASTPROVA login OTP is:

${otp}

This OTP is valid for 5 minutes.

SWASTPROVA Team
        `,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:30px;
            border:1px solid #ddd;
            border-radius:12px;
          ">
            <h2>SWASTPROVA</h2>

            <p>
              Your new login OTP is:
            </p>

            <h1 style="
              letter-spacing:8px;
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

      console.log(
        `Login OTP resent to ${normalizedEmail}`
      );

      return res.json({
        success: true,
        message:
          "New OTP sent successfully",
      });
    } catch (error) {
      console.error(
        "RESEND LOGIN OTP ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to resend login OTP",
      });
    }
  }
);

/* =========================================================
   REGISTER - SEND OTP
========================================================= */

app.post(
  "/register/send-otp",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      console.log(
        "Register OTP request received:",
        {
          name,
          email,
        }
      );

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and password are required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      if (!transporter) {
        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured",
        });
      }

      const otp = generateOTP();

      registerOTPs.set(
        normalizedEmail,
        {
          otp,
          name: name.trim(),
          email: normalizedEmail,
          password,
          expiresAt:
            Date.now() + 5 * 60 * 1000,
        }
      );

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,

        subject:
          "SWASTPROVA Registration OTP",

        text: `
Hello ${name},

Your SWASTPROVA registration OTP is:

${otp}

This OTP is valid for 5 minutes.

If you did not request this registration, please ignore this email.

SWASTPROVA Team
        `,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:30px;
            border:1px solid #ddd;
            border-radius:12px;
          ">
            <h2>
              Welcome to SWASTPROVA
            </h2>

            <p>
              Hello
              <strong>${name}</strong>,
            </p>

            <p>
              Your registration OTP is:
            </p>

            <div style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              margin:25px 0;
            ">
              ${otp}
            </div>

            <p>
              This OTP is valid for
              <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not request this
              registration, please ignore
              this email.
            </p>

            <hr />

            <p>
              SWASTPROVA Team
            </p>
          </div>
        `,
      });

      console.log(
        `Registration OTP sent to ${normalizedEmail}`
      );

      return res.json({
        success: true,
        message:
          "Registration OTP sent successfully",
      });
    } catch (error) {
      console.error(
        "REGISTER SEND OTP ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send registration OTP",
      });
    }
  }
);

/* =========================================================
   REGISTER - VERIFY OTP
========================================================= */

app.post(
  "/register/verify-otp",
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const record =
        registerOTPs.get(
          normalizedEmail
        );

      if (!record) {
        return res.status(400).json({
          success: false,
          message:
            "OTP not found. Please request a new OTP.",
        });
      }

      if (Date.now() > record.expiresAt) {
        registerOTPs.delete(
          normalizedEmail
        );

        return res.status(400).json({
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        });
      }

      if (
        String(otp).trim() !==
        record.otp
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      registerOTPs.delete(
        normalizedEmail
      );

      return res.json({
        success: true,
        message:
          "Registration OTP verified successfully",

        user: {
          name: record.name,
          email: record.email,

          // Kept for compatibility
          // with current frontend.
          password: record.password,

          verified: true,
        },
      });
    } catch (error) {
      console.error(
        "REGISTER VERIFY OTP ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to verify registration OTP",
      });
    }
  }
);

/* =========================================================
   REGISTER - RESEND OTP
========================================================= */

app.post(
  "/register/resend-otp",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid email address",
        });
      }

      if (!transporter) {
        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured",
        });
      }

      const oldRecord =
        registerOTPs.get(
          normalizedEmail
        );

      const userName =
        name ||
        oldRecord?.name ||
        "User";

      const userPassword =
        password ||
        oldRecord?.password ||
        "";

      const otp = generateOTP();

      registerOTPs.set(
        normalizedEmail,
        {
          otp,
          name: userName,
          email: normalizedEmail,
          password: userPassword,
          expiresAt:
            Date.now() + 5 * 60 * 1000,
        }
      );

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,

        subject:
          "SWASTPROVA New Registration OTP",

        text: `
Your new SWASTPROVA registration OTP is:

${otp}

This OTP is valid for 5 minutes.

SWASTPROVA Team
        `,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:30px;
            border:1px solid #ddd;
            border-radius:12px;
          ">
            <h2>
              SWASTPROVA Registration
            </h2>

            <p>
              Your new registration OTP is:
            </p>

            <h1 style="
              letter-spacing:8px;
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

      console.log(
        `Registration OTP resent to ${normalizedEmail}`
      );

      return res.json({
        success: true,
        message:
          "New registration OTP sent successfully",
      });
    } catch (error) {
      console.error(
        "REGISTER RESEND OTP ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to resend registration OTP",
      });
    }
  }
);

/* =========================================================
   CONTACT
========================================================= */

app.post(
  "/contact",
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        subject,
        message,
      } = req.body;

      if (
        !name ||
        !email ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and message are required",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid email address",
        });
      }

      if (!transporter) {
        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured",
        });
      }

      const adminEmail =
        getAdminEmail();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        replyTo: normalizedEmail,

        subject:
          subject ||
          `SWASTPROVA Contact Message from ${name}`,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:700px;
            margin:auto;
            padding:20px;
          ">
            <h2>
              New Contact Message
            </h2>

            <p>
              <strong>Name:</strong>
              ${name}
            </p>

            <p>
              <strong>Email:</strong>
              ${normalizedEmail}
            </p>

            <p>
              <strong>Phone:</strong>
              ${phone || "Not provided"}
            </p>

            <p>
              <strong>Subject:</strong>
              ${subject || "Not provided"}
            </p>

            <hr />

            <p>
              <strong>Message:</strong>
            </p>

            <p>
              ${message}
            </p>
          </div>
        `,
      });

      console.log(
        "Contact email sent successfully"
      );

      return res.json({
        success: true,
        message:
          "Message sent successfully",
      });
    } catch (error) {
      console.error(
        "CONTACT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send message",
      });
    }
  }
);

/* =========================================================
   CONNECT WITH MENTOR
========================================================= */

app.post(
  "/connect-mentor",
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        mentorName,
        mentorEmail,
        message,
      } = req.body;

      if (
        !name ||
        !email ||
        !mentorName
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and mentor name are required",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid email address",
        });
      }

      if (!transporter) {
        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured",
        });
      }

      const adminEmail =
        getAdminEmail();

      const emailTasks = [];

      /* ADMIN EMAIL */

      emailTasks.push(
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          replyTo: normalizedEmail,

          subject:
            `New Mentor Connection Request - ${name}`,

          html: `
            <div style="
              font-family:Arial,sans-serif;
              max-width:700px;
              margin:auto;
              padding:20px;
            ">
              <h2>
                New Mentor Connection Request
              </h2>

              <p>
                <strong>User:</strong>
                ${name}
              </p>

              <p>
                <strong>Email:</strong>
                ${normalizedEmail}
              </p>

              <p>
                <strong>Phone:</strong>
                ${phone || "Not provided"}
              </p>

              <p>
                <strong>Mentor:</strong>
                ${mentorName}
              </p>

              <hr />

              <p>
                <strong>Message:</strong>
              </p>

              <p>
                ${message || "No message provided"}
              </p>
            </div>
          `,
        })
      );

      /* MENTOR EMAIL */

      if (
        mentorEmail &&
        emailRegex.test(
          mentorEmail.trim()
        )
      ) {
        emailTasks.push(
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: mentorEmail.trim(),
            replyTo: normalizedEmail,

            subject:
              `New Connection Request from ${name}`,

            html: `
              <div style="
                font-family:Arial,sans-serif;
                max-width:700px;
                margin:auto;
                padding:20px;
              ">
                <h2>
                  New Mentor Connection Request
                </h2>

                <p>
                  Hello ${mentorName},
                </p>

                <p>
                  <strong>${name}</strong>
                  wants to connect with you.
                </p>

                <p>
                  <strong>Email:</strong>
                  ${normalizedEmail}
                </p>

                <p>
                  <strong>Phone:</strong>
                  ${phone || "Not provided"}
                </p>

                <hr />

                <p>
                  <strong>Message:</strong>
                </p>

                <p>
                  ${message || "No message provided"}
                </p>
              </div>
            `,
          })
        );
      }

      /* USER CONFIRMATION */

      emailTasks.push(
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: normalizedEmail,

          subject:
            "SWASTPROVA Mentor Connection Request Received",

          html: `
            <div style="
              font-family:Arial,sans-serif;
              max-width:700px;
              margin:auto;
              padding:20px;
            ">
              <h2>
                Connection Request Received
              </h2>

              <p>
                Hello ${name},
              </p>

              <p>
                Your request to connect with
                <strong>${mentorName}</strong>
                has been received successfully.
              </p>

              <p>
                The SWASTPROVA team will coordinate
                the next steps.
              </p>

              <br />

              <p>
                SWASTPROVA Team
              </p>
            </div>
          `,
        })
      );

      await Promise.all(emailTasks);

      console.log(
        "Mentor connection emails sent successfully"
      );

      return res.json({
        success: true,
        message:
          "Mentor connection request sent successfully",
      });
    } catch (error) {
      console.error(
        "CONNECT MENTOR ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send mentor connection request",
      });
    }
  }
);

/* =========================================================
   ASSESSMENT ANALYZE
========================================================= */

app.post(
  "/assessment/analyze",
  async (req, res) => {
    try {
      const {
        text = "",
        answers = {},
      } = req.body || {};

      console.log(
        "================================="
      );

      console.log(
        "ASSESSMENT REQUEST RECEIVED"
      );

      console.log(
        "================================="
      );

      console.log(
        "Text:",
        text
      );

      console.log(
        "Answers:",
        answers
      );

      /* -----------------------------------------
         VALIDATION
      ----------------------------------------- */

      if (
        !String(text).trim() &&
        (
          !answers ||
          typeof answers !== "object" ||
          Object.keys(answers).length === 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Assessment information is required.",
        });
      }

      /* -----------------------------------------
         AI ASSESSMENT
      ----------------------------------------- */

      const aiResult =
        await analyzeAssessment({
          text: String(text),
          answers,
        });

      console.log(
        "AI RESULT:",
        aiResult
      );

      /* -----------------------------------------
         SVI CALCULATION
      ----------------------------------------- */

      const sviResult =
        calculateSVI(aiResult);

      console.log(
        "================================="
      );

      console.log(
        "SVI RESULT"
      );

      console.log(
        "================================="
      );

      console.log(
        "SVI Score:",
        sviResult.sviScore
      );

      console.log(
        "Risk Level:",
        sviResult.riskLevel
      );

      console.log(
        "Raw Score:",
        sviResult.rawScore
      );

      console.log(
        "Maximum Weighted Score:",
        sviResult.maximumPossibleWeightedScore
      );

      console.log(
        "Factors:",
        sviResult.factors
      );

      /* -----------------------------------------
         AI INSIGHT
      ----------------------------------------- */

      let insight = null;

      try {
        insight =
          await generateSVIInsight({
            sviScore:
              sviResult.sviScore,

            riskLevel:
              sviResult.riskLevel,

            indicators:
              aiResult.indicators,

            recommendedSupport:
              aiResult.recommendedSupport,

            factors:
              sviResult.factors,

            trauma:
              aiResult.trauma,
          });
      } catch (aiError) {
        console.error(
          "SVI INSIGHT ERROR:",
          aiError
        );
      }

      /* -----------------------------------------
         FINAL RESPONSE
      ----------------------------------------- */

      return res.status(200).json({
        success: true,

        sviScore:
          sviResult.sviScore,

        riskLevel:
          sviResult.riskLevel,

        riskDescription:
          sviResult.riskDescription,

        rawScore:
          sviResult.rawScore,

        maximumPossibleWeightedScore:
          sviResult.maximumPossibleWeightedScore,

        normalized:
          sviResult.normalized,

        formula:
          sviResult.formula,

        indicators:
          aiResult.indicators,

        recommendedSupport:
          aiResult.recommendedSupport,

        stress:
          aiResult.stress,

        fear:
          aiResult.fear,

        sleep:
          aiResult.sleep,

        anxiety:
          aiResult.anxiety,

        socialIsolation:
          aiResult.socialIsolation,

        trauma:
          aiResult.trauma,

        urgency:
          aiResult.urgency,

        confidence:
          aiResult.confidence,

        factors:
          sviResult.factors,

        dominantFactor:
          sviResult.dominantFactor,

        highRiskFactors:
          sviResult.highRiskFactors,

        urgencyReview:
          sviResult.urgency,

        supportRecommendation:
          sviResult.supportRecommendation,

        assessment:
          aiResult,

        svi:
          sviResult,

        insight,
      });
    } catch (error) {
      console.error(
        "❌ ASSESSMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to analyze assessment",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   AI VOICE ASSESSMENT - PS-94
========================================================= */

app.post(
  "/api/voice-assessment",

  upload.single("audio"),

  async (req, res) => {
    try {
      console.log(
        "================================="
      );

      console.log(
        "VOICE ASSESSMENT REQUEST RECEIVED"
      );

      console.log(
        "================================="
      );

      /* -----------------------------------------
         FILE VALIDATION
      ----------------------------------------- */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Audio file is required.",
        });
      }

      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message:
            "Audio data could not be read.",
        });
      }

      console.log(
        "Audio MIME:",
        req.file.mimetype
      );

      console.log(
        "Audio size:",
        req.file.size,
        "bytes"
      );

      /* -----------------------------------------
         MIME NORMALIZATION
      ----------------------------------------- */

      let mimeType =
        req.file.mimetype;

      if (
        mimeType.includes(";")
      ) {
        mimeType =
          mimeType
            .split(";")[0]
            .trim();
      }

      mimeType =
        mimeType.toLowerCase();

      const supportedAudioTypes = [
        "audio/webm",
        "audio/ogg",
        "audio/wav",
        "audio/x-wav",
        "audio/mpeg",
        "audio/mp3",
        "audio/mp4",
        "audio/m4a",
      ];

      if (
        !supportedAudioTypes.includes(
          mimeType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Unsupported audio format: ${mimeType}`,
        });
      }

      /* -----------------------------------------
         GEMINI VOICE ANALYSIS
      ----------------------------------------- */

      const result =
        await analyzeVoiceWithGemini({
          audioBuffer:
            req.file.buffer,

          mimeType,
        });

      console.log(
        "VOICE AI RESULT:",
        result
      );

      /* -----------------------------------------
         FINAL RESPONSE
      ----------------------------------------- */

      return res.status(200).json({
        success: true,

        voiceStressScore:
          Number(
            result.voiceStressScore ?? 0
          ),

        distressScore:
          Number(
            result.distressScore ?? 0
          ),

        riskLevel:
          result.riskLevel ||
          "Unknown",

        voiceMetrics:
          result.voiceMetrics ||
          {},

        indicators:
          Array.isArray(
            result.indicators
          )
            ? result.indicators
            : [],

        recommendedSupport:
          Array.isArray(
            result.recommendedSupport
          )
            ? result.recommendedSupport
            : [],

        summary:
          result.summary || "",

        message:
          result.message || "",

        safetyFlag:
          Boolean(
            result.safetyFlag
          ),

        safetyPriority:
          result.safetyPriority ||
          "Normal",

        confidence:
          result.confidence ||
          "Low",

        analysisSource:
          result.analysisSource ||
          "Gemini AI Voice Screening",

        monitoringType:
          result.monitoringType ||
          "PS-94 Dynamic Distress Monitoring",

        disclaimer:
          result.disclaimer ||
          "AI-assisted screening only. This is not a medical diagnosis.",
      });
    } catch (error) {
      console.error(
        "❌ VOICE ASSESSMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to analyze voice assessment.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   AI CHAT
========================================================= */

app.post(
  "/chat",
  async (req, res) => {
    try {
      const {
        message,
        history = [],
      } = req.body;

      if (
        !message ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message required",
        });
      }

      console.log(
        "Chat message received:",
        message
      );

      const response =
        await askGemini(
          message.trim(),
          history
        );

      return res.json({
        success: true,
        reply: response,
      });
    } catch (error) {
      console.error(
        "CHAT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to process chat",
      });
    }
  }
);

/* =========================================================
   BOOK APPOINTMENT
========================================================= */

app.post(
  "/book-appointment",
  async (req, res) => {
    try {
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
        "Booking request received:",
        {
          customerName,
          customerEmail,
          providerName,
          providerEmail,
          date,
          time,
        }
      );

      /* -----------------------------------------
         VALIDATION
      ----------------------------------------- */

      if (
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !providerName ||
        !providerEmail ||
        !date ||
        !time
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Customer, provider, date and time details are required",
        });
      }

      const normalizedCustomerEmail =
        customerEmail
          .trim()
          .toLowerCase();

      const normalizedProviderEmail =
        providerEmail
          .trim()
          .toLowerCase();

      if (
        !emailRegex.test(
          normalizedCustomerEmail
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid customer email address",
        });
      }

      if (
        !emailRegex.test(
          normalizedProviderEmail
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid provider email address",
        });
      }

      if (!transporter) {
        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured",
        });
      }

      const adminEmail =
        getAdminEmail();

      /* -----------------------------------------
         ADMIN EMAIL
      ----------------------------------------- */

      const adminMail = {
        from: process.env.EMAIL_USER,
        to: adminEmail,

        replyTo:
          normalizedCustomerEmail,

        subject:
          `New Session Booking - ${providerName}`,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:700px;
            margin:auto;
            padding:20px;
          ">
            <h2>
              New SWASTPROVA Session Booking
            </h2>

            <hr />

            <h3>
              Customer Details
            </h3>

            <p>
              <strong>Name:</strong>
              ${customerName}
            </p>

            <p>
              <strong>Email:</strong>
              ${normalizedCustomerEmail}
            </p>

            <p>
              <strong>Phone:</strong>
              ${customerPhone}
            </p>

            <h3>
              Provider Details
            </h3>

            <p>
              <strong>Name:</strong>
              ${providerName}
            </p>

            <p>
              <strong>Role:</strong>
              ${providerRole || "Provider"}
            </p>

            <p>
              <strong>Email:</strong>
              ${normalizedProviderEmail}
            </p>

            <h3>
              Session Details
            </h3>

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
              ${paymentMethod || "Not specified"}
            </p>

            <p>
              <strong>Session Fee:</strong>
              ₹${sessionFee || "500"}
            </p>

            <p>
              <strong>Message:</strong>
              ${message || "No message provided"}
            </p>
          </div>
        `,
      };

      /* -----------------------------------------
         PROVIDER EMAIL
      ----------------------------------------- */

      const providerMail = {
        from: process.env.EMAIL_USER,
        to: normalizedProviderEmail,

        replyTo:
          normalizedCustomerEmail,

        subject:
          `New Session Request from ${customerName}`,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:700px;
            margin:auto;
            padding:20px;
          ">
            <h2>
              New Session Request
            </h2>

            <p>
              Hello ${providerName},
            </p>

            <p>
              You have received a new session
              request through
              <strong>SWASTPROVA</strong>.
            </p>

            <hr />

            <h3>
              Customer
            </h3>

            <p>
              <strong>Name:</strong>
              ${customerName}
            </p>

            <p>
              <strong>Email:</strong>
              ${normalizedCustomerEmail}
            </p>

            <p>
              <strong>Phone:</strong>
              ${customerPhone}
            </p>

            <h3>
              Session
            </h3>

            <p>
              <strong>Date:</strong>
              ${date}
            </p>

            <p>
              <strong>Time:</strong>
              ${time}
            </p>

            <p>
              <strong>Payment:</strong>
              ${paymentMethod || "Not specified"}
            </p>

            <p>
              <strong>Fee:</strong>
              ₹${sessionFee || "500"}
            </p>

            <p>
              <strong>Message:</strong>
              ${message || "No message provided"}
            </p>
          </div>
        `,
      };

      /* -----------------------------------------
         CUSTOMER CONFIRMATION
      ----------------------------------------- */

      const customerMail = {
        from: process.env.EMAIL_USER,
        to: normalizedCustomerEmail,

        subject:
          "SWASTPROVA Session Request Received",

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:700px;
            margin:auto;
            padding:20px;
          ">
            <h2>
              Session Request Received
            </h2>

            <p>
              Hello ${customerName},
            </p>

            <p>
              Your session request has been
              successfully received.
            </p>

            <hr />

            <h3>
              Session Details
            </h3>

            <p>
              <strong>Provider:</strong>
              ${providerName}
            </p>

            <p>
              <strong>Role:</strong>
              ${providerRole || "Provider"}
            </p>

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
              ${paymentMethod || "Not specified"}
            </p>

            <p>
              <strong>Session Fee:</strong>
              ₹${sessionFee || "500"}
            </p>

            <br />

            <p>
              You will receive further confirmation
              from the SWASTPROVA team/provider.
            </p>

            <br />

            <p>
              Thank you for choosing SWASTPROVA.
            </p>
          </div>
        `,
      };

      /* -----------------------------------------
         SEND ALL EMAILS
      ----------------------------------------- */

      await Promise.all([
        transporter.sendMail(adminMail),
        transporter.sendMail(providerMail),
        transporter.sendMail(customerMail),
      ]);

      console.log(
        "Booking emails sent successfully"
      );

      return res.json({
        success: true,
        message:
          "Session request sent successfully! Confirmation emails have been sent.",
      });
    } catch (error) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to process session booking",
      });
    }
  }
);

/* =========================================================
   404 ROUTE
========================================================= */

app.use(
  (req, res) => {
    console.log(
      `404 - ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (err, req, res, next) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      "================================="
    );

    console.log(
      `🚀 SWASTPROVA Backend running on port ${PORT}`
    );

    console.log(
      `🌐 http://localhost:${PORT}`
    );

    console.log(
      "🎙️ Voice Assessment API: /api/voice-assessment"
    );

    console.log(
      "================================="
    );
  }
);