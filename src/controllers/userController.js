const pool = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id ASC');

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching users.',
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name is required and must be a non-empty string.',
      });
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Email is required and must be a non-empty string.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email must be a valid email address.',
      });
    }

    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists.',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name.trim(), email.trim()]
    );

    const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: newUser[0],
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating user.',
    });
  }
};

const getUserById = async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID. Must be a positive integer.',
    });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching user.',
    });
  }
};

const getUserBookings = async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID. Must be a positive integer.',
    });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    const [bookings] = await pool.query(
      `SELECT 
        b.id AS booking_id,
        b.booking_code,
        b.num_tickets,
        b.booking_date,
        e.id AS event_id,
        e.title AS event_title,
        e.description AS event_description,
        e.date AS event_date
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        user: users[0],
        bookings,
      },
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching user bookings.',
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  getUserBookings,
};