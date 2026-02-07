const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { uploadDocuments } = require('../middleware/upload');

// Applicant routes
router.post(
  '/',
  authenticate,
  requireRole('applicant'),
  uploadDocuments,
  applicationController.createApplication
);
router.put(
  '/:id',
  authenticate,
  requireRole('applicant'),
  uploadDocuments,
  applicationController.updateApplication
);
router.post(
  '/:applicationId/submit',
  authenticate,
  requireRole('applicant'),
  applicationController.submitApplication
);
router.get('/my-application', authenticate, requireRole('applicant'), applicationController.getMyApplication);

// Officer and Admin routes
router.get(
  '/',
  authenticate,
  requireRole('verification_officer', 'admin'),
  applicationController.getAllApplications
);
router.get(
  '/:id',
  authenticate,
  requireRole('verification_officer', 'admin'),
  applicationController.getApplicationById
);

module.exports = router;

