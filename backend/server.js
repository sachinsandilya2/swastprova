import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* GEMINI SETUP */

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/* HOME */

app.get("/", (req, res) => {
  res.send("🚀 Swastprova Backend Running...");
});

/* CONTACT FORM */

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

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
      subject: `📩 New Contact Form Message from ${name}`,
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>New Contact Message</h2>

          <p><strong>Name:</strong> ${name}</p>

          <p><strong>Email:</strong> ${email}</p>

          <p><strong>Message:</strong></p>

          <p>${message}</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "✅ Message Sent Successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "❌ Failed To Send Message",
    });
  }
});

/* MENTOR REQUEST */

app.post("/connect-mentor", async (req, res) => {
  try {
    const { mentorName, mentorField } = req.body;

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
          <h2>Mentor Connection Request</h2>

          <p><strong>Mentor:</strong> ${mentorName}</p>

          <p><strong>Field:</strong> ${mentorField}</p>

          <p>A user wants to connect with this mentor.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "✅ Mentor Request Sent",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "❌ Failed To Send Mentor Request",
    });
  }
});

/* SWASTPROVA AI */

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const prompt = `
You are Swastprova AI.

Rules:
1. Give a helpful answer.
2. Ask reflection questions.
3. Give one practical action step.
4. Help users grow, learn and solve problems.
5. Be supportive and thoughtful.

User:
${message}
`;

    const result = await model.generateContent(prompt);

    const reply = result.response.text();

    res.status(200).json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "❌ AI Error",
    });
  }
});

/* SERVER */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `✅ Server Running: http://localhost:${PORT}`
  );
});