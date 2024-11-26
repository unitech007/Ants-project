const mongoose = require('mongoose');

// Define the schema for contact form data
const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create and export the model
const enquiry = mongoose.model('enquiry', enquirySchema);
module.exports = enquiry;
