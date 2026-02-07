const Application = require('../models/Application');
const User = require('../models/User');
const Config = require('../models/Config');
const AuditTrail = require('../models/AuditTrail');
const { selectRandomAudits } = require('../utils/audit');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

exports.getDashboard = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const approved = await Application.countDocuments({ status: 'approved' });
    const rejected = await Application.countDocuments({ status: 'rejected' });
    const pending = await Application.countDocuments({
      status: { $in: ['submitted', 'under_review', 'pending_verification'] },
    });
    const fraud = await Application.countDocuments({ 'verification.isFraud': true });
    const auditQueue = await Application.countDocuments({ auditStatus: 'selected' });

    const approvalRate = totalApplications > 0 ? (approved / totalApplications) * 100 : 0;
    const rejectionRate = totalApplications > 0 ? (rejected / totalApplications) * 100 : 0;

    // Recent applications
    const recentApplications = await Application.find()
      .populate('applicantId', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(10);

    // Fraud risk applications
    const fraudRisk = await Application.find({
      $or: [
        { eligibilityScore: { $lt: 80 } },
        { 'verification.isFraud': true },
        { auditStatus: 'flagged' },
      ],
    })
      .populate('applicantId', 'name mobile')
      .limit(10);

    res.json({
      stats: {
        totalApplications,
        approved,
        rejected,
        pending,
        fraud,
        auditQueue,
        approvalRate: approvalRate.toFixed(2),
        rejectionRate: rejectionRate.toFixed(2),
      },
      recentApplications,
      fraudRisk,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value required' });
    }

    const config = await Config.findOneAndUpdate(
      { key },
      { key, value, description, updatedBy: req.user._id },
      { upsert: true, new: true }
    );

    await AuditTrail.create({
      applicationId: null,
      userId: req.user._id,
      action: 'modified',
      details: { configKey: key, newValue: value },
      ipAddress: req.ip,
    });

    res.json({ message: 'Configuration updated', config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update configuration', details: error.message });
  }
};

exports.getConfigs = async (req, res) => {
  try {
    const configs = await Config.find();
    const configObj = {};
    configs.forEach((config) => {
      configObj[config.key] = config.value;
    });
    res.json(configObj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
};

exports.triggerAudit = async (req, res) => {
  try {
    const { month, year } = req.body;
    const currentDate = new Date();
    const auditMonth = month || currentDate.getMonth() + 1;
    const auditYear = year || currentDate.getFullYear();

    const selected = await selectRandomAudits(auditMonth, auditYear);

    res.json({
      message: `Audit triggered for ${auditMonth}/${auditYear}`,
      selectedCount: selected.length,
      applications: selected,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger audit', details: error.message });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const { startDate, endDate, status, format = 'excel' } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('applicantId', 'name mobile')
      .sort({ createdAt: -1 });

    if (format === 'excel') {
      const data = applications.map((app) => ({
        'Application ID': app._id,
        'Applicant Name': app.personalDetails.name,
        'Mobile': app.applicantId.mobile,
        'Aadhaar': app.personalDetails.aadhaarNumber,
        'Status': app.status,
        'Eligibility Score': app.eligibilityScore,
        'Family Size': app.householdDetails.familySize,
        'Annual Income': app.incomeDetails.annualIncome,
        'Created At': app.createdAt,
        'Certificate Number': app.certificateNumber || 'N/A',
      }));

      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Applications');

      const filename = `report-${Date.now()}.xlsx`;
      const filepath = path.join(__dirname, '../uploads', filename);
      xlsx.writeFile(workbook, filepath);

      res.download(filepath, filename, (err) => {
        if (err) {
          fs.unlinkSync(filepath);
          res.status(500).json({ error: 'Failed to download report' });
        }
      });
    } else {
      res.json({ applications, count: applications.length });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export report', details: error.message });
  }
};

// Create new user (verification officer or applicant)
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required' });
    }

    if (!['applicant', 'verification_officer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Only applicant and verification_officer can be created.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
      isVerified: true,
      isActive: true,
    });

    await AuditTrail.create({
      applicationId: null,
      userId: req.user._id,
      action: 'user_created',
      details: { createdUserId: user._id, role: user.role, email: user.email },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

exports.manageUsers = async (req, res) => {
  try {
    const { action, userId, role, isActive } = req.body;

    if (action === 'update_role') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent changing admin role
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Cannot change admin role' });
      }

      user.role = role;
      await user.save();

      await AuditTrail.create({
        applicationId: null,
        userId: req.user._id,
        action: 'user_role_updated',
        details: { targetUserId: userId, newRole: role },
        ipAddress: req.ip,
      });

      res.json({ message: 'User role updated', user });
    } else if (action === 'update_status') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent deactivating admin
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Cannot deactivate admin user' });
      }

      user.isActive = isActive;
      await user.save();

      await AuditTrail.create({
        applicationId: null,
        userId: req.user._id,
        action: 'user_status_updated',
        details: { targetUserId: userId, isActive },
        ipAddress: req.ip,
      });

      res.json({ message: 'User status updated', user });
    } else {
      // List all users
      const users = await User.find().select('-password -otp').sort({ createdAt: -1 });
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to manage users', details: error.message });
  }
};

