const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Default configurations
const defaultConfigs = {
  incomeLimit: 50000, // Annual income limit in INR
  eligibilityThreshold: 100, // Minimum score for auto-approval
  borderlineThreshold: 80, // Score range for manual review
  auditSamplingRate: 0.1, // 10% random audit
  scoringRules: {
    rationCard: {
      AAY: 70,
      BPL: 50,
      APL: 0,
    },
    incomeCertificate: 50,
    noITR: 20,
    electricityConsumption: 20,
    familySize: {
      base: 0,
      perMember: 10,
      maxMembers: 4,
    },
  },
  subsidyAmount: 200, // Per cylinder subsidy in INR
};

module.exports = mongoose.model('Config', configSchema);

// Initialize default configs
module.exports.initializeDefaults = async function () {
  for (const [key, value] of Object.entries(defaultConfigs)) {
    await this.findOneAndUpdate(
      { key },
      { key, value, description: `Default ${key} configuration` },
      { upsert: true, new: true }
    );
  }
};



