const axios = require('axios');

const API_URL = process.env.EMAIL_API_URL;

const sendEmail = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/emails/send`, data);
        return response.data;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error;
    }
};

module.exports = { sendEmail };