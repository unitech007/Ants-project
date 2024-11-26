const express = require('express');
const router = express.Router();
const enquiry = require('../models/enquiry'); // Import the Contact model
const emailcontrollers=require('../controllers/emailcontrollers');
//var nodemailer = require("nodemailer");

// POST route to handle contact form submissions
router.post('/', async (req, res) => {
    const { user_name, user_email, user_mobile, user_subject, user_message } = req.body;

    try {
        // Create a new contact entry
        const newenquiry = new enquiry({
            name: user_name,
            email: user_email,
            mobile: user_mobile,
            subject: user_subject,
            message: user_message
        });

        // Save to MongoDB
        await newenquiry.save();
        //email send
        var mailOptions = {
            to: process.env.ADMIN_EMAIL,
            subject:user_subject ,
            text: user_message,
            html:"<p>"+user_message+"</p>"
         };
         await emailcontrollers.sendEmail(mailOptions);

        // Send success response
        //res.send('Thank you for contacting us! Your message has been received,Our Admin contact as soon');
        req.flash('success', 'Thank you for contacting us!');
        res.redirect('/contact');
    } catch (err) {
        console.error('Error saving contact form data:', err);
        //res.status(500).send('Something went wrong. Please try again later.');
        req.flash('error', 'Something went wrong. Please try again later.');
        res.redirect('/contact');
    }
});

module.exports = router;
