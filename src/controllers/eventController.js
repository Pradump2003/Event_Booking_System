const pool = require('../config/database');
const { isPositiveInteger, isFutureDate } = require('../middlewares/validateInput');

const toMySQLDateTime = (input) => {
  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const pad = (value) => String(value).padStart(2, '0');

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
};

const getAllEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM events WHERE date > NOW() ORDER BY date ASC'
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching events.',
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, total_capacity } = req.body;

    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title must be a non-empty string.',
      });
    }

    if (!isFutureDate(date)) {
      return res.status(400).json({
        success: false,
        error: 'Date must be a valid future date.',
      });
    }

    const mysqlDate = toMySQLDateTime(date);
    if (!mysqlDate) {
      return res.status(400).json({
        success: false,
        error: 'Date format is invalid. Use a valid ISO date/time.',
      });
    }

    if (!isPositiveInteger(total_capacity)) {
      return res.status(400).json({
        success: false,
        error: 'total_capacity must be a positive integer.',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), description || null, mysqlDate, total_capacity, total_capacity]
    );

    const [newEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: newEvent[0],
    });
  } catch (error) {
    console.error('Error creating event:', error);

    if (error.code === 'ER_TRUNCATED_WRONG_VALUE' || error.code === 'ER_WRONG_VALUE') {
      return res.status(400).json({
        success: false,
        error: 'Date format is invalid. Use a valid ISO date/time.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating event.',
    });
  }
};

const recordAttendance = async (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const { booking_code } = req.body;

  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid event ID.',
    });
  }

  if (!booking_code || typeof booking_code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'booking_code is required and must be a string.',
    });
  }

  try {
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE booking_code = ? AND event_id = ?',
      [booking_code, eventId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found for this event with the provided code.',
      });
    }

    const booking = bookings[0];

    const [existingAttendance] = await pool.query(
      'SELECT * FROM event_attendance WHERE booking_id = ?',
      [booking.id]
    );

    if (existingAttendance.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Attendance has already been recorded for this booking.',
      });
    }

    await pool.query(
      'INSERT INTO event_attendance (booking_id, user_id, event_id) VALUES (?, ?, ?)',
      [booking.id, booking.user_id, eventId]
    );

    return res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: {
        event_id: eventId,
        booking_code: booking_code,
        user_id: booking.user_id,
        num_tickets: booking.num_tickets,
      },
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while recording attendance.',
    });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  recordAttendance,
};