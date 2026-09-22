/**
 * GDPR Article 83 Fine Calculator Utility ('fine-gdpr-83')
 * 
 * Implements the European Data Protection Board (EDPB) harmonized framework for
 * calculating administrative fines. Evaluates both Tier 1 (Art 83(4)) and Tier 2 (Art 83(5))
 * breaches, applying mitigating and aggravating parameters.
 */

export interface GdprFineParameters {
  recordsImpacted: string; // "1 - 500" | "501 - 10,000" | "10,001 - 100,000" | "100,000+" | "Unknown"
  dataTypes: string[];     // e.g. "Personally Identifiable Information (PII)", "Financial Data", "Protected Health Information (PHI)", etc.
  containmentStatus: string; // "investigating" | "contained" | "eradicated" | "recovering"
  intentional: boolean;
  mitigationMeasures: 'none' | 'partial' | 'extensive';
  previousInfringements: boolean;
  cooperationLevel: 'minimal' | 'cooperative' | 'proactive';
  reportingMethod: 'self_reported' | 'authority_discovered';
  annualTurnoverEur: number; // Annual global turnover in EUR
}

export interface FactorAdjustment {
  factor: string;
  percentageChange: number; // positive for increase, negative for discount
  impactEur: number;
}

export interface GdprFineResult {
  tier: 'Tier 1 (Article 83(4))' | 'Tier 2 (Article 83(5))';
  gravityScore: number; // 0 to 100
  baseFineLow: number;
  baseFineHigh: number;
  adjustedFineLow: number;
  adjustedFineHigh: number;
  legalMaxCap: number;
  turnoverCapUsed: boolean;
  adjustments: FactorAdjustment[];
  articleReferences: string[];
}

export function calculateGdprFine(params: GdprFineParameters): GdprFineResult {
  const {
    recordsImpacted,
    dataTypes,
    containmentStatus,
    intentional,
    mitigationMeasures,
    previousInfringements,
    cooperationLevel,
    reportingMethod,
    annualTurnoverEur,
  } = params;

  const articleReferences: string[] = [];
  
  // 1. Determine Tier & Legal Cap based on GDPR Article 83
  // Article 83(5) [Tier 2]: High severity. Basic principles, data subjects' rights, sensitive data. Max €20M or 4% turnover.
  // Article 83(4) [Tier 1]: Lower severity. Controller/processor obligations, certification, monitoring. Max €10M or 2% turnover.
  
  const hasSensitiveData = dataTypes.some(type => 
    type.includes('Protected Health Information') || 
    type.includes('Financial Data') || 
    type.includes('Credentials')
  );

  let tier: 'Tier 1 (Article 83(4))' | 'Tier 2 (Article 83(5))' = 'Tier 1 (Article 83(4))';
  let capPercentage = 0.02; // 2%
  let capFlat = 10000000;   // €10M

  if (hasSensitiveData || intentional) {
    tier = 'Tier 2 (Article 83(5))';
    capPercentage = 0.04; // 4%
    capFlat = 20000000;   // €20M
    articleReferences.push('Article 83(5) - Severe infringement regarding basic processing principles or sensitive categories of data.');
  } else {
    tier = 'Tier 1 (Article 83(4))';
    capPercentage = 0.02; // 2%
    capFlat = 10000000;   // €10M
    articleReferences.push('Article 83(4) - Standard infringement regarding obligations of the controller and the processor.');
  }

  // Calculate absolute legal maximum cap (greater of flat cap or % of global turnover, per Art 83)
  const turnoverCap = annualTurnoverEur * capPercentage;
  const legalMaxCap = Math.max(capFlat, turnoverCap);
  const turnoverCapUsed = turnoverCap > capFlat;

  if (turnoverCapUsed) {
    articleReferences.push(`Article 83(${tier.includes('83(5)') ? '5' : '4'}) global annual turnover percentage cap applied (${capPercentage * 100}% of turnover exceeded flat cap).`);
  } else {
    articleReferences.push(`Article 83(${tier.includes('83(5)') ? '5' : '4'}) standard flat statutory cap applied (€${(capFlat / 1000000).toFixed(0)}M).`);
  }

  // 2. Base Fine Range Estimation based on records impacted & data types
  let recordsBaseLow = 5000;
  let recordsBaseHigh = 25000;

  switch (recordsImpacted) {
    case '1 - 500':
      recordsBaseLow = 3000;
      recordsBaseHigh = 15000;
      break;
    case '501 - 10,000':
      recordsBaseLow = 15000;
      recordsBaseHigh = 85000;
      break;
    case '10,001 - 100,000':
      recordsBaseLow = 85000;
      recordsBaseHigh = 45000;
      // Let's make sure the numbers are consistent:
      recordsBaseLow = 85000;
      recordsBaseHigh = 450000;
      break;
    case '100,000+':
      recordsBaseLow = 450000;
      recordsBaseHigh = 2500000;
      break;
    case 'Unknown':
    default:
      recordsBaseLow = 10000;
      recordsBaseHigh = 50000;
      break;
  }

  // Data sensitivity multiplier
  let sensitivityFactor = 1.0;
  if (dataTypes.includes('Personally Identifiable Information (PII)')) sensitivityFactor += 0.1;
  if (dataTypes.includes('Financial Data')) sensitivityFactor += 0.35;
  if (dataTypes.includes('Protected Health Information (PHI)')) sensitivityFactor += 0.5;
  if (dataTypes.includes('Authentication Credentials')) sensitivityFactor += 0.4;
  if (dataTypes.includes('Intellectual Property')) sensitivityFactor += 0.2;
  if (dataTypes.includes('Other')) sensitivityFactor += 0.05;

  const baseFineLow = Math.round(recordsBaseLow * sensitivityFactor);
  const baseFineHigh = Math.round(recordsBaseHigh * sensitivityFactor);
  const baseFineMid = (baseFineLow + baseFineHigh) / 2;

  // 3. Accumulate mitigating and aggravating factors (EDPB Guidelines)
  const adjustments: FactorAdjustment[] = [];
  let totalMultiplierChange = 0;

  // A. Intentionality (Article 83(2)(b))
  if (intentional) {
    const change = 0.50; // +50%
    adjustments.push({
      factor: 'Intentional Infringement (Art 83(2)(b))',
      percentageChange: change,
      impactEur: Math.round(baseFineMid * change),
    });
    totalMultiplierChange += change;
    articleReferences.push('Article 83(2)(b) - Aggravating: Infringement has intentional character.');
  } else {
    const change = -0.15; // -15%
    adjustments.push({
      factor: 'Negligent / Accidental Infringement (Art 83(2)(b))',
      percentageChange: change,
      impactEur: Math.round(baseFineMid * change),
    });
    totalMultiplierChange += change;
    articleReferences.push('Article 83(2)(b) - Mitigating: Infringement has negligent/unintentional character.');
  }

  // B. Actions to mitigate damage (Article 83(2)(c))
  let mitigationChange = 0;
  let mitigationLabel = '';
  
  if (containmentStatus === 'contained') {
    mitigationChange -= 0.15;
  } else if (containmentStatus === 'eradicated') {
    mitigationChange -= 0.25;
  } else if (containmentStatus === 'recovering') {
    mitigationChange -= 0.05;
  } else {
    mitigationChange += 0.05; // still investigating
  }

  if (mitigationMeasures === 'extensive') {
    mitigationChange -= 0.20;
    mitigationLabel = 'Extensive proactive mitigation measures';
  } else if (mitigationMeasures === 'partial') {
    mitigationChange -= 0.08;
    mitigationLabel = 'Partial mitigation measures';
  } else {
    mitigationChange += 0.10;
    mitigationLabel = 'Inadequate mitigation measures taken';
  }

  adjustments.push({
    factor: `Breach Containment & Mitigation (Art 83(2)(c)) - ${mitigationLabel}`,
    percentageChange: mitigationChange,
    impactEur: Math.round(baseFineMid * mitigationChange),
  });
  totalMultiplierChange += mitigationChange;
  if (mitigationChange < 0) {
    articleReferences.push('Article 83(2)(c) - Mitigating: Proactive action taken to mitigate damage suffered by data subjects.');
  } else if (mitigationChange > 0) {
    articleReferences.push('Article 83(2)(c) - Aggravating: Delayed containment or lack of substantial mitigation measures.');
  }

  // C. Previous Infringements (Article 83(2)(e))
  if (previousInfringements) {
    const change = 0.35; // +35%
    adjustments.push({
      factor: 'History of Previous Infringements (Art 83(2)(e))',
      percentageChange: change,
      impactEur: Math.round(baseFineMid * change),
    });
    totalMultiplierChange += change;
    articleReferences.push('Article 83(2)(e) - Aggravating: Prior history of relevant non-compliance or infringements.');
  }

  // D. Cooperation with Authority (Article 83(2)(f))
  let cooperationChange = 0;
  if (cooperationLevel === 'proactive') {
    cooperationChange = -0.20; // -20%
    articleReferences.push('Article 83(2)(f) - Mitigating: Outstanding and proactive cooperation with the supervisory authority.');
  } else if (cooperationLevel === 'cooperative') {
    cooperationChange = -0.05; // -5%
    articleReferences.push('Article 83(2)(f) - Mitigating: Standard cooperative posture with supervisory investigations.');
  } else {
    cooperationChange = 0.15; // +15%
    articleReferences.push('Article 83(2)(f) - Aggravating: Minimal or delayed cooperation with investigations.');
  }
  adjustments.push({
    factor: `Cooperation with Supervisory Board (Art 83(2)(f)) - ${cooperationLevel.toUpperCase()}`,
    percentageChange: cooperationChange,
    impactEur: Math.round(baseFineMid * cooperationChange),
  });
  totalMultiplierChange += cooperationChange;

  // E. Reporting Notification Method (Article 83(2)(h))
  if (reportingMethod === 'self_reported') {
    const change = -0.25; // -25%
    adjustments.push({
      factor: 'Voluntary Self-Reporting of Breach (Art 83(2)(h))',
      percentageChange: change,
      impactEur: Math.round(baseFineMid * change),
    });
    totalMultiplierChange += change;
    articleReferences.push('Article 83(2)(h) - Mitigating: The controller voluntarily notified the supervisory board first.');
  } else {
    const change = 0.15; // +15%
    adjustments.push({
      factor: 'Discovered / Escalated by Regulatory Board (Art 83(2)(h))',
      percentageChange: change,
      impactEur: Math.round(baseFineMid * change),
    });
    totalMultiplierChange += change;
    articleReferences.push('Article 83(2)(h) - Aggravating: Infringement came to light through supervisory audit or third-party reports.');
  }

  // 4. Compute Final Fines with Cap Limits
  const finalMultiplier = Math.max(0.05, 1 + totalMultiplierChange); // ensure at least 5% base fee remains

  let adjustedFineLow = Math.round(baseFineLow * finalMultiplier);
  let adjustedFineHigh = Math.round(baseFineHigh * finalMultiplier);

  // Apply maximum cap check
  if (adjustedFineLow > legalMaxCap) {
    adjustedFineLow = legalMaxCap;
  }
  if (adjustedFineHigh > legalMaxCap) {
    adjustedFineHigh = legalMaxCap;
  }

  // 5. Calculate Gravity/Risk Score (0-100)
  let gravityPoints = 10; // baseline
  if (recordsImpacted === '501 - 10,000') gravityPoints += 15;
  else if (recordsImpacted === '10,001 - 100,000') gravityPoints += 35;
  else if (recordsImpacted === '100,000+') gravityPoints += 55;

  if (hasSensitiveData) gravityPoints += 15;
  if (intentional) gravityPoints += 20;
  if (previousInfringements) gravityPoints += 10;
  
  // Mitigators
  if (containmentStatus === 'contained' || containmentStatus === 'eradicated') gravityPoints -= 5;
  if (mitigationMeasures === 'extensive') gravityPoints -= 10;
  if (cooperationLevel === 'proactive') gravityPoints -= 5;
  if (reportingMethod === 'self_reported') gravityPoints -= 5;

  const gravityScore = Math.max(5, Math.min(100, gravityPoints));

  return {
    tier,
    gravityScore,
    baseFineLow,
    baseFineHigh,
    adjustedFineLow,
    adjustedFineHigh,
    legalMaxCap,
    turnoverCapUsed,
    adjustments,
    articleReferences,
  };
}
