var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Vendor = require("../models/vendor");
var Comment = require("../models/comment");
const Booking = require("../models/booking");
var Service = require("../models/service");
var Subservice = require("../models/subservice");
const Worktype = require("../models/worktype");
const EmailTemplate = require('../models/emailtemplate');
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var multer = require("multer");
const emailcontrollers = require('../controllers/emailcontrollers');

//CLOUDINARY RELATED CODE
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
    return cb(new Error("Only jpg, jpeg and png files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })
var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dwnoxkmak",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//ROUTE FOR THE VENDOR LOGIN PAGE
router.get("/vendor/login", function (req, res) {
  res.render("vendor/v_login");
});

// ROUTE FOR VENDOR LOGIN
router.post("/vendor/login", function (req, res, next) {
  // Trim spaces from the username and password
  req.body.username = req.body.username.trim();
  req.body.password = req.body.password.trim();

  // Proceed with Passport authentication
  passport.authenticate("vendor", {
      successRedirect: "/myservices",
      failureRedirect: "/vendor/login",
      failureFlash: "Incorrect username or Password",
      successFlash: "Welcome to Ants!"
  })(req, res, next);
}, function (req, res) {
  // You can add additional actions here if needed after login
});


//ROUTE FOR CHECK VENDOR APPROVAL LOGIN
 router.post("/vendor/login", function (req, res, next) {
   passport.authenticate("vendor", function (err, vendor, info) {
     if (err) {
       req.flash("error", err.message);
       return res.redirect("/vendor/login");
     }
     if (!vendor) {
       req.flash("error", "Incorrect username or Password");
       return res.redirect("/vendor/login");
     }
     console.log("Vendor approval status: ", vendor.isApproved); // Debug log
     if(!vendor.isApproved){
       req.flash("error", "Your request is not approved! Please wait for Approval. Our Ants team will contact you soon.");
       return res.redirect("/vendor/login");
     }
     req.logIn(vendor, function (err) {
       if (err) {
         req.flash("error", err.message);
         return res.redirect("/vendor/login");
       }
       return res.redirect("/myservices");
     });
   })(req, res, next);
 });

// ROUTE FOR THE VENDOR REGISTRATION PAGE
router.get("/vendor/register",async function (req, res) {
  try {
    // Fetching services and subservices from the database
    const services = await Service.find({});
    
  res.render("vendor/v_register", {
    error: null,  // Default value for errors
    fname: "",lname: "",username: "",email: "",confirmemail: "",address: "",area: "",city: "",state: "",
    pincode: "",mobile: "",service: "",subservice: "",description: "",experience: "",visitCharge: "",
    services: services, // Pass the list of services to the template
    subservices: []  // Pass the list of subservices to the template
  });
}  catch (err) {
  console.error(err);
  res.render("vendor/v_register", {
    error: "Failed to load services",
    fname: "",lname: "",username: "",email: "",confirmemail: "",address: "",area: "",city: "",state: "",
    pincode: "",mobile: "",service: "",subservice: "",description: "",experience: "",visitCharge: "",services: [],
    subservices: []
  });
}
});

// ROUTE FOR FETCHING SUBSERVICES BASED ON SELECTED SERVICE
router.get("/vendor/getSubservices/:serviceId", async (req, res) => {
  const serviceId = req.params.serviceId; // Get the selected service ID from the request parameters

  try {
    // Fetch subservices that belong to the selected service
    const subservices = await Subservice.find({ service: serviceId });

    // Send the subservices as a JSON response
    res.json(subservices);
  } catch (err) {
    console.error("Error fetching subservices:", err);
    res.status(500).json({ error: "Failed to fetch subservices" });
  }
});



//ROUTE FOR THE VENDOR REGISTERATION
router.post("/vendor/register", upload.single("image"), function (req, res) {

  var fname = req.body.fname;
  var lname = req.body.lname;
  var username = req.body.username;
  var email = req.body.email;
  var confirmemail = req.body.confirmemail;
  var password = req.body.password;
  var confirmpassword = req.body.confirmpassword;
  var address = req.body.address;
  var area = req.body.area;
  var city = req.body.city;
  var state = req.body.state;
  var pincode = req.body.pincode;
  var mobile = req.body.mobile;
  var service = req.body.service;
  var subservice = req.body.subservice;
  var description = req.body.description;
  var experience = req.body.experience;
  var visitCharge = req.body.visitCharge;

  req.checkBody("fname", "First Name can only have letters").isAlpha();
  req.checkBody("lname", "Last Name can only have letters").isAlpha();
  req.checkBody("username", "Username can only have  letters and numbers").isAlphanumeric();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("confirmemail", "Emails do not match").equals(req.body.email);
  req.checkBody("password", "Password must be 8 - 20 characters long with one uppercase letter, one lowercase letter and one number").matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,30}$");
  req.checkBody("confirmpassword", "Passwords do not match").equals(req.body.password);
  req.checkBody("area", "Area is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("city", "City is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("state", "State is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("pincode", "Pincode is not valid").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number can only have numbers").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number is not valid").matches("^[6-9][0-9]{9}$");
  req.checkBody("service", "Service cannot be empty").notEmpty();
  req.checkBody("subservice", "Subservice cannot be empty").notEmpty();
  req.checkBody("description", "Description cannot be empty").notEmpty();


  // Get validation errors
  var errors = req.validationErrors();
  if (errors) {
    // Render the form with the error message and preserve field values
    return res.render("vendor/v_register", {
      error: errors[0].msg,
      fname: fname,
      lname: lname,
      username: username,
      email: email,
      confirmemail: confirmemail,
      address: address,
      area: area,
      city: city,
      state: state,
      pincode: pincode,
      mobile: mobile,
      service: service,
      subservice: subservice,
      description: description,
      experience: experience,
      visitCharge: visitCharge
    });
  } else {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      var newVendor = new Vendor({
        isCustomer: false,
        fname: fname,
        lname: lname,
        username: username,
        email: email,
        confirmemail: confirmemail,
        address: address,
        area: area,
        city: city,
        state: state,
        pincode: pincode,
        mobile: mobile,
        service: service,
        subservice: subservice,
        experience: experience,
        visitCharge: visitCharge,
        description: description,
        image: result.secure_url,
        imageId: result.public_id
      });

      Vendor.register(newVendor, password, function (err, vendor) {
        if (err) {
          req.flash("error", err.message);
          return res.render("vendor/v_register");
        }
        passport.authenticate("vendor")(req, res, function () {
          req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
          res.redirect("/myservices");
        });
      });
    });
  }
});

//ROUTE FOR THE VENDOR EDIT PAGE
router.get("/vendor/:id/edit", middleware.isLoggedIn, function (req, res) {
  res.render("vendor/v_edit");
});

// ROUTE FOR THE VENDOR UPDATE PAGE
router.put("/vendor/:id", middleware.isLoggedIn, upload.single("image"), async (req, res) => {
  const {
    fname,
    lname,
    username,
    email,
    area,
    city,
    state,
    pincode,
    mobile,
    description,
    experience,
    visitCharge,
  } = req.body;

  // Input validation
  req.checkBody("fname", "First Name can only have letters").isAlpha();
  req.checkBody("lname", "Last Name can only have letters").isAlpha();
  req.checkBody("username", "Username can only have letters and numbers").isAlphanumeric();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("area", "Area is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("city", "City is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("state", "State is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("pincode", "Pincode is not valid").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number can only have numbers").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number is not valid").matches("^[6-9][0-9]{9}$");

  const errors = req.validationErrors();
  if (errors) {
    return res.render("vendor/v_edit", {
      error: errors[0].msg,
    });
  }

  try {
    // Find the vendor by ID
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      req.flash("error", "Vendor not found");
      return res.redirect("/vendor/" + req.params.id + "/edit");
    }

    // Handle image upload if a new image is provided
    if (req.file) {
      try {
        // Delete the existing image from Cloudinary
        if (vendor.imageId) {
          await cloudinary.v2.uploader.destroy(vendor.imageId);
        }

        // Upload the new image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        vendor.image = result.secure_url;
        vendor.imageId = result.public_id;
      } catch (err) {
        req.flash("error", "Image upload failed: " + err.message);
        return res.redirect("back");
      }
    }

    // Update vendor details
    vendor.fname = fname;
    vendor.lname = lname;
    vendor.username = username;
    vendor.email = email;
    vendor.area = area;
    vendor.city = city;
    vendor.state = state;
    vendor.pincode = pincode;
    vendor.mobile = mobile;
    vendor.description = description;
    vendor.experience = experience;
    vendor.visitCharge = visitCharge;

    // Save the updated vendor details
    await vendor.save();

    req.flash("success", "Successfully updated details for " + vendor.username);
    res.redirect("/myservices");
  } catch (err) {
    req.flash("error", "Something went wrong: " + err.message);
    res.redirect("/vendor/" + req.params.id + "/edit");
  }
});


// ROUTE FOR VENDOR FORGOT PASSWORD PAGE
router.get("/vendor/forgot", (req, res) => {
  res.render("vendor/v_forgotpassword");
});

// POST ROUTE FOR VENDOR FORGOT PASSWORD
router.post("/vendor/forgot", async (req, res, next) => {
  try {
    // Generate token
    const token = await new Promise((resolve, reject) => {
      crypto.randomBytes(20, (err, buf) => {
        if (err) reject(err);
        resolve(buf.toString("hex"));
      });
    });

    // Find vendor by email
    const user = await Vendor.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/vendor/forgot");
    }

    // Set reset token and expiration
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Prepare email content
    const resetLink = `http://${req.headers.host}/vendor/reset/${token}`;

    // Fetch email template for customer reset email
    const userTemplate = await EmailTemplate.findOne({ name: 'user_password_reset' });
    const userMailOptions = {
        to: user.email, // User's email
        placeholderData: {
            resetLink: resetLink
        }
    };
    await emailcontrollers.sendEmail('user_password_reset', user.email, userMailOptions.placeholderData);
    
    // Fetch email template for admin notification email
    const adminTemplate = await EmailTemplate.findOne({ name: 'admin_password_reset' });
    const adminMailOptions = {
        to: process.env.ADMIN_EMAIL, // Admin's email from environment variables
        placeholderData: {
            email: user.email
        }
    };
    await emailcontrollers.sendEmail('admin_password_reset', process.env.ADMIN_EMAIL, adminMailOptions.placeholderData);

    req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
    res.redirect("/vendor/forgot");
  } catch (err) {
    next(err);
  }
});

// ROUTE FOR VENDOR RESET PASSWORD PAGE
router.get("/vendor/reset/:token", async (req, res) => {
  try {
    const user = await Vendor.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/vendor/forgot");
    }

    res.render("vendor/v_resetpassword", { token: req.params.token });
  } catch (err) {
    req.flash("error", "Something went wrong.");
    res.redirect("/vendor/forgot");
  }
});

// POST ROUTE FOR VENDOR RESET PASSWORD
router.post("/vendor/reset/:token", async (req, res) => {
  try {
    const user = await Vendor.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/vendor/forgot");
    }

    if (req.body.password !== req.body.confirm) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("back");
    }

    // Use passport-local-mongoose to set a new password
    await user.setPassword(req.body.password);

    // Clear reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    req.flash("success", "Your password has been successfully updated!");
    res.redirect("/vendor/login");
  } catch (err) {
    req.flash("error", "Something went wrong.");
    res.redirect("back");
  }
});





//ROUTE TO SEE ALL THE VENDORS LIST DEPENDING ON SERVICE AND SUBSERVICE
 /* router.get("/:service/:subservice", function (req, res) {
  Vendor.find({ isApproved: true, service: req.params.service, subservice: req.params.subservice }, function (err, foundVendors) {
    if (err) {
      req.flash("error", err.message);
    } else {
      res.render("vendor/v_list", { foundVendors: foundVendors });
    }
  });
});  */

//ROUTE TO SEE THE SPECIFIC VENDOR DEPENDING ON SERVICE, SUBSERVICE AND VENDOR ID
router.get("/:service/:subservice/:id", middleware.isLoggedIn, async (req, res) => {
  try {
    // Find the vendor and populate comments
    const foundVendor = await Vendor.findById(req.params.id).populate("comments").exec();

    if (!foundVendor) {
      req.flash("error", "Vendor not found!");
      return res.redirect("/myservices");
    }

    // Check if vendor is approved
    if (!foundVendor.isApproved) {
      if (res.locals.currentUser.isCustomer) {
        req.flash("error", "Not Allowed!");
        return res.redirect("/myservices");
      } else if (res.locals.currentUser.username !== foundVendor.username) {
        req.flash("error", "Not Allowed!");
        return res.redirect("/myservices");
      } else {
        return res.render("vendor/v_show", {
          vendor: foundVendor,
          error: "Your profile is not verified yet and will not be visible to others. Ants team will contact you soon for verification.",
        });
      }
    }

    // Render vendor page if approved
    res.render("vendor/v_show", { vendor: foundVendor });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/myservices");
  }
});

/////////////////////////////////////////BOOKING DETAILS/////////////////////////////////
/// Route to get booking details for a vendor
router.get('/booking/bookingdetails', async (req, res) => {
  if (!req.user || req.user.isCustomer) {
      return res.redirect('/'); // Redirect non-vendors
  }

  try {
      // Fetch active and cancelled bookings separately
      const activeBookings = await Booking.find({ "vendor.username": req.user.username, stage: "active" });
      /* const cancelledBookings = await Booking.find({ "vendor.username": req.user.username, stage: "cancelled" }); */

      let pendingBookings = [];
      let completedBookings = [];
      let cancelledBookings = [];

      if (activeBookings.length > 0) {
          // Fetch pending and completed bookings if stage is active
          pendingBookings = await Booking.find({ 
              "vendor.username": req.user.username, 
              status: 'Pending',
              stage: 'active' 
          }).populate({
              path: 'user',
              populate: {
                  path: 'addresses',
                  match: { isDefault: true }, // Fetch only the default address
              }
          }).exec();

          completedBookings = await Booking.find({ 
              "vendor.username": req.user.username, 
              status: 'Completed',
              stage: 'active' 
          }).populate({
              path: 'user',
              populate: {
                  path: 'addresses',
                  match: { isDefault: true }, // Fetch only the default address
              }
          }).exec();
      }
        // Fetch cancelled bookings and populate user details
        cancelledBookings = await Booking.find({ 
          "vendor.username": req.user.username, 
          stage: 'cancelled' 
      }).populate({
          path: 'user',
          populate: {
              path: 'addresses',
              match: { isDefault: true }, // Fetch only the default address
          }
      }).exec();

      res.render('booking/bookingdetails', {
          currentUser: req.user,
          pendingBookings,
          completedBookings,
          cancelledBookings, // Show cancelled bookings if any
      });

  } catch (error) {
      console.error('Error fetching bookings:', error);
      res.render('booking/bookingdetails', {
          currentUser: req.user,
          pendingBookings: [],
          completedBookings: [],
          cancelledBookings: [],
          error: 'Error fetching booking details.',
      });
  }
});

// POST method to mark a booking as Completed
router.post('/booking/bookingdetails/:id/complete', async (req, res) => {
  try {
      // Find the booking and check if it's active before updating
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
          return res.redirect('/booking/bookingdetails');
      }

      // Only update the status if the booking stage is "active"
      if (booking.stage === "active") {
          await Booking.findByIdAndUpdate(req.params.id, { status: 'Completed' });
      } else {
          console.log("Booking cannot be completed as it is cancelled.");
      }

      res.redirect('/booking/bookingdetails');

  } catch (error) {
      console.error('Error updating booking status:', error);
      res.redirect('/booking/bookingdetails');
  }
});

///////////////////////////////////////service table////////////////////////////////////////////

router.get("/myservices", async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Find the vendor to get its service and subservice
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).send("Vendor not found!!!");
    }

    const { service, subservice } = vendor;

    // Fetch all worktypes that match the vendor's service and subservice
    const worktypes = await Worktype.find({ service, subservice });

    // Merge with existing prices from vendor.worktypePrices
    const worktypesWithPrices = worktypes.map(worktype => {
      const existingPrice = vendor.worktypePrices.find(wp => wp.worktype.toString() === worktype._id.toString());
      return {
        _id: worktype._id,
        name: worktype.name,
        price: existingPrice ? existingPrice.price : 0 // Default price is 0 if not set
      };
    });

    res.render("myservices", { worktypes: worktypesWithPrices });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.post("/update-price/:id", async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { id } = req.params; // Worktype ID
    const { price } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).send("Vendor not found");
    }

    // Check if worktype already exists in vendor.worktypePrices
    let worktypeEntry = vendor.worktypePrices.find(wp => wp.worktype.toString() === id);

    if (worktypeEntry) {
      // Update existing worktype price
      worktypeEntry.price = price;
    } else {
      // Add new worktype price entry
      vendor.worktypePrices.push({ worktype: id, price });
    }

    await vendor.save();

    res.redirect("back"); // Reload the page
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



module.exports = router;