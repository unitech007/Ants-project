require("dotenv").config();
var express = require("express");
var app = express();
const languageMiddleware = require('./middleware/language');
const i18n = require('i18n');
const path = require('path');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Admin = require("./models/admin");
var indexRoutes = require("./routes/index");
var adminRoutes = require("./routes/admin");
var customerRoutes = require("./routes/customer");
var vendorRoutes = require("./routes/vendor");
var commentRoutes = require("./routes/comment");
const enquiryRoutes = require("./routes/enquiry");
const bookingRoutes = require("./routes/booking");
const bookingdetailsRoutes = require("./routes/bookingdetails");
var editbookingRoutes = require("./routes/editbooking");
const servicesRouter = require('./routes/services');


mongoose.connect(
    "mongodb+srv://antsuser:Work45day123@ants-cluster.jrmeo.mongodb.net/?retryWrites=true&w=majority&appName=ants-cluster",
         /* "mongodb://localhost:27017/ants", */
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
    .then(() => console.log("Connected to Cosmos DB successfully!"))
    .catch(err => console.error("Error connecting to Cosmos DB:", err));
/* mongoose.connect("mongodb+srv://antsuser:Work45day123@ants-cluster.jrmeo.mongodb.net/?retryWrites=true&w=majority&appName=ants-cluster"); */
/* mongoose.connect("mongodb://localhost:27017/ants", { useNewUrlParser: true }); */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(function (req, res, next) {
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
    next();
});

// Configure i18n
i18n.configure({
  locales: ['en', 'ta', 'ar'], // Supported languages
  directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    cookie: 'lang',
    queryParameter: 'lang',
    autoReload: true,
    objectNotation: true,
});

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "services at one stop destination",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use("admin", new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(async function (username, done) {
    try {
        // Assuming you authenticate using 'username' field, not '_id'
        const admin = await Admin.findOne({ username: username }); // Find by username, not by ObjectId
        if (!admin) {
            return done(new Error("Admin not found"), null);
        }
        return done(null, admin);
    } catch (err) {
        return done(err, null);
    }
});


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(languageMiddleware);
app.use(indexRoutes);
app.use(adminRoutes);
app.use(customerRoutes);
app.use(vendorRoutes);
app.use(commentRoutes);
app.use('/enquiry', enquiryRoutes);
app.use('/booking', bookingRoutes);
app.use('/bookingdetails', bookingdetailsRoutes);
app.use('/editbooking',editbookingRoutes);
app.use('/services', servicesRouter);


//Route for logout
app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/services");
});

/* app.listen(process.env.PORT, function () {
    console.log("Ants admin panel has started on server with PORT: 3001"); */
    const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});