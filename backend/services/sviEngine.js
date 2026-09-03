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

  // Make sure every value stays between 0 and 1
  const safe = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return 0;
    }

    return Math.max(0, Math.min(1, number));
  };

  const stressScore = safe(stress);
  const fearScore = safe(fear);
  const sleepScore = safe(sleep);
  const anxietyScore = safe(anxiety);
  const isolationScore = safe(socialIsolation);
  const traumaScore = safe(trauma);
  const urgencyScore = safe(urgency);

  /*
    SVI = Swastprova Vulnerability Index

    Weight distribution:

    Stress          → 15
    Fear            → 15
    Sleep           → 10
    Anxiety         → 15
    Social Isolation→ 10
    Trauma          → 20
    Urgency         → 15

    Total = 100
  */

  const score =
    stressScore * 15 +
    fearScore * 15 +
    sleepScore * 10 +
    anxietyScore * 15 +
    isolationScore * 10 +
    traumaScore * 20 +
    urgencyScore * 15;

  const sviScore = Math.round(
    Math.max(0, Math.min(100, score))
  );

  /*
    Risk levels

    0–25   → LOW
    26–50  → MODERATE
    51–75  → HIGH
    76–100 → CRITICAL
  */

  let riskLevel = "LOW";

  if (sviScore >= 76) {
    riskLevel = "CRITICAL";
  } else if (sviScore >= 51) {
    riskLevel = "HIGH";
  } else if (sviScore >= 26) {
    riskLevel = "MODERATE";
  }

  return {
    sviScore,
    riskLevel,
  };
}