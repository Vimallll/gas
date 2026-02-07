const mongoose = require('mongoose');

const auditTrailSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'submitted',
        'reviewed',
        'approved',
        'rejected',
        'modified',
        'manual_override',
        'fraud_marked',
        'audit_selected',
        'audit_completed',
        'score_calculated',
        'consent_accepted',
      ],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditTrailSchema.index({ applicationId: 1 });
auditTrailSchema.index({ userId: 1 });
auditTrailSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditTrail', auditTrailSchema);



