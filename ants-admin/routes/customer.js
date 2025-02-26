var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Customer = require("../models/customer");
var middleware = require("../middleware");

//ROUTE FOR LIST OF ALL THE CUSTOMERS PAGE
router.get("/customer/list", middleware.isLoggedIn, async (req, res) => {
    try {
        const customers = await Customer.find();
        res.render("customer/c_list", { customers: customers });
    } catch (err) {
        req.flash("error", "Oops!! Something went wrong. Please try again.");
        res.redirect("back");
    }
});

//ROUTE FOR THE CUSTOMER EDIT PAGE
router.get("/customer/:id/edit", middleware.isLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        res.render("customer/c_edit", { customer: customer });
    } catch (err) {
        req.flash("error", "Oops!! Something went wrong. Please try again.");
        res.redirect("back");
    }
});

/// ROUTE FOR THE CUSTOMER UPDATE
router.put("/customer/:id", middleware.isLoggedIn, async (req, res) => {
    try {
        const { fname, lname, email } = req.body;

        // Validation
        req.checkBody("fname", "First Name can only have letters").isAlpha();
        req.checkBody("lname", "Last Name can only have letters").isAlpha();
        req.checkBody("email", "Email is not valid").isEmail();

        const errors = req.validationErrors();
        if (errors) {
            req.flash("error", errors[0].msg);
            return res.redirect("back");
        }

        // Customer Update Object
        const customer = {
            fname: fname,
            lname: lname,
            email: email
        };

        // Update Customer in Database
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, customer, { new: true });

        req.flash("success", "Successfully updated details for " + updatedCustomer.username);
        res.redirect("/customer/list");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/customer/" + req.params.id + "/edit");
    }
});



// ROUTE FOR THE CUSTOMER DELETE
router.delete("/customer/:id", middleware.isLoggedIn, async (req, res) => {
    try {
        // Find and delete the customer
        const foundCustomer = await Customer.findById(req.params.id);

        if (!foundCustomer) {
            req.flash("error", "Customer not found.");
            return res.redirect("back");
        }

        await Customer.deleteOne({ _id: req.params.id });

        req.flash("success", "Customer deleted successfully!");
        res.redirect("/customer/list");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});


module.exports = router;