const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Personal Details
    personalDetails: {
      name: { type: String, required: true },
      fatherName: String,
      dateOfBirth: Date,
      gender: { type: String, enum: ['male', 'female', 'other'] },
      aadhaarNumber: { type: String, required: true },
      panNumber: String,
    },
    // Household Details
    householdDetails: {
      familySize: { type: Number, required: true, min: 1 },
      rationCardNumber: String,
      rationCardCategory: {
        type: String,
        enum: ['BPL', 'APL', 'AAY', 'none'],
      },
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
    },
    // Income Details
    incomeDetails: {
      annualIncome: { type: Number, required: true },
      incomeCertificateAmount: Number,
      itrFiled: { type: Boolean, default: false },
      selfDeclared: { type: Boolean, default: false },
    },
    // Documents
    documents: {
      aadhaar: String,
      rationCard: String,
      incomeCertificate: String,
      electricityBill: String,
      pan: String,
      addressProof: String,
    },
    // Eligibility Scoring
    eligibilityScore: {
      type: Number,
      default: 0,
    },
    scoringBreakdown: {
      rationCardScore: { type: Number, default: 0 },
      incomeScore: { type: Number, default: 0 },
      electricityScore: { type: Number, default: 0 },
      itrScore: { type: Number, default: 0 },
      familySizeScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
    },
    // Application Status
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'pending_verification',
        'audit_flagged',
      ],
      default: 'draft',
    },
    // Verification Details
    verification: {
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      remarks: String,
      isManualOverride: { type: Boolean, default: false },
      isFraud: { type: Boolean, default: false },
      fraudReason: String,
    },
    // Audit
    auditStatus: {
      type: String,
      enum: ['not_selected', 'selected', 'completed', 'flagged'],
      default: 'not_selected',
    },
    auditDate: Date,
    auditOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Consent
    digitalConsent: {
      accepted: { type: Boolean, default: false },
      acceptedAt: Date,
      ipAddress: String,
    },
    // Rejection Details
    rejectionReason: String,
    // Certificate
    certificateNumber: String,
    certificateUrl: String,
  },
  { timestamps: true }
);

applicationSchema.index({ applicantId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ 'personalDetails.aadhaarNumber': 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);



