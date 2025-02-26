 const express = require("express");
const router = express.Router();
const Booking = require("../models/booking"); // Import Booking model

// Admin route to get all bookings
router.get("/", async (req, res) => {
    try {
        // Fetch all bookings, and populate the user details
        const bookings = await Booking.find().populate('user','username'); // Populate the 'name' field of the 'user'
        
        res.render("booking/bookingdetails", { bookings });
    } catch (err) {
        console.error("Error fetching bookings:", err.message);
        res.status(500).send("Server Error");
    }
});

router.put("/cancel-booking/:id",  async function(req, res) {
    try {
        const bookingId = req.params.id;
        console.log(`Attempting to cancel booking with ID: ${bookingId}`);

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            { stage: "cancelled" }, 
            { new: true }
        );

        if (!updatedBooking) {
            console.log(`Booking with ID ${bookingId} not found.`);
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        console.log(`Booking with ID ${bookingId} cancelled successfully.`);
        req.flash("success", "Booking cancelled successfully.");
        res.json({ success: true, message: "Booking cancelled successfully." });

    } catch (err) {
        console.error("Error cancelling booking:", err);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
});

module.exports = router;