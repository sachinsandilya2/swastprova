// services/sviEngine.js

/* ============================================================
   SWASTPROVA
   SVI - SWASTPROVA VULNERABILITY INDEX ENGINE
   ============================================================

   INPUT SCALE:
   0 = No indication
   1 = Strong indication

   FORMULA:

   Weighted Score
   = Score × Category Weight

   Raw Score
   = Σ (Score × Weight)

   Maximum Possible Weighted Score
   = Σ (1 × Weight)

   SVI
   = (Raw Score / Maximum Possible Weighted Score) × 100

   FINAL SVI:
   0 - 100
   ============================================================ */


/* ============================================================
   CATEGORY WEIGHTS
   ============================================================

   These are DEFAULT weights.

   Replace these values with the exact approved
   Situation 1–11 weights if your official SVI
   formula specifies different values.
   ============================================================ */

const CATEGORY_CONFIG = {
  stress: {
    weight: 1.0,
    label: "Stress",
  },

  fear: {
    weight: 1.0,
    label: "Fear",
  },

  sleep: {
    weight: 1.0,
    label: "Sleep Difficulty",
  },

  anxiety: {
    weight: 1.0,
    label: "Anxiety",
  },

  socialIsolation: {
    weight: 1.0,
    label: "Social Isolation",
  },

  trauma: {
    weight: 1.5,
    label: "Trauma-related Distress",
  },

  urgency: {
    weight: 1.5,
    label: "Urgency",
  },
};


/* ============================================================
   SAFE NUMBER
   ============================================================ */

const safeNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
};


/* ============================================================
   SAFE SCORE
   ============================================================

   AI assessment gives values between 0 and 1.

   We make sure the value always stays
   inside that range.
   ============================================================ */

const safeScore = (value) => {
  const number = safeNumber(value);

  return Math.max(
    0,
    Math.min(1, number)
  );
};


/* ============================================================
   ROUND NUMBER
   ============================================================ */

const round = (value, decimals = 2) => {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      value * multiplier
    ) / multiplier
  );
};


/* ============================================================
   RISK LEVEL
   ============================================================ */

const getRiskLevel = (sviScore) => {
  if (sviScore <= 35) {
    return "LOW";
  }

  if (sviScore <= 60) {
    return "MODERATE";
  }

  if (sviScore <= 80) {
    return "HIGH";
  }

  return "CRITICAL";
};


/* ============================================================
   RISK DESCRIPTION
   ============================================================ */

const getRiskDescription = (riskLevel) => {
  switch (riskLevel) {

    case "LOW":
      return (
        "No significant level of distress was detected " +
        "from the available assessment responses."
      );

    case "MODERATE":
      return (
        "Some signs of emotional or psychological distress " +
        "may be present. Additional human support may be helpful."
      );

    case "HIGH":
      return (
        "The assessment indicates a higher level of distress. " +
        "Human support and professional evaluation are recommended."
      );

    case "CRITICAL":
      return (
        "The assessment indicates a very high level of distress " +
        "or urgency. Immediate human support should be considered."
      );

    default:
      return (
        "Human review is recommended."
      );
  }
};


/* ============================================================
   MAIN SVI CALCULATION
   ============================================================ */

export const calculateSVI = (
  assessment = {}
) => {

  /* ----------------------------------------------------------
     1. PREPARE CATEGORY SCORES
     ---------------------------------------------------------- */

  const categories = {};

  Object.entries(
    CATEGORY_CONFIG
  ).forEach(
    ([key, config]) => {

      categories[key] = {

        label: config.label,

        score: safeScore(
          assessment[key]
        ),

        weight: safeNumber(
          config.weight
        ),

        maxScore: 1,
      };
    }
  );


  /* ----------------------------------------------------------
     2. CALCULATE RAW WEIGHTED SCORE
     ----------------------------------------------------------

     Raw Score =
     Σ (Score × Weight)

     Example:

     Stress = 0.60
     Weight = 1.0

     Weighted Score =
     0.60 × 1.0
     = 0.60
     ---------------------------------------------------------- */

  let rawScore = 0;

  Object.values(
    categories
  ).forEach(
    (category) => {

      rawScore +=
        category.score *
        category.weight;
    }
  );


  /* ----------------------------------------------------------
     3. MAXIMUM POSSIBLE WEIGHTED SCORE
     ----------------------------------------------------------

     Because each AI score has maximum = 1:

     Maximum =
     Σ (1 × Weight)
     ---------------------------------------------------------- */

  let maximumPossibleWeightedScore = 0;

  Object.values(
    categories
  ).forEach(
    (category) => {

      maximumPossibleWeightedScore +=
        category.maxScore *
        category.weight;
    }
  );


  /* ----------------------------------------------------------
     4. NORMALIZATION
     ----------------------------------------------------------

     SVI =
     (Raw Score /
      Maximum Possible Weighted Score)
     × 100
     ---------------------------------------------------------- */

  let sviScore = 0;

  if (
    maximumPossibleWeightedScore > 0
  ) {

    sviScore =
      (
        rawScore /
        maximumPossibleWeightedScore
      ) *
      100;
  }


  /* ----------------------------------------------------------
     5. SAFETY CLAMP
     ---------------------------------------------------------- */

  sviScore = Math.max(
    0,
    Math.min(
      100,
      sviScore
    )
  );


  /* ----------------------------------------------------------
     6. ROUND FINAL SCORE
     ---------------------------------------------------------- */

  sviScore = round(
    sviScore,
    2
  );


  /* ----------------------------------------------------------
     7. RISK LEVEL
     ---------------------------------------------------------- */

  const riskLevel =
    getRiskLevel(
      sviScore
    );


  /* ----------------------------------------------------------
     8. RISK DESCRIPTION
     ---------------------------------------------------------- */

  const riskDescription =
    getRiskDescription(
      riskLevel
    );


  /* ----------------------------------------------------------
     9. FACTOR BREAKDOWN
     ----------------------------------------------------------

     This provides explainability.

     Each factor contains:

     - score
     - weight
     - weightedScore
     - contribution
     ---------------------------------------------------------- */

  const factors =
    Object.entries(
      categories
    ).map(
      ([name, category]) => {

        const weightedScore =
          category.score *
          category.weight;

        let contribution = 0;

        if (
          rawScore > 0
        ) {

          contribution =
            (
              weightedScore /
              rawScore
            ) *
            100;
        }

        return {

          name,

          label:
            category.label,

          score:
            round(
              category.score,
              3
            ),

          scorePercent:
            round(
              category.score * 100,
              2
            ),

          weight:
            category.weight,

          weightedScore:
            round(
              weightedScore,
              3
            ),

          contribution:
            round(
              contribution,
              2
            ),
        };
      }
    );


  /* ----------------------------------------------------------
     10. SORT FACTORS
     ----------------------------------------------------------

     Highest contributing factor first.
     ---------------------------------------------------------- */

  const sortedFactors =
    [...factors].sort(
      (a, b) =>
        b.weightedScore -
        a.weightedScore
    );


  /* ----------------------------------------------------------
     11. DOMINANT FACTOR
     ---------------------------------------------------------- */

  const dominantFactor =
    sortedFactors.length > 0
      ? sortedFactors[0]
      : null;


  /* ----------------------------------------------------------
     12. HIGH-RISK FACTORS
     ----------------------------------------------------------

     Factors >= 0.60 are treated as
     notable indicators.

     This is NOT a medical diagnosis.
     ---------------------------------------------------------- */

  const highRiskFactors =
    factors.filter(
      (factor) =>
        factor.score >= 0.60
    );


  /* ----------------------------------------------------------
     13. URGENCY CHECK
     ----------------------------------------------------------

     Urgency is handled separately because
     it may require human review even when
     the overall SVI is lower.

     NOTE:
     This does NOT diagnose or confirm
     an emergency.
     ---------------------------------------------------------- */

  const urgencyScore =
    safeScore(
      assessment.urgency
    );

  const immediateHumanReview =
    urgencyScore >= 0.80;


  /* ----------------------------------------------------------
     14. FINAL SUPPORT RECOMMENDATION
     ---------------------------------------------------------- */

  let supportRecommendation =
    "Continue monitoring wellbeing and consider talking to a trusted person if needed.";

  if (
    riskLevel === "MODERATE"
  ) {

    supportRecommendation =
      "Consider speaking with a qualified counsellor or trusted support person.";
  }

  if (
    riskLevel === "HIGH"
  ) {

    supportRecommendation =
      "Human support review is recommended. Consider speaking with a qualified mental health professional.";
  }

  if (
    riskLevel === "CRITICAL"
  ) {

    supportRecommendation =
      "Immediate human support is recommended. If there is immediate danger, contact local emergency services or a crisis support service.";
  }

  if (
    immediateHumanReview
  ) {

    supportRecommendation =
      "Urgent human support review is recommended. If there is immediate danger, contact local emergency services or a crisis support service.";
  }


  /* ----------------------------------------------------------
     15. FINAL RESULT
     ---------------------------------------------------------- */

  return {

    success: true,

    /* Final normalized SVI */
    sviScore,

    /* Risk classification */
    riskLevel,

    /* Explanation */
    riskDescription,

    /* Original weighted score */
    rawScore:
      round(
        rawScore,
        3
      ),

    /* Maximum possible score */
    maximumPossibleWeightedScore:
      round(
        maximumPossibleWeightedScore,
        3
      ),

    /* Confirm normalization */
    normalized: true,

    /* SVI scale */
    scale: {
      min: 0,
      max: 100,
    },

    /* Formula information */
    formula: {
      rawScore:
        "Σ(Score × Category Weight)",

      normalization:
        "(Raw Score / Maximum Possible Weighted Score) × 100",
    },

    /* Factor analysis */
    factors,

    /* Highest contributing factor */
    dominantFactor,

    /* Factors with relatively high scores */
    highRiskFactors,

    /* Urgency */
    urgency: {
      score:
        round(
          urgencyScore,
          3
        ),

      immediateHumanReview,
    },

    /* Support */
    supportRecommendation,
  };
};


/* ============================================================
   DEFAULT EXPORT
   ============================================================ */

export default calculateSVI;