var express = require("express");
var router = express.Router();

//ROUTE FOR THE ANTS LANDING PAGE
router.get("/", function (req, res) {
	res.render("landing");
});

/* //ROUTE FOR THE SERVICES PAGE
router.get("/services", function (req, res) {
	res.render("services");
});

//ROUTE FOR ALL SUBSERVICES PAGE
router.get("/services/:subservice", function (req, res) {
	var subservice = req.params.subservice;
	res.render("subservices/" + subservice);
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