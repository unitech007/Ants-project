const express = require('express');
const router = express.Router();
const Enquiry = require('../models/enquiry'); // Assuming the model is shared or copied here

// Fetch all enquiries
router.get('/', async (req, res) => {
    try {
        const enquiries = await Enquiry.find(); // Fetch all enquiries from the database
        res.render('enquiry/enquiry', { enquiries });
    } catch (err) {
        console.error('Error fetching enquiries:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
