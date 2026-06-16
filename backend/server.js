import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

/* MIDDLEWARE */
app.use(cors({
  origin: "*",   // 🔥 phone + Vercel fix
  methods: ["GET", "POST"]
}));

app.use(express.json());

/* CHECK ENV */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
}

/* GEMINI SETUP */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("🚀 Swastprova Backend Running...");
});

/* CONTACT FORM */
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

    res.json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("CONTACT ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

/* MENTOR REQUEST */
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

    res.json({
      success: true,
      message: "Mentor request sent",
    });

  } catch (error) {
    console.error("MENTOR ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed mentor request",
    });
  }
});

/* AI CHAT */
app.post("/chat", async (req, res) => {
  try {
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
- Reflection questions
- One action step
- Motivational tone

User: ${message}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error("AI ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "AI error occurred",
    });
  }
});

/* SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});