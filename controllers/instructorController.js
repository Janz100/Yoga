const Booking = require('../models/bookingModel');

// Render the instructor booking page
exports.getInstructorPage = (req, res) => {
  res.render('instructor'); // views/instructor.ejs must exist
};

// Handle booking form submission
exports.bookSession = async (req, res) => {
  try {
    const booked = await Booking.bookSession(req.body);
    res.status(200).json({ message: "Booking successful", data: booked });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to book session" });
  }
};

// Get all bookings (you can filter by user if needed)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll(); // You need to define getAll in your model
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ error: "Failed to get bookings" });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const updated = await Booking.update(req.params.id, req.body);
    res.status(200).json({ message: "Booking updated", data: updated });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.delete(req.params.id);
    res.status(200).json({ message: "Booking deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

