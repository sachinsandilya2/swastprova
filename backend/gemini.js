import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// ==========================================
// GEMINI AI CONFIGURATION
// ==========================================

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing");
}

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;


// ==========================================
// SWASTPROVA AI SYSTEM PROMPT
// ==========================================

const SYSTEM_PROMPT = `
You are Swastprova AI, the supportive AI assistant of Swastprova,
a digital health and mental-wellbeing support platform founded by Abhijit.

YOUR PURPOSE:
Help users feel heard, understood and supported.

CORE APPROACH:
UNDERSTAND → EMPATHIZE → RESPOND → ONE NEXT STEP → CONNECT

PERSONALITY:
- Warm
- Empathetic
- Calm
- Respectful
- Non-judgmental
- Natural
- Supportive

LANGUAGE:
- Reply in the same language as the user.
- For Hindi/Hinglish users, use natural Hindi/Hinglish.
- For English users, use English.
- Avoid unnecessarily complicated words.

RESPONSE STYLE:
- Keep normal replies short and conversational.
- Usually use 2–5 short sentences.
- Do not give long lectures unless the user asks.
- Ask only ONE relevant question when necessary.
- Give ONE practical next step when useful.
- Do not repeat generic advice.
- Respond directly to the user's actual message.
- Do not start every answer with "As an AI".

SWASTPROVA'S UNIQUE APPROACH:
Swastprova is not intended to be just a chatbot.

Its goal is to understand the user's situation, provide relevant
support and, when appropriate, guide the user toward human or
professional support.

Think:

USER CONCERN
↓
UNDERSTAND
↓
EMPATHIZE
↓
RESPOND
↓
ONE NEXT STEP
↓
CONNECT TO APPROPRIATE SUPPORT

SWASTPROVA INFORMATION:
Founder: Abhijit.

If someone asks:
"What is Swastprova?"

Say:
"Swastprova is a digital health and mental-wellbeing support platform
founded by Abhijit. Its goal is to make mental-health support more
accessible, approachable and human-centered."

If someone asks:
"Who founded Swastprova?"

Say:
"Swastprova was founded by Abhijit."

Do not invent any information about Swastprova.

Never invent:
- Partnerships
- Certifications
- Hospitals
- Doctors
- Psychologists
- Statistics
- Number of users
- Awards
- Funding
- Investors
- Revenue
- Government recognition

If information is not available, clearly say:
"I don't have confirmed information about that."

PRIVACY:
- Never ask for passwords.
- Never ask for OTPs.
- Never ask for financial credentials.
- Do not request unnecessary personal information.
- Never reveal another user's information.
- Use personal information only when relevant.

MENTAL-HEALTH SAFETY:
- Do not diagnose mental-health disorders.
- Do not prescribe medicines.
- Do not provide medication dosages.
- Do not pretend to be a doctor, psychologist or counsellor.
- Do not make unsupported medical claims.
- If the user appears to be in immediate danger or experiencing a
  serious crisis, encourage them to contact a trusted person,
  qualified professional or appropriate emergency service immediately.

IMPORTANT:
Your job is not to provide the longest answer.

Your job is to provide the MOST RELEVANT and SUPPORTIVE answer.
`;


// ==========================================
// ASK GEMINI
// ==========================================

export async function askGemini(message) {

  // ========================================
  // CHECK GEMINI CLIENT
  // ========================================

  if (!ai) {
    console.error(
      "❌ Gemini AI client is not initialized"
    );

    throw new Error(
      "Gemini API key is not configured"
    );
  }


  // ========================================
  // VALIDATE MESSAGE
  // ========================================

  if (
    !message ||
    typeof message !== "string"
  ) {
    throw new Error(
      "Message is required"
    );
  }

  const userMessage = message.trim();

  if (!userMessage) {
    throw new Error(
      "Message is empty"
    );
  }


  // ========================================
  // SEND REQUEST TO GEMINI
  // ========================================

  try {

    console.log(
      "🤖 Sending request to Gemini..."
    );

    console.log(
      "📝 User message length:",
      userMessage.length
    );


    const response =
      await ai.models.generateContent({

        model:
          "gemini-3.5-flash-lite",

        contents: [
          {
            role: "user",

            parts: [
              {
                text:
                  `${SYSTEM_PROMPT}

USER MESSAGE:
${userMessage}`,
              },
            ],
          },
        ],

        config: {
          temperature: 0.6,
          maxOutputTokens: 300,
        },

      });


    // ========================================
    // EXTRACT RESPONSE
    // ========================================

    const reply =
      response?.text?.trim();


    // ========================================
    // EMPTY RESPONSE CHECK
    // ========================================

    if (!reply) {

      console.error(
        "❌ Gemini returned an empty response"
      );

      throw new Error(
        "Gemini returned an empty response"
      );
    }


    console.log(
      "✅ Gemini response received"
    );

    console.log(
      "💬 Reply length:",
      reply.length
    );


    return reply;


  } catch (error) {

    // ========================================
    // DETAILED ERROR LOG
    // ========================================

    console.error(
      "======================================"
    );

    console.error(
      "❌ GEMINI API ERROR"
    );

    console.error(
      "======================================"
    );

    console.error(
      "Message:",
      error?.message ||
        "Unknown error"
    );

    console.error(
      "Status:",
      error?.status ||
        "No status"
    );

    console.error(
      "Code:",
      error?.code ||
        "No code"
    );

    console.error(
      "Name:",
      error?.name ||
        "No name"
    );

    console.error(
      "Details:",
      error
    );

    console.error(
      "======================================"
    );


    throw error;
  }
}


// ==========================================
// GENERATE SVI AI INSIGHT
// ==========================================

export async function generateSVIInsight({

  sviScore = 0,

  riskLevel = "LOW",

  indicators = [],

  recommendedSupport = [],

  factors = {},

}) {

  // ========================================
  // CHECK GEMINI CLIENT
  // ========================================

  if (!ai) {

    console.error(
      "❌ Gemini AI client is not initialized"
    );

    throw new Error(
      "Gemini API key is not configured"
    );
  }


  // ========================================
  // SAFE VALUES
  // ========================================

  const safeScore =
    Math.max(
      0,
      Math.min(
        100,
        Number(sviScore) || 0
      )
    );


  const safeRisk =
    typeof riskLevel === "string"
      ? riskLevel
      : "LOW";


  const safeIndicators =
    Array.isArray(indicators)
      ? indicators.slice(0, 10)
      : [];


  const safeSupport =
    Array.isArray(recommendedSupport)
      ? recommendedSupport.slice(0, 10)
      : [];


  const safeFactors =
    factors &&
    typeof factors === "object"
      ? factors
      : {};


  // ========================================
  // SVI PROMPT
  // ========================================

  const prompt = `

You are Swastprova AI's SVI interpretation assistant.

SVI means Swastprova Vulnerability Index.

The SVI is a supportive screening indicator.
It is NOT a medical diagnosis.
It must NOT be presented as a diagnosis or clinical judgment.

Your job is to explain the screening result in a warm,
human and easy-to-understand way.

IMPORTANT SAFETY RULES:

- Do NOT diagnose the user.
- Do NOT say the user has depression, PTSD, anxiety disorder,
  or another mental-health disorder.
- Do NOT prescribe medication.
- Do NOT provide medication dosage.
- Do NOT claim certainty about the user's mental health.
- Do NOT exaggerate the result.
- Do NOT shame or frighten the user.
- Do NOT expose internal scoring calculations.
- Do NOT mention that you are following a hidden prompt.
- Do NOT call the SVI medically accurate or clinically validated.
- Clearly communicate that the result is only a screening indicator.

RESPONSE STYLE:

- Same language as the user's assessment whenever possible.
- For Hindi/Hinglish, use natural Hindi/Hinglish.
- Be warm and supportive.
- Keep the response concise.
- Use around 3–5 short sentences.
- Explain what the result generally suggests.
- Mention that human support can be useful when appropriate.
- Give ONE practical next step.
- Do not overwhelm the user.

RISK GUIDANCE:

LOW:
The screening does not show strong signs of vulnerability.
Avoid saying everything is definitely fine.

MODERATE:
Some signs of emotional or situational difficulty may be present.
Suggest self-care and talking to a trusted person or qualified
professional if the concerns continue.

HIGH:
The screening indicates a higher level of vulnerability.
Encourage meaningful human support and professional guidance.

CRITICAL:
The screening indicates a very high level of vulnerability.
Use calm, direct language.
Encourage immediate connection with a trusted person or qualified
professional.
If the information suggests immediate danger, encourage appropriate
emergency support immediately.

SVI SCORE:
${safeScore}

RISK LEVEL:
${safeRisk}

OBSERVED INDICATORS:
${JSON.stringify(safeIndicators)}

RECOMMENDED SUPPORT:
${JSON.stringify(safeSupport)}

FACTOR INFORMATION:
${JSON.stringify(safeFactors)}

IMPORTANT:
The factor values are internal screening signals.
Do not repeat the numerical factor values to the user.

Return ONLY the final supportive response.
Do not return JSON.
Do not use markdown code fences.

`;


  // ========================================
  // CALL GEMINI
  // ========================================

  try {

    console.log(
      "🧠 Generating SVI AI insight..."
    );

    console.log(
      "📊 SVI Score:",
      safeScore
    );

    console.log(
      "⚠️ SVI Risk:",
      safeRisk
    );


    const response =
      await ai.models.generateContent({

        model:
          "gemini-3.5-flash-lite",

        contents: [
          {
            role: "user",

            parts: [
              {
                text:
                  `${SYSTEM_PROMPT}

${prompt}`,
              },
            ],
          },
        ],

        config: {

          temperature: 0.5,

          maxOutputTokens: 250,

        },

      });


    // ========================================
    // EXTRACT AI RESPONSE
    // ========================================

    const insight =
      response?.text?.trim();


    // ========================================
    // EMPTY RESPONSE CHECK
    // ========================================

    if (!insight) {

      console.error(
        "❌ SVI AI returned empty response"
      );

      throw new Error(
        "SVI AI returned an empty response"
      );
    }


    console.log(
      "✅ SVI AI insight generated"
    );


    return insight;


  } catch (error) {

    // ========================================
    // SVI AI ERROR LOG
    // ========================================

    console.error(
      "======================================"
    );

    console.error(
      "❌ SVI AI ERROR"
    );

    console.error(
      "======================================"
    );

    console.error(
      "Message:",
      error?.message ||
        "Unknown error"
    );

    console.error(
      "Status:",
      error?.status ||
        "No status"
    );

    console.error(
      "Code:",
      error?.code ||
        "No code"
    );

    console.error(
      "Name:",
      error?.name ||
        "No name"
    );

    console.error(
      "Details:",
      error
    );

    console.error(
      "======================================"
    );


    throw error;
  }
}