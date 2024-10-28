 var express = require("express");
 var router = express.Router();
 const Vendor = require("../models/vendor");
 const Booking = require("../models/booking"); // Import the Booking model (assuming you have a Booking model)
 const middleware = require('../middleware'); // Require the middleware
 
 //Unified booking route for all services
 router.get("/", async function(req, res) {
     try {
         const serviceName = req.query.serviceName;
         const subServiceName = req.query.subServiceName;

         // Fetch vendors for the specific subservice from the database
         /* const vendors = await Vendor.find({ subservice: subServiceName }); */
         /* console.log(`Fetched Vendors for ${subServiceName}:`, vendors); */
         // Fetch all vendors
         const vendors = await Vendor.find(); 
         console.log("Fetched All Vendors:", vendors);

         // Render the booking page with the subservice and fetched vendors
         res.render("booking/booking", { serviceName: serviceName, subServiceName: subServiceName, vendor: vendors });
     } catch (err) {
         console.error("Error fetching vendors:", err);
         res.status(500).send("Server Error");
     }
 });
 
 // POST route to handle form submission
 // Use the middleware.isLoggedIn middleware to protect this route
 router.post("/",middleware.isLoggedIn, async function(req, res) {
     try {
         const { date, time, vendor, serviceName, subServiceName } = req.body;
 
         // Save the booking to the database (e.g., Booking model)
         const newBooking = new Booking({
             serviceName,
             subServiceName,
             date,
             time,
             vendor,
             user: req.user._id  // Associate the booking with the logged-in user's ID
         });
         await newBooking.save();
 
         // Redirect to a success page or send confirmation
         res.redirect("/mybooking"); // Redirect to the user's booking page
     } catch (err) {
         console.error("Error creating booking:", err);
         res.status(500).send("Booking error");
     }
 });
 
 module.exports = router;
 


