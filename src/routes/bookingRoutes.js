const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { validateRequiredFields } = require('../middlewares/validateInput');

router.post(
  '/',
  validateRequiredFields(['user_id', 'event_id']),
  bookingController.createBooking
);

module.exports = router;