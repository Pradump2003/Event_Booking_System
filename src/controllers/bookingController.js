const pool = require('../config/database');
const generateBookingCode = require('../utils/generateCode');
const { isPositiveInteger } = require('../middlewares/validateInput');

const createBooking = async (req, res) => {
  const { user_id, event_id, num_tickets } = req.body;

  if (!isPositiveInteger(user_id)) {
    return res.status(400).json({
      success: false,
      error: 'user_id must be a positive integer.',
    });
  }


  if (!isPositiveInteger(event_id)) {
    return res.status(400).json({
      success: false,
      error: 'event_id must be a positive integer.',
    });
  }

  const ticketsRequested = num_tickets || 1;

  if (!isPositiveInteger(ticketsRequested)) {
    return res.status(400).json({
      success: false,
      error: 'num_tickets must be a positive integer.',
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [users] = await connection.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    const [events] = await connection.query(
      'SELECT * FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );

    if (events.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Event not found.',
      });
    }

    const event = events[0];

    if (new Date(event.date) <= new Date()) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Cannot book tickets for a past event.',
      });
    }

    if (event.remaining_tickets < ticketsRequested) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        error: `Not enough tickets available. Only ${event.remaining_tickets} ticket(s) remaining.`,
      });
    }

    const bookingCode = generateBookingCode();

    const [bookingResult] = await connection.query(
      'INSERT INTO bookings (user_id, event_id, booking_code, num_tickets) VALUES (?, ?, ?, ?)',
      [user_id, event_id, bookingCode, ticketsRequested]
    );

    await connection.query(
      'UPDATE events SET remaining_tickets = remaining_tickets - ? WHERE id = ?',
      [ticketsRequested, event_id]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        booking_id: bookingResult.insertId,
        user_id,
        event_id,
        num_tickets: ticketsRequested,
        booking_code: bookingCode,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating booking.',
    });
  }
};

module.exports = {
  createBooking,
};