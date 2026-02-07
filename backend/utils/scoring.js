const Config = require('../models/Config');

exports.calculateEligibilityScore = async (application) => {
  const config = await Config.findOne({ key: 'scoringRules' });
  const rules = config?.value || {
    rationCard: { AAY: 70, BPL: 50, APL: 0 },
    incomeCertificate: 50,
    noITR: 20,
    electricityConsumption: 20,
    familySize: { base: 0, perMember: 10, maxMembers: 4 },
  };

  const breakdown = {
    rationCardScore: 0,
    incomeScore: 0,
    electricityScore: 0,
    itrScore: 0,
    familySizeScore: 0,
    totalScore: 0,
  };

  // Ration Card Score
  const category = application.householdDetails?.rationCardCategory;
  if (category && rules.rationCard[category]) {
    breakdown.rationCardScore = rules.rationCard[category];
  }

  // Income Certificate Score
  if (application.incomeDetails?.incomeCertificateAmount) {
    breakdown.incomeScore = rules.incomeCertificate;
  }

  // ITR Score (no ITR filed = bonus)
  if (!application.incomeDetails?.itrFiled) {
    breakdown.itrScore = rules.noITR;
  }

  // Electricity Score (assumed if bill uploaded)
  if (application.documents?.electricityBill) {
    breakdown.electricityScore = rules.electricityConsumption;
  }

  // Family Size Score
  const familySize = application.householdDetails?.familySize || 0;
  if (familySize > 4) {
    breakdown.familySizeScore = rules.familySize.perMember * Math.min(familySize - 4, 2);
  }

  breakdown.totalScore =
    breakdown.rationCardScore +
    breakdown.incomeScore +
    breakdown.electricityScore +
    breakdown.itrScore +
    breakdown.familySizeScore;

  return breakdown;
};

exports.determineStatus = async (score) => {
  const thresholdConfig = await Config.findOne({ key: 'eligibilityThreshold' });
  const borderlineConfig = await Config.findOne({ key: 'borderlineThreshold' });

  const threshold = thresholdConfig?.value || 100;
  const borderline = borderlineConfig?.value || 80;

  if (score >= threshold) {
    return 'approved';
  } else if (score >= borderline) {
    return 'pending_verification';
  } else {
    return 'rejected';
  }
};



