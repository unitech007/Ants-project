const express = require('express');
const router = express.Router();
const enquiry = require('../models/enquiry'); // Import the Contact model
const enquirycontrollers = require('../controllers/enquirycontrollers');

// POST route to handle contact form submissions
router.post('/', async (req, res) => {
    const { user_name, user_email, user_mobile, user_subject, user_message } = req.body;

    try {
        // Validate user email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user_email)) {
            req.flash('error', 'Invalid email address. Please try again.');
            return res.redirect('/contact');
        }

        // Create a new enquiry entry
        const newEnquiry = new enquiry({
            name: user_name,
            email: user_email,
            mobile: user_mobile,
            subject: user_subject,
            message: user_message
        });

        // Save the enquiry to the database
        await newEnquiry.save();

        // Email to Admin
        const adminMailOptions = {
            to: process.env.ADMIN_EMAIL, // Admin's email from environment variables
            subject: `New Enquiry: ${user_subject}`,
            text: `You have received a new enquiry from ${user_name} (${user_email}).\n\nMessage:\n${user_message}`,
            html: `
                <h3>New Enquiry</h3>
                <p><strong>Name:</strong> ${user_name}</p>
                <p><strong>Email:</strong> ${user_email}</p>
                <p><strong>Mobile:</strong> ${user_mobile}</p>
                <p><strong>Subject:</strong> ${user_subject}</p>
                <p><strong>Message:</strong> ${user_message}</p>
            `
        };
        await enquirycontrollers.sendEmail(adminMailOptions);

        // Email to User
        const userMailOptions = {
            to: user_email, // User's email
            subject: 'Thank you for your enquiry!',
            text: `Dear ${user_name},\n\nThank you for reaching out to us! We have received your message and will get back to you soon.\n\nYour Message:\n${user_message}\n\nBest regards,\nAnts Team`,
            html: `
                <p>Dear ${user_name},</p>
                <p>Thank you for reaching out to us! We have received your message and will get back to you soon.</p>
                <p><strong>Your Message:</strong></p>
                <p>${user_message}</p>
                <br>
                <p>Best regards,<br>Ants Team</p>
            `
        };
        await enquirycontrollers.sendEmail(userMailOptions);

        // Success response
        req.flash('success', 'Thank you for contacting us! Your message has been received.');
        res.redirect('/contact');
    } catch (err) {
        console.error('Error saving contact form data or sending emails:', err);
        req.flash('error', 'Something went wrong. Please try again later.');
        res.redirect('/contact');
    }
});

module.exports = router;
