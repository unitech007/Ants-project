require("dotenv").config();
var express = require("express");
const session = require('express-session');
const languageMiddleware = require('./middleware/language');
var app = express();
const i18n = require('i18n');
const path = require('path');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Customer = require("./models/customer");
var Vendor = require("./models/vendor");
var comment = require("./models/comment");
var indexRoutes = require("./routes/index");
var customerRoutes = require("./routes/customer");
var vendorRoutes = require("./routes/vendor");
var commentRoutes = require("./routes/comment");
var bookingRoutes = require("./routes/booking");
var mybookingRoutes = require("./routes/mybooking");
var editbookingRoutes = require("./routes/editbooking");
const enquiryRoutes = require('./routes/enquiry');
const servicesRouter = require('./routes/services');
var isCustomer = null;
const EmailTemplate = require('./models/emailtemplate'); // Import the EmailTemplate model
const seedDatabase = require("./seeders/seedDatabase");
const seeddefaultvendor=require("./seeders/seeddefaultvendor");


// Email template seeding function
const seedEmailTemplates = async () => {
    const templates = [
        {
            name: 'user_password_reset',
            subject: 'Password Reset Request',
            html: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
            text: 'Click the following link to reset your password: {{resetLink}}'
        },
        {
            name: 'admin_password_reset',
            subject: 'Password Reset Requested for {{email}}',
            html: '<p>A password reset was requested for the account: {{email}}.</p>',
            text: 'A password reset was requested for the account: {{email}}.'
        }
    ];

    for (let template of templates) {
        const existingTemplate = await EmailTemplate.findOne({ name: template.name });
        if (!existingTemplate) {
            await EmailTemplate.create(template);
            console.log(`Email template "${template.name}" added to database.`);
        }
    }
};


app.use(bodyParser.urlencoded({ extended: true }));
app.use(i18n.init);
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

// PASSPORT CONFIGURATION
app.use(session({
  secret: 'secret',  // Replace with your secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set secure to true if using https
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use("customer", new LocalStrategy(
  async function (username, password, done) {
    try {
      const user = await Customer.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      user.authenticate(password, function (err, user) {
        if (err || !user) {
          return done(null, false, { message: "Incorrect password" });
        } else {
          isCustomer = true;
          return done(null, user);
        }
      });
    } catch (err) {
      return done(err);
    }
  }
));

passport.use("vendor", new LocalStrategy(
  async function (username, password, done) {
    try {
      const user = await Vendor.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Vendor not found" });
      }
      user.authenticate(password, function (err, user) {
        if (err || !user) {
          return done(null, false, { message: "Incorrect password" });
        } else {
          isCustomer = false;
          return done(null, user);
        }
      });
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser(function (user, done) {
   done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    let user;
    if (isCustomer) {
        user = await Customer.findById(id); // No need for `{ _id: id }`, `findById` expects just the `id`
    } else {
        user = await Vendor.findById(id);
    }

    if (!user) {
        return done(new Error("User not found"), null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Middleware to make session data available to all views
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.__ = res.__;
  next();
});

app.use(languageMiddleware);
app.use(indexRoutes);
app.use(customerRoutes);
app.use(vendorRoutes);
app.use(commentRoutes);
app.use('/enquiry', enquiryRoutes);
app.use('/booking', bookingRoutes);
app.use('/mybooking',mybookingRoutes);
app.use('/editbooking',editbookingRoutes);
app.use('/services', servicesRouter);



// Route for logout
app.get("/logout", function (req, res) {
  req.logout();
  isCustomer = null;
  req.flash("success", "Logged you out!");
  res.redirect("/services");
});

// ** Landing Page Route (Loads First) **
app.get("/", (req, res) => {
  res.render("landing"); // Renders landing.ejs
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);

  mongoose.connect(

       "mongodb+srv://antsuser:Work45day123@ants-cluster.jrmeo.mongodb.net/?retryWrites=true&w=majority&appName=ants-cluster",
         /* "mongodb://localhost:27017/ants", */
    { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 15000, })
    .then(() => {
      console.log("Connected to mongodb successfully!");
      // Seed the email templates after DB connection
      seedEmailTemplates().catch(console.error);
      seedDatabase();
      seeddefaultvendor();
    })
    .catch(err => console.error("Error connecting to mongodb:", err));
});
