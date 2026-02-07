const Application = require('../models/Application');
const AuditTrail = require('../models/AuditTrail');
const pdfkit = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks, isFraud, fraudReason } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (action === 'approve') {
      application.status = 'approved';
      application.verification.verifiedBy = req.user._id;
      application.verification.verifiedAt = new Date();
      application.verification.remarks = remarks;
      application.verification.isManualOverride = true;

      // Generate certificate number
      application.certificateNumber = `GAS-${Date.now()}-${application._id.toString().slice(-6)}`;

      await application.save();

      await AuditTrail.create({
        applicationId: application._id,
        userId: req.user._id,
        action: 'approved',
        details: { remarks, manualOverride: true },
        ipAddress: req.ip,
      });

      res.json({ message: 'Application approved', application });
    } else if (action === 'reject') {
      application.status = 'rejected';
      application.verification.verifiedBy = req.user._id;
      application.verification.verifiedAt = new Date();
      application.verification.remarks = remarks;
      application.rejectionReason = remarks;

      await application.save();

      await AuditTrail.create({
        applicationId: application._id,
        userId: req.user._id,
        action: 'rejected',
        details: { reason: remarks },
        ipAddress: req.ip,
      });

      res.json({ message: 'Application rejected', application });
    } else if (action === 'flag_fraud') {
      application.verification.isFraud = true;
      application.verification.fraudReason = fraudReason;
      application.status = 'rejected';
      application.rejectionReason = `Fraud detected: ${fraudReason}`;

      await application.save();

      await AuditTrail.create({
        applicationId: application._id,
        userId: req.user._id,
        action: 'fraud_marked',
        details: { reason: fraudReason },
        ipAddress: req.ip,
      });

      res.json({ message: 'Application flagged as fraud', application });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to review application', details: error.message });
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    const applications = await Application.find({
      status: { $in: ['under_review', 'pending_verification'] },
    })
      .populate('applicantId', 'name mobile')
      .sort({ createdAt: 1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
};

exports.generateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('applicantId', 'name mobile');

    if (!application || application.status !== 'approved') {
      return res.status(400).json({ error: 'Application not approved' });
    }

    const doc = new pdfkit();
    const filename = `certificate-${application._id}.pdf`;
    const filepath = path.join(__dirname, '../uploads', filename);

    doc.pipe(fs.createWriteStream(filepath));

    // Certificate content
    doc.fontSize(20).text('GAS SUBSIDY ELIGIBILITY CERTIFICATE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Certificate Number: ${application.certificateNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`This is to certify that:`);
    doc.moveDown();
    doc.text(`Name: ${application.personalDetails.name}`);
    doc.text(`Aadhaar: ${application.personalDetails.aadhaarNumber}`);
    doc.text(`Address: ${application.householdDetails.address?.street || ''}, ${application.householdDetails.address?.city || ''}`);
    doc.moveDown();
    doc.text(`has been found eligible for subsidized domestic gas cylinders under the Government Gas Supply Program.`);
    doc.moveDown();
    doc.text(`Eligibility Score: ${application.eligibilityScore}`);
    doc.text(`Subsidy Amount: ₹200 per cylinder`);
    doc.moveDown();
    doc.text(`This certificate is valid for one year from the date of issue.`);

    doc.end();

    await new Promise((resolve) => doc.on('end', resolve));

    application.certificateUrl = filename;
    await application.save();

    res.download(filepath, filename, (err) => {
      if (err) {
        fs.unlinkSync(filepath);
        res.status(500).json({ error: 'Failed to download certificate' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate certificate', details: error.message });
  }
};



