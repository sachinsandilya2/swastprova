import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

/* ================= ENV CHECK ================= */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
}

/* ================= GEMINI SETUP ================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("🚀 Swastprova Backend Running...");
});

/* ================= CONTACT API ================= */
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `📩 New Message from ${name}`,
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("CONTACT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

/* ================= MENTOR API ================= */
app.post("/connect-mentor", async (req, res) => {
  try {
    const { mentorName, mentorField } = req.body;

    if (!mentorName || !mentorField) {
      return res.status(400).json({
        success: false,
        message: "Missing mentor data",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🎯 New Mentor Request",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Mentor Request</h2>
          <p><b>Mentor:</b> ${mentorName}</p>
          <p><b>Field:</b> ${mentorField}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Mentor request sent",
    });

  } catch (error) {
    console.error("MENTOR ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed mentor request",
    });
  }
});

/* ================= AI CHAT ================= */
app.post("/chat", async (req, res) => {
  try {
    console.log("🔥 CHAT HIT:", req.body);

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message required",
      });
    }

    const prompt = `
You are Swastprova AI.

Rules:
- Helpful answers
- Simple language
- Motivational tone
- Ask reflection question
- Give 1 action step

User: ${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // ✅ SAFE RESPONSE HANDLING
    let reply = "No response generated";

    try {
      reply = response.text?.() || reply;
    } catch (e) {
      console.error("PARSE ERROR:", e);
      reply = "AI parsing error";
    }

    console.log("🤖 AI REPLY:", reply);

    return res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error("❌ AI ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "AI error occurred",
    });
  }
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});