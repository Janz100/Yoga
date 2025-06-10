const db = require('../config/db');

// Create bookings table if not exists
const createBookingTable = async () => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        date DATE NOT NULL,
        time VARCHAR(50),
        type VARCHAR(100),
        goals TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅Bookings table ensured.");
  } catch (err) {
    console.error("❌Error creating bookings table:", err);
  }
};

const bookSession = async ({ name, email, phone, date, time, type, goals }) => {
  try {
    const query = `
      INSERT INTO bookings (name, email, phone, date, time, type, goals)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [name, email, phone, date, time, type, goals];
    const result = await db.one(query, values);
    return result;
  } catch (err) {
    console.error("❌Booking error:", err);
    throw err;
  }
};

const getAll = async () => {
  return await db.any('SELECT * FROM bookings ORDER BY created_at DESC');
};

const update = async (id, data) => {
  const { name, email, phone, date, time, type, goals } = data;
  return await db.none(
    `UPDATE bookings
     SET name = $1, email = $2, phone = $3, date = $4, time = $5, type = $6, goals = $7
     WHERE id = $8`,
    [name, email, phone, date, time, type, goals, id]
  );
};

const remove = async (id) => {
  return await db.none('DELETE FROM bookings WHERE id = $1', [id]);
};

// Export everything
module.exports = {
  createBookingTable,
  bookSession,
  getAll,
  update,
  delete: remove
};
