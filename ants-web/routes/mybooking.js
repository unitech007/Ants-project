var express = require("express");
var router = express.Router();
const Booking = require("../models/booking"); // Assuming Booking model exists
const middleware = require('../middleware');

// Route to display the booking details
router.get("/",middleware.isLoggedIn, async function(req, res) {
    try {
        // Fetch the most recent booking or the bookings related to the user (if you're tracking user sessions)
        const bookings = await Booking.find({ user: req.user._id, stage: "active" }); // Optionally filter by user if sessions are implemented
        res.render("booking/mybooking", { bookings: bookings,  messages: req.flash("success") });
    } catch (err) {
        console.error("Error fetching booking details:", err);
        res.status(500).send("Server Error");
    }
});


router.put("/cancel-booking/:id", middleware.isLoggedIn, async function(req, res) {
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
