import { askGemini } from "../gemini.js";

/* ==========================================
   AI STRESS & TRAUMA ASSESSMENT
========================================== */

export async function analyzeAssessment({
  text = "",
  answers = {},
}) {
  const prompt = `
You are an AI-assisted mental distress screening engine
for Swastprova.

Your purpose is to identify possible signs of psychological
distress from the user's CURRENT interaction.

IMPORTANT SAFETY RULES:

- Do NOT diagnose any mental health disorder.
- Do NOT say the user has PTSD, depression, anxiety disorder,
  or any other medical condition.
- Do NOT prescribe medication.
- Do NOT provide medication dosage.
- Do NOT act as a doctor or psychologist.
- This is ONLY an AI-assisted screening.
- Final decisions should involve qualified human professionals.
- Do not make unsupported medical claims.

Analyze the user's current text and structured answers.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add explanations outside JSON.

Use EXACTLY this structure:

{
  "indicators": [],
  "stress": 0,
  "fear": 0,
  "sleep": 0,
  "anxiety": 0,
  "socialIsolation": 0,
  "trauma": 0,
  "urgency": 0,
  "confidence": 0,
  "recommendedSupport": []
}

NUMERICAL RULES:

- stress must be between 0 and 1
- fear must be between 0 and 1
- sleep must be between 0 and 1
- anxiety must be between 0 and 1
- socialIsolation must be between 0 and 1
- trauma must be between 0 and 1
- urgency must be between 0 and 1
- confidence must be between 0 and 1

Meaning:

0 = no clear indication

1 = strong indication

INDICATORS:

The "indicators" array should contain short,
human-readable observations based only on the
information provided by the user.

Example:

[
  "User describes persistent fear",
  "User reports difficulty sleeping"
]

Do not diagnose anything.

RECOMMENDED SUPPORT:

The "recommendedSupport" array should contain
appropriate non-medical support options.

Examples:

[
  "Talk to a trusted person",
  "Consider speaking with a qualified counsellor",
  "Human support review recommended"
]

If the user's information does not indicate significant
distress, do not exaggerate the risk.

If there appears to be immediate danger or serious crisis,
include an appropriate recommendation to seek immediate
human or emergency support.

CURRENT USER TEXT:

${text}

STRUCTURED ANSWERS:

${JSON.stringify(answers)}
`;

  try {
    console.log("🤖 Sending assessment to Gemini...");

    const response = await askGemini(prompt);

    console.log("✅ Gemini assessment response received");

    let cleaned = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    /* ==========================================
       PARSE GEMINI JSON
    ========================================== */

    try {
      const result = JSON.parse(cleaned);

      return {
        indicators: Array.isArray(result.indicators)
          ? result.indicators
          : [],

        stress: Number(result.stress) || 0,
        fear: Number(result.fear) || 0,
        sleep: Number(result.sleep) || 0,
        anxiety: Number(result.anxiety) || 0,
        socialIsolation:
          Number(result.socialIsolation) || 0,
        trauma: Number(result.trauma) || 0,
        urgency: Number(result.urgency) || 0,

        confidence:
          Number(result.confidence) || 0,

        recommendedSupport:
          Array.isArray(result.recommendedSupport)
            ? result.recommendedSupport
            : ["Human support review"],
      };
    } catch (parseError) {
      console.error(
        "❌ Assessment JSON parsing failed:",
        parseError
      );

      return {
        indicators: [
          "AI analysis could not be interpreted automatically",
        ],

        stress: 0,
        fear: 0,
        sleep: 0,
        anxiety: 0,
        socialIsolation: 0,
        trauma: 0,
        urgency: 0,

        confidence: 0,

        recommendedSupport: [
          "Human counsellor review",
        ],
      };
    }
  } catch (error) {
    console.error(
      "❌ Assessment Gemini Error:",
      error?.message || error
    );

    throw new Error(
      "Assessment AI request failed"
    );
  }
}