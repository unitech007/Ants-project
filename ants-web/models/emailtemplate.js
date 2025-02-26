const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Template name (e.g., 'c_forgetpassword', 'v_forgetpassword')
    subject: { type: String, required: true }, // Email subject
    html: { type: String, required: true }, // HTML body of the email
    text:  { type: String, required: true },  // Plain-text body of the email
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
