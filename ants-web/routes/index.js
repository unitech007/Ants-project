var express = require("express");
var router = express.Router();
var passport = require("passport");
var Vendor = require("../models/vendor");


// LANDING PAGE
router.get("/", function (req, res) {
    res.render("landing", {
        pageTitle: req.__("common.LandingPageTitle"),
        description: req.__("common.LandingPageDescription"),
        currentUser: req.user,
    });
});

// ABOUT US PAGE
router.get("/about", function (req, res) {
    res.render("about", {
        pageTitle: req.__("common.AboutUsTitle"),
        description: req.__("common.AboutUsDescription"),
    });
});

// CONTACT US PAGE
router.get("/contact", function (req, res) {
    res.render("contact", {
        pageTitle: req.__("common.ContactUsTitle"),
        description: req.__("common.ContactUsDescription"),
    });
});

// SERVICES PAGE
/* router.get("/services", function (req, res) {
    res.render("services", {
        pageTitle: req.__("common.ServicespageTitle"),
        description: req.__("common.ServicesDescription"),
        currentUser: req.user,
    });
}); */

// SUBSERVICES PAGE
/* router.get("/services/:subservice", function (req, res) {
    const subservice = req.params.subservice;
    res.render("subservices/" + subservice, {
        pageTitle: req.__("common.SubserviceTitle", { subservice }),
        description: req.__("common.SubserviceDescription", { subservice }),
    });
}); */

// Route to change the language
router.get("/change-language/:lang", function (req, res) {
    const lang = req.params.lang; // Get the language from the URL (e.g., 'en', 'ta', 'ar')

    // Check if the language is supported
    const supportedLanguages = ['en', 'ta', 'ar']; // Add more languages if needed
    if (!supportedLanguages.includes(lang)) {
        return res.status(400).send('Language not supported');
    }

    // Set the language in session or cookie
    req.session.lang = lang; // Using session to store the language
    // OR you could use cookies instead:
    // res.cookie('lang', lang); // If you prefer cookies

    // Redirect back to the referring page or homepage
    const redirectTo = req.headers.referer || '/';
    res.redirect(redirectTo);
});

module.exports = router;
