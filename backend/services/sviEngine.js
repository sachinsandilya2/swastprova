// ==========================================
// SWASTPROVA VULNERABILITY INDEX ENGINE
// ==========================================

/**
 * Calculate Swastprova Vulnerability Index
 *
 * All input values should ideally be between 0 and 1.
 *
 * SVI Factors:
 *
 * Stress            → 15%
 * Fear              → 15%
 * Sleep             → 10%
 * Anxiety           → 15%
 * Social Isolation  → 10%
 * Trauma            → 20%
 * Urgency           → 15%
 *
 * Total             → 100%
 *
 * IMPORTANT:
 * This is a supportive vulnerability indicator,
 * NOT a medical diagnosis.
 */

// ==========================================
// CALCULATE SVI
// ==========================================

export function calculateSVI(data = {}) {

  const {
    stress = 0,
    fear = 0,
    sleep = 0,
    anxiety = 0,
    socialIsolation = 0,
    trauma = 0,
    urgency = 0,
  } = data;


  // ========================================
  // SAFE VALUE NORMALIZATION
  // ========================================

  const safe = (value) => {

    const number = Number(value);

    // Invalid value
    if (!Number.isFinite(number)) {
      return 0;
    }

    // Keep value between 0 and 1
    return Math.max(
      0,
      Math.min(1, number)
    );
  };


  // ========================================
  // NORMALIZED FACTOR SCORES
  // ========================================

  const stressScore = safe(stress);

  const fearScore = safe(fear);

  const sleepScore = safe(sleep);

  const anxietyScore = safe(anxiety);

  const isolationScore =
    safe(socialIsolation);

  const traumaScore =
    safe(trauma);

  const urgencyScore =
    safe(urgency);


  // ========================================
  // WEIGHTED SVI CALCULATION
  // ========================================

  const score =
    (stressScore * 15) +
    (fearScore * 15) +
    (sleepScore * 10) +
    (anxietyScore * 15) +
    (isolationScore * 10) +
    (traumaScore * 20) +
    (urgencyScore * 15);


  // ========================================
  // FINAL SCORE
  // ========================================

  const sviScore = Math.round(
    Math.max(
      0,
      Math.min(100, score)
    )
  );


  // ========================================
  // RISK LEVEL
  // ========================================

  let riskLevel = "LOW";


  if (sviScore >= 76) {

    riskLevel = "CRITICAL";

  } else if (sviScore >= 51) {

    riskLevel = "HIGH";

  } else if (sviScore >= 26) {

    riskLevel = "MODERATE";
  }


  // ========================================
  // FACTOR SCORES
  // ========================================

  const factors = {

    stress: stressScore,

    fear: fearScore,

    sleep: sleepScore,

    anxiety: anxietyScore,

    socialIsolation: isolationScore,

    trauma: traumaScore,

    urgency: urgencyScore,

  };


  // ========================================
  // WEIGHTED FACTOR CONTRIBUTION
  // ========================================

  const factorContribution = {

    stress: Math.round(
      stressScore * 15
    ),

    fear: Math.round(
      fearScore * 15
    ),

    sleep: Math.round(
      sleepScore * 10
    ),

    anxiety: Math.round(
      anxietyScore * 15
    ),

    socialIsolation: Math.round(
      isolationScore * 10
    ),

    trauma: Math.round(
      traumaScore * 20
    ),

    urgency: Math.round(
      urgencyScore * 15
    ),

  };


  // ========================================
  // RETURN SVI RESULT
  // ========================================

  return {

    sviScore,

    riskLevel,

    factors,

    factorContribution,

  };

}