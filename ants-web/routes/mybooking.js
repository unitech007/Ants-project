var express = require("express");
var router = express.Router();
const Booking = require("../models/booking"); // Assuming Booking model exists
const middleware = require('../middleware');

// Route to display the booking details
router.get("/",middleware.isLoggedIn, async function(req, res) {
    try {
        // Fetch the most recent booking or the bookings related to the user (if you're tracking user sessions)
        const bookings = await Booking.find({ user: req.user._id }); // Optionally filter by user if sessions are implemented
        res.render("booking/mybooking", { bookings: bookings });
    } catch (err) {
        console.error("Error fetching booking details:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
