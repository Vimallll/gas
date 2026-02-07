const Application = require('../models/Application');
const AuditTrail = require('../models/AuditTrail');
const { calculateEligibilityScore, determineStatus } = require('../utils/scoring');

exports.createApplication = async (req, res) => {
  try {
    const applicantId = req.user._id;

    // Check if user already has an application
    const existing = await Application.findOne({
      applicantId,
      status: { $in: ['draft', 'submitted', 'under_review', 'pending_verification'] },
    });

    if (existing) {
      return res.status(400).json({
        error: 'You already have a pending application',
        applicationId: existing._id,
      });
    }

    const files = req.files || {};
    const applicationData = {
      applicantId,
      personalDetails: req.body.personalDetails
        ? JSON.parse(req.body.personalDetails)
        : {},
      householdDetails: req.body.householdDetails
        ? JSON.parse(req.body.householdDetails)
        : {},
      incomeDetails: req.body.incomeDetails
        ? JSON.parse(req.body.incomeDetails)
        : {},
      documents: {
        aadhaar: files.aadhaar?.[0]?.filename ? `/uploads/${files.aadhaar[0].filename}` : undefined,
        rationCard: files.rationCard?.[0]?.filename ? `/uploads/${files.rationCard[0].filename}` : undefined,
        incomeCertificate: files.incomeCertificate?.[0]?.filename ? `/uploads/${files.incomeCertificate[0].filename}` : undefined,
        electricityBill: files.electricityBill?.[0]?.filename ? `/uploads/${files.electricityBill[0].filename}` : undefined,
        pan: files.pan?.[0]?.filename ? `/uploads/${files.pan[0].filename}` : undefined,
        addressProof: files.addressProof?.[0]?.filename ? `/uploads/${files.addressProof[0].filename}` : undefined,
      },
      digitalConsent: {
        accepted: req.body.consentAccepted === 'true',
        acceptedAt: new Date(),
        ipAddress: req.ip,
      },
    };

    const application = await Application.create(applicationData);

    // Create audit trail
    await AuditTrail.create({
      applicationId: application._id,
      userId: applicantId,
      action: 'created',
      details: { status: 'draft' },
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Application created', application });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application', details: error.message });
  }
};

exports.submitApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findOne({
      _id: applicationId,
      applicantId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'draft') {
      return res.status(400).json({ error: 'Application already submitted' });
    }

    // Calculate eligibility score
    const scoringBreakdown = await calculateEligibilityScore(application);
    application.scoringBreakdown = scoringBreakdown;
    application.eligibilityScore = scoringBreakdown.totalScore;

    // Determine status based on score (never auto-approve)
    const suggestedStatus = await determineStatus(scoringBreakdown.totalScore);
    // All applications go to pending_verification or under_review, never directly to approved
    application.status = suggestedStatus === 'approved' ? 'pending_verification' : suggestedStatus;

    await application.save();

    // Create audit trail
    await AuditTrail.create({
      applicationId: application._id,
      userId: req.user._id,
      action: 'submitted',
      details: {
        score: scoringBreakdown.totalScore,
        status: application.status,
      },
      ipAddress: req.ip,
    });

    res.json({
      message: 'Application submitted successfully',
      application,
      eligibilityScore: scoringBreakdown.totalScore,
      status: application.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application', details: error.message });
  }
};

exports.getMyApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ applicantId: req.user._id })
      .populate('verification.verifiedBy', 'name mobile')
      .sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({ error: 'No application found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'personalDetails.name': { $regex: search, $options: 'i' } },
        { 'personalDetails.aadhaarNumber': { $regex: search, $options: 'i' } },
        { 'householdDetails.rationCardNumber': { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await Application.find(query)
      .populate('applicantId', 'name mobile')
      .populate('verification.verifiedBy', 'name')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({
      _id: id,
      applicantId: req.user._id,
      status: 'draft',
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found or cannot be updated' });
    }

    const files = req.files || {};

    if (req.body.personalDetails) {
      application.personalDetails = {
        ...application.personalDetails,
        ...JSON.parse(req.body.personalDetails),
      };
    }
    if (req.body.householdDetails) {
      application.householdDetails = {
        ...application.householdDetails,
        ...JSON.parse(req.body.householdDetails),
      };
    }
    if (req.body.incomeDetails) {
      application.incomeDetails = {
        ...application.incomeDetails,
        ...JSON.parse(req.body.incomeDetails),
      };
    }

    // Update documents if new files uploaded
    Object.keys(files).forEach((key) => {
      if (files[key]?.[0]?.filename) {
        application.documents[key] = `/uploads/${files[key][0].filename}`;
      }
    });

    if (req.body.consentAccepted === 'true') {
      application.digitalConsent = {
        accepted: true,
        acceptedAt: new Date(),
        ipAddress: req.ip,
      };
    }

    await application.save();

    await AuditTrail.create({
      applicationId: application._id,
      userId: req.user._id,
      action: 'modified',
      details: { status: 'draft' },
      ipAddress: req.ip,
    });

    res.json({ message: 'Application updated', application });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application', details: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id)
      .populate('applicantId', 'name mobile email')
      .populate('verification.verifiedBy', 'name mobile')
      .populate('auditOfficer', 'name mobile');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

