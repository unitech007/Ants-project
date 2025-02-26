var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Admin = require("../models/admin");
const EmailTemplate = require('../models/emailtemplate');
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const emailcontrollers = require('../controllers/emailcontrollers');

//ROUTE FOR THE ADMIN LOGIN PAGE
router.get("/admin/login", function (req, res) {
   res.render("admin/a_login");
});

//ROUTE FOR ADMIN LOGIN
router.post("/admin/login", passport.authenticate("admin", {
   successRedirect: "/services",
   failureRedirect: "/admin/login",
   failureFlash: "Incorrect username or Password",
   successFlash: "Welcome to Ants!"
}), function (req, res) {
});

//ROUTE FOR THE ADMIN REGISTERATION PAGE
 router.get("/admin/register", function (req, res) {
    res.render("admin/a_register");
 });

//ROUTE FOR ADMIN REGISTER
 router.post("/admin/register", function (req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var username = req.body.username;
    var email = req.body.email;
    var confirmemail = req.body.confirmemail;
    var password = req.body.password;
    var confirmpassword = req.body.confirmpassword;

    req.checkBody("fname", "First Name can only have letters").isAlpha();
    req.checkBody("lname", "Last Name can only have letters").isAlpha();
    req.checkBody("username", "Username can only have  letters and numbers").isAlphanumeric();
    req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("confirmemail", "Emails do not match").equals(req.body.email);
    req.checkBody("password", "Password must be 8 - 20 characters long with one uppercase letter, one lowercase letter and one number").matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,30}$");
    req.checkBody("confirmpassword", "Passwords do not match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
       res.render("admin/a_register", {
          error: errors[0].msg
       });
    } else {
       var newAdmin = new Admin({
          fname: fname,
          lname: lname,
          username: username,
          email: email
       });
       Admin.register(newAdmin, password, function (err, admin) {
          if (err) {
             return res.render("admin/a_register", {
                error: err.msg
             });
          }
          req.flash("success", "Registeration Successful!!");
          res.redirect("/services");
       });
    }
 });

//ROUTE FOR THE ADMIN EDIT PAGE
router.get("/admin/:id/edit", middleware.isLoggedIn, function (req, res) {
   res.render("admin/a_edit");
});

//ROUTE FOR THE ADMIN UPDATE PAGE
router.put("/admin/:id", middleware.isLoggedIn, async function (req, res) {
   try {
      var fname = req.body.fname;
      var lname = req.body.lname;
      var email = req.body.email;

      req.checkBody("fname", "First Name can only have letters").isAlpha();
      req.checkBody("lname", "Last Name can only have letters").isAlpha();
      req.checkBody("email", "Email is not valid").isEmail();

      var errors = req.validationErrors();
      if (errors) {
         return res.render("admin/a_edit", { error: errors[0].msg });
      }

      var admin = { fname, lname, email };
      
      let updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, admin, { new: true });
      req.flash("success", "Successfully updated details for " + updatedAdmin.username);
      res.redirect("/services");

   } catch (err) {
      req.flash("error", err.message);
      res.redirect("/admin/" + req.params.id + "/edit");
   }
});


// ROUTE FOR THE ADMIN FORGOT PASSWORD PAGE
router.get("/admin/forgot", (req, res) => {
   res.render("admin/a_forgotpassword");
});

// POST route for admin forgot password
router.post("/admin/forgot", async (req, res, next) => {
   try {
      // Generate token
      const token = await new Promise((resolve, reject) => {
         crypto.randomBytes(20, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString("hex"));
         });
      });

      // Find admin by email
      const user = await Admin.findOne({ email: req.body.email });
      if (!user) {
         req.flash("error", "No account with that email address exists.");
         return res.redirect("/admin/forgot");
      }

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      // Save the updated user
      await user.save();

      // Generate reset link (without sending email)
      const resetLink = `http://${req.headers.host}/admin/reset/${token}`;

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
      res.redirect("/admin/forgot");
   } catch (err) {
      return next(err);
   }
});

// ROUTE FOR THE ADMIN RESET PASSWORD PAGE
router.get("/admin/reset/:token", async (req, res) => {
   try {
      // Find admin by reset token and check expiration time
      const user = await Admin.findOne({
         resetPasswordToken: req.params.token,
         resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
         req.flash("error", "Password reset token is invalid or has expired.");
         return res.redirect("/admin/forgot");
      }

      // Render reset password page with the token
      res.render("admin/a_resetpassword", { token: req.params.token });
   } catch (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/admin/forgot");
   }
});

// ROUTE FOR ADMIN RESET PASSWORD
router.post("/admin/reset/:token", async (req, res) => {
   try {
       // Find admin by reset token and check if the token has expired
       const user = await Admin.findOne({
           resetPasswordToken: req.params.token,
           resetPasswordExpires: { $gt: Date.now() },
       });

       // If no valid user is found, redirect to the forgot password page
       if (!user) {
           req.flash("error", "Password reset token is invalid or has expired.");
           return res.redirect("/admin/forgot");
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
       res.redirect("/admin/login");
   } catch (err) {
       console.error("Error during password reset:", err);
       req.flash("error", "Something went wrong. Please try again.");
       res.redirect("back");
   }
});


module.exports = router;