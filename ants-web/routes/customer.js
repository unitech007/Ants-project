var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Customer = require("../models/customer");
const Address = require("../models/address");
const EmailTemplate = require('../models/emailtemplate'); 
var middleware = require("../middleware");
var async = require("async");
var crypto = require("crypto");
const bcrypt = require('bcryptjs');
const emailcontrollers = require('../controllers/emailcontrollers');

// ROUTE FOR THE CUSTOMER LOGIN PAGE
router.get("/customer/login", function (req, res) {
   res.render("customer/c_login");
});

// ROUTE FOR CUSTOMER LOGIN
router.post("/customer/login", function (req, res, next) {
   // Trim spaces from the username and password
   req.body.username = req.body.username.trim();
   req.body.password = req.body.password.trim();

   // Proceed with Passport authentication
   passport.authenticate("customer", {
       successRedirect: "/services",
       failureRedirect: "/customer/login",
       failureFlash: "Incorrect username or Password",
       successFlash: "Welcome to Ants!"
   })(req, res, next);
}, function (req, res) {
   req.session.username = req.body.username; // Set the session variable--new line
});


// ROUTE FOR THE CUSTOMER REGISTRATION PAGE
router.get("/customer/register", function (req, res) {
   res.render("customer/c_register", {
      error: null,
      fname: "",
      lname: "",
      username: "",
      email: "",
      confirmemail: "",
      address: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      mobile: "",
      type: ""
   });
});

// ROUTE FOR CUSTOMER REGISTRATION
router.post("/customer/register", async function (req, res) {
   var {
      fname,
      lname,
      username,
      email,
      confirmemail,
      password,
      confirmpassword,
      address,
      area,
      city,
      state,
      pincode,
      mobile,
      type,
   } = req.body;

   req.checkBody("fname", "First Name can only have letters").isAlpha();
   req.checkBody("lname", "Last Name can only have letters").isAlpha();
   req.checkBody("username", "Username can only have letters and numbers").isAlphanumeric();
   req.checkBody("email", "Email is not valid").isEmail();
   req.checkBody("confirmemail", "Emails do not match").equals(req.body.email);
   req.checkBody("password", "Password must be 8 - 20 characters long with one uppercase letter, one lowercase letter, and one number").matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,30}$");
   req.checkBody("confirmpassword", "Passwords do not match").equals(req.body.password);
   req.checkBody("address", "Address is not valid").matches(/^[a-zA-Z0-9\s,./-]+$/, "i");
   req.checkBody("area", "Area is not valid").matches(/^[a-zA-Z\s]+$/, "i");
   req.checkBody("city", "City is not valid").matches(/^[a-zA-Z\s]+$/, "i");
   req.checkBody("state", "State is not valid").matches(/^[a-zA-Z\s]+$/, "i");
   req.checkBody("pincode", "Pincode is not valid").isNumeric({ no_symbols: true });
   req.checkBody("mobile", "Mobile number can only have numbers").isNumeric({ no_symbols: true });
   req.checkBody("mobile", "Mobile number is not valid").matches("^[6-9][0-9]{9}$");
   req.checkBody("type", "Please select a valid type").notEmpty();

   var errors = req.validationErrors();
   if (errors) {
      // Pass the values back to the form
      return res.render("customer/c_register", {
         error: errors[0].msg,
         fname,
         lname,
         username,
         email,
         confirmemail,
         address,
         area,
         city,
         state,
         pincode,
         mobile,
         type,
      });
   }

   try {
      // Create a new Customer
      var newCustomer = new Customer({
         isCustomer: true,
         fname,
         lname,
         username,
         email,
      });

      // Save the Customer and hash the password
      const customer = await Customer.register(newCustomer, password);

      // Create a new Address
      const newAddress = new Address({
         customerId: customer._id,
         address,
         area,
         city,
         state,
         pincode,
         mobile,
         type,
         isDefault: true, // You can set this as default
      });

      // Save the Address
      const savedAddress = await newAddress.save();

      // Link the Address to the Customer
      customer.addresses.push(savedAddress._id);
      await customer.save();

      // Authenticate and redirect
      passport.authenticate("customer")(req, res, function () {
         req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
         res.redirect("/services");
      });
   } catch (err) {
      console.error(err);
      req.flash("error", err.message);
      return res.render("customer/c_register", {
         error: "Registration failed. Please try again.",
         fname,
         lname,
         username,
         email,
         confirmemail,
         address,
         area,
         city,
         state,
         pincode,
         mobile,
         type,
      });
   }
});

// ROUTE FOR CUSTOMER EDIT PAGE
router.get("/customer/:id/edit", middleware.isLoggedIn, function (req, res) {
   res.render("customer/c_edit");
});



// ROUTE FOR CUSTOMER UPDATE PAGE
router.put("/customer/:id", middleware.isLoggedIn, function (req, res) {
   var fname = req.body.fname;
   var lname = req.body.lname;
   var email = req.body.email;

   req.checkBody("fname", "First Name can only have letters").isAlpha();
   req.checkBody("lname", "Last Name can only have letters").isAlpha();
   req.checkBody("email", "Email is not valid").isEmail();

   var errors = req.validationErrors();
   if (errors) {
      res.render("customer/c_edit", {
         error: errors[0].msg
      });
   } else {
      var customer = {
         fname: fname,
         lname: lname,
         email: email
      };
      Customer.findByIdAndUpdate(req.params.id, customer,  (err, updatedCustomer)=> {
         if (err) {
            req.flash("error", err.message);
            res.redirect("/customer/" + req.params.id + "/edit");
         } else {
            req.flash("success", "Successfully updated details for " + updatedCustomer.username);
            res.redirect("/services");
         }
      });
   }
});



// ROUTE FOR CUSTOMER FORGET PASSWORD PAGE
router.get("/customer/forgot", (req, res) => {
   res.render("customer/c_forgotpassword");
});

// POST route for customer forgot password
router.post("/customer/forgot", async (req, res, next) => {
   try {
      // Generate token
      const token = await new Promise((resolve, reject) => {
         crypto.randomBytes(20, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString("hex"));
         });
      });

      // Find customer by email
      const user = await Customer.findOne({ email: req.body.email });
      if (!user) {
         req.flash("error", "No account with that email address exists.");
         return res.redirect("/customer/forgot");
      }

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      // Save the updated user
      await user.save();

      // Prepare the reset link
      const resetLink = `http://${req.headers.host}/customer/reset/${token}`;

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

      // Success response
      req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
      res.redirect("/customer/forgot");
   } catch (err) {
      return next(err);
   }
});

// ROUTE FOR CUSTOMER RESET PASSWORD PAGE 
router.get("/customer/reset/:token", async (req, res) => {
   try {
      // Find user by reset token and check expiration time
      const user = await Customer.findOne({
         resetPasswordToken: req.params.token,
         resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
         req.flash("error", "Password reset token is invalid or has expired.");
         return res.redirect("/customer/forgot");
      }

      // Render reset password page with the token
      res.render("customer/c_resetpassword", { token: req.params.token });
   } catch (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/customer/forgot");
   }
});

// ROUTE FOR CUSTOMER RESET PASSWORD
router.post("/customer/reset/:token", async (req, res) => {
   try {
       // Find the user by reset token and check if the token has expired
       const user = await Customer.findOne({
           resetPasswordToken: req.params.token,
           resetPasswordExpires: { $gt: Date.now() },
       });

       // If no valid user is found, redirect to the forgot password page
       if (!user) {
           req.flash("error", "Password reset token is invalid or has expired.");
           return res.redirect("/customer/forgot");
       }

       // Check if the passwords match
       if (req.body.password !== req.body.confirm) {
           req.flash("error", "Passwords do not match.");
           return res.redirect("back");
       }

       // Use passport-local-mongoose's method to set a new password
       await user.setPassword(req.body.password);

       // Clear the reset token and expiry fields
       user.resetPasswordToken = undefined;
       user.resetPasswordExpires = undefined;
       
       // Save the updated user to the database
       await user.save();

       // Send a success message and redirect to the login page
       req.flash("success", "Your password has been successfully updated! Please log in with your new password.");
       res.redirect("/customer/login");
   } catch (err) {
       console.error("Error during password reset:", err);
       req.flash("error", "Something went wrong. Please try again.");
       res.redirect("back");
   }
});

 // ================================
// ROUTES FOR ADDRESS MANAGEMENT
// ================================

// GET: Display all addresses for a customer
router.get("/customer/:id/addresses", middleware.isLoggedIn, async (req, res) => {
   try {
       const customer = await Customer.findById(req.params.id).populate("addresses");
       res.render("customer/manage_addresses", { customer });
   } catch (err) {
       req.flash("error", "Unable to fetch addresses.");
       res.redirect("back");
   }
});

// POST: Add a new address for a customer
router.post("/customer/:id/addresses", middleware.isLoggedIn, async (req, res) => {
   try {
       const { address, area, city, state, pincode, mobile, type } = req.body;

       // Create a new address
       const newAddress = await Address.create({
           customerId: req.params.id,
           address,
           area,
           city,
           state,
           pincode,
           mobile,
           type, // Address type, e.g., "Home", "Office"
       });
         // Save the address
      await newAddress.save();

       // Add the new address to the customer's addresses array
       const customer = await Customer.findById(req.params.id);
       customer.addresses.push(newAddress._id);
       await customer.save();

       req.flash("success", "Address added successfully.");
       res.redirect(`/customer/${req.params.id}/addresses`);
   } catch (err) {
       req.flash("error", "Failed to add address. Please try again.");
       res.redirect("back");
   }
});

// PUT: Edit an address
router.put("/customer/:id/addresses/:addressId", middleware.isLoggedIn, async (req, res) => {
   try {
       const { address, area, city, state, pincode, mobile, type } = req.body;

       // Update the address
       await Address.findByIdAndUpdate(req.params.addressId, {
           address,
           area,
           city,
           state,
           pincode,
           mobile,
           type,
       });

       req.flash("success", "Address updated successfully.");
       res.redirect(`/customer/${req.params.id}/addresses`);
   } catch (err) {
       req.flash("error", "Failed to update address.");
       res.redirect("back");
   }
});

// DELETE: Delete an address
router.delete("/customer/:id/addresses/:addressId", middleware.isLoggedIn, async (req, res) => {
   try {
       // Find the address being deleted
       const addressToDelete = await Address.findById(req.params.addressId);

       if (!addressToDelete) {
           req.flash("error", "Address not found.");
           return res.redirect("back");
       }

       // Check if the address is the default address
       if (addressToDelete.isDefault) {
           // Find another address for the customer
           const otherAddress = await Address.findOne({
               customerId: req.params.id,
               _id: { $ne: req.params.addressId } // Exclude the current address
           });

           if (!otherAddress) {
               req.flash("error", "Cannot delete the default address. No other address found.");
               return res.redirect("back");
           }

           // Set the other address as default
           otherAddress.isDefault = true;
           await otherAddress.save();
       }

       // Delete the address
       await Address.findByIdAndDelete(req.params.addressId);

       // Remove the address from the customer's addresses array
       const customer = await Customer.findById(req.params.id);
       customer.addresses.pull(req.params.addressId);
       await customer.save();

       req.flash("success", "Address deleted successfully.");
       res.redirect(`/customer/${req.params.id}/addresses`);
   } catch (err) {
       console.error(err);
       req.flash("error", "Failed to delete address.");
       res.redirect("back");
   }
});

// PUT: Set an address as default
router.put("/customer/:id/addresses/:addressId/default", middleware.isLoggedIn, async (req, res) => {
   try {
       // Reset all addresses' `isDefault` to false
       await Address.updateMany({ customerId: req.params.id }, { isDefault: false });

       // Set the selected address as default
       await Address.findByIdAndUpdate(req.params.addressId, { isDefault: true });

       req.flash("success", "Default address set successfully.");
       res.redirect(`/customer/${req.params.id}/addresses`);
   } catch (err) {
       req.flash("error", "Failed to set default address.");
       res.redirect("back");
   }
});
  

module.exports = router;
