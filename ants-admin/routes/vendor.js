const express = require("express");
const expressValidator = require("express-validator");
const router = express.Router();
router.use(expressValidator());
const Vendor = require("../models/vendor");
const middleware = require("../middleware");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryConfig = require("cloudinary").v2;

cloudinaryConfig.config({
  cloud_name: "dwnoxkmak",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for image upload
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
    return cb(new Error("Only jpg, jpeg and png files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

// Route for the Vendor Edit Page
router.get("/vendor/:id/edit", middleware.isLoggedIn, async (req, res) => {
  try {
    const foundVendor = await Vendor.findById(req.params.id);
    res.render("vendor/v_edit", { currentVendor: foundVendor });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

// Route for the Vendor Update
router.put("/vendor/:id", middleware.isLoggedIn, upload.single("image"), async (req, res) => {
  const { fname, lname, email, area, city, state, pincode, mobile, description, experience, visitCharge } = req.body;

  // Validation checks
  req.checkBody("fname", "First Name can only have letters").isAlpha();
  req.checkBody("lname", "Last Name can only have letters").isAlpha();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("area", "Area is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("city", "City is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("state", "State is not valid").matches(/^[a-zA-Z\s]+$/, "i");
  req.checkBody("pincode", "Pincode is not valid").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number can only have numbers").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number is not valid").matches("^[6-9][0-9]{9}$");

  const errors = req.validationErrors();
  if (errors) {
    try {
      const currentVendor = await Vendor.findById(req.params.id);
      return res.render("vendor/v_edit", { currentVendor, error: errors[0].msg });
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
  }

  try {
    const vendor = await Vendor.findById(req.params.id);

    if (req.file) {
      // Handle image update
      try {
        await cloudinary.v2.uploader.destroy(vendor.imageId);
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        vendor.image = result.secure_url;
        vendor.imageId = result.public_id;
      } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }

    // Update vendor details without touching `name`, `price`, and `rating`
    vendor.fname = fname || vendor.fname;
    vendor.lname = lname || vendor.lname;
    vendor.email = email || vendor.email;
    vendor.area = area || vendor.area;
    vendor.city = city || vendor.city;
    vendor.state = state || vendor.state;
    vendor.pincode = pincode || vendor.pincode;
    vendor.mobile = mobile || vendor.mobile;
    vendor.description = description || vendor.description;
    vendor.experience = experience || vendor.experience;
    vendor.visitCharge = visitCharge || vendor.visitCharge;

    await vendor.save();

    req.flash("success", `Successfully updated details for ${vendor.username}`);
    res.redirect(`/${vendor.service}/${vendor.subservice}/${vendor._id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/vendor/${req.params.id}/edit`);
  }
});





// Route for the Vendor Delete
router.delete("/vendor/:id", middleware.isLoggedIn, async (req, res) => {
  try {
    // Find the vendor by ID
    const foundVendor = await Vendor.findById(req.params.id);

    if (!foundVendor) {
      req.flash("error", "Vendor not found.");
      return res.redirect("back");
    }

    // Delete the image from Cloudinary
    await cloudinary.v2.uploader.destroy(foundVendor.imageId);

    // Delete the vendor from the database
    await Vendor.deleteOne({ _id: req.params.id });

    req.flash("success", "Vendor deleted successfully!");
    res.redirect("/services");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});


// Route to see all the vendors who are not approved
router.get("/vendor/vendor_approve_request", middleware.isLoggedIn, async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({ isApproved: false });
    const approvedVendors = await Vendor.find({ isApproved: true });
    res.render("vendor/v_list", { pendingVendors, approvedVendors });
  } catch (err) {
    req.flash("error", "Unable to fetch vendors.");
    res.redirect("back");
  }
});

// Route to approve the vendor
router.put("/vendor/:id/approve", middleware.isLoggedIn, async (req, res) => {
  try {
    await Vendor.findByIdAndUpdate(req.params.id, { isApproved: true });
    req.flash("success", "Vendor Approved.");
    res.redirect("back");
  } catch (err) {
    req.flash("error", "Oops!! Something went wrong. Please try again.");
    res.redirect("back");
  }
});

// Route to see pending and approved vendors
router.get("/vendors", middleware.isLoggedIn, async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({ isApproved: false });
    const approvedVendors = await Vendor.find({ isApproved: true });
    res.render("vendor/v_list", { pendingVendors, approvedVendors });
  } catch (err) {
    req.flash("error", "Unable to fetch vendors.");
    res.redirect("back");
  }
});

// Route to see a specific vendor depending on service, subservice, and vendor ID
router.get("/:service/:subservice/:id", middleware.isLoggedIn, async (req, res) => {
  try {
    const foundVendor = await Vendor.findById(req.params.id).populate("comments");
    res.render("vendor/v_show", { vendor: foundVendor });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

module.exports = router;
