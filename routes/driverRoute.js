const express = require('express');
const { registerDriver } = require('../controllers/driverController');
const {
  authorizeRoles,
  approvalStatus,
  isLoggedInUser,
} = require('../middleware/auth');
const router = express.Router();

router.route('/api/v1/driver/add').post(registerDriver);
module.exports = router;
