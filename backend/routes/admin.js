const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/dashboard', authenticate, requireRole('admin'), adminController.getDashboard);
router.get('/config', authenticate, requireRole('admin'), adminController.getConfigs);
router.put('/config', authenticate, requireRole('admin'), adminController.updateConfig);
router.post('/audit/trigger', authenticate, requireRole('admin'), adminController.triggerAudit);
router.get('/reports/export', authenticate, requireRole('admin'), adminController.exportReport);

// User management routes
router.post('/users/create', authenticate, requireRole('admin'), adminController.createUser);
router.get('/users', authenticate, requireRole('admin'), adminController.manageUsers);
router.put('/users/role', authenticate, requireRole('admin'), adminController.manageUsers);
router.put('/users/status', authenticate, requireRole('admin'), adminController.manageUsers);

module.exports = router;



