const axios = require('axios');
const EmailTemplate = require('../models/emailtemplate'); // Import the model

const API_URL = process.env.EMAIL_API_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Fetch email template and send the email
const sendEmail = async (templateName, recipientEmail, placeholderData) => {
    try {
        // Fetch email template from MongoDB
        const emailTemplate = await EmailTemplate.findOne({ name: templateName });
        if (!emailTemplate) {
            throw new Error(`Email template "${templateName}" not found.`);
        }

        // Replace placeholders dynamically in the body and subject
        let emailBody = emailTemplate.text;  // Assuming text is the plain text version
        let emailSubject = emailTemplate.subject;

        Object.keys(placeholderData).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            emailBody = emailBody.replace(regex, placeholderData[key]);
            emailSubject = emailSubject.replace(regex, placeholderData[key]);
        });

        // Prepare email payload
        const emailPayload = {
            to: recipientEmail,
            from: ADMIN_EMAIL,
            subject: emailSubject,
            text: emailBody // Use `text` for plain text emails
        };

        // Send email via the external API
        const response = await axios.post(`${API_URL}/emails/send`, emailPayload);
        console.log('Email sent successfully:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error;
    }
};


module.exports = { sendEmail };
