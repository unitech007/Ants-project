const fs = require('fs');
const path = require('path');

const loadLanguage = (lang) => {
    const filePath = path.join(__dirname, '../locales', `${lang}.json`);
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
        console.error(`Language file not found: ${filePath}`);
        return {}; // Fallback to an empty object if file not found
    }
};

module.exports = (req, res, next) => {
    const lang = req.session?.lang || 'en'; // Default to English if session or lang is undefined
    const translations = loadLanguage(lang);

    // Add translation helper function to request and response objects
    req.__ = (key, params = {}) => {
        const keys = key.split('.');
        let value = translations;

        keys.forEach(k => {
            value = value?.[k];
        });

        // Replace placeholders with params (e.g., {{subservice}})
        return value?.replace(/\{\{(.*?)\}\}/g, (_, match) => params[match.trim()] || '') || key;
    };

    res.locals.__ = req.__; // Make it available in views
    next();
};
