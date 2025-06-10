// const express = require('express');
// const router = express.Router();

// // GET /instructor
// router.get('/', (req, res) => {
//   res.render('instructor'); 
// });

// router.post('/book', async (req, res) => {
//   const { name, email, phone, date, time, type , goals } = req.body;

//   try {
//     const result = await pool.query(
//       'INSERT INTO bookings (name, email, phone, date, time, type, goals) VALUES ($1, $2, $3, $4, $5, $6, $7)',
//       [name, email, phone, date, time, level, goals]
//     );
//     res.status(200).json({ message: "Booking stored successfully" });
//   } catch (err) {
//     console.error("Database insert error:", err);
//     res.status(500).json({ error: "Database error" });
//   }
// });

const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');

// GET /instructor
router.get('/instructor', instructorController.getInstructorPage);

// POST /book
router.post('/book', instructorController.bookSession);

// GET all bookings
router.get('/bookings', instructorController.getAllBookings);

// PUT update booking
router.put('/book/:id', instructorController.updateBooking);

// DELETE booking
router.delete('/book/:id', instructorController.deleteBooking);

module.exports = router;


