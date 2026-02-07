const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get(
  '/pending',
  authenticate,
  requireRole('verification_officer', 'admin'),
  verificationController.getPendingVerifications
);
router.post(
  '/:id/review',
  authenticate,
  requireRole('verification_officer', 'admin'),
  verificationController.reviewApplication
);
router.get(
  '/:id/certificate',
  authenticate,
  requireRole('verification_officer', 'admin'),
  verificationController.generateCertificate
);

module.exports = router;



