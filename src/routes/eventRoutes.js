const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateRequiredFields } = require('../middlewares/validateInput');

router.get('/', eventController.getAllEvents);

router.post(
  '/',
  validateRequiredFields(['title', 'date', 'total_capacity']),
  eventController.createEvent
);

router.post(
  '/:id/attendance',
  validateRequiredFields(['booking_code']),
  eventController.recordAttendance
);

module.exports = router;