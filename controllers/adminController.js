const pool = require('../config/db'); // PostgreSQL pool connection

exports.getAdminDashboard = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY date');
    const bookings = result.rows;
    res.render('AdminBookings', { bookings }); // Pass data to EJS view
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send('Server Error');
  }
};
