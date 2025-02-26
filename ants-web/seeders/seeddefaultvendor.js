// Import required modules
const mongoose = require('mongoose');
const Vendor = require("../models/vendor"); // Adjusted path to model
const Service = require("../models/service");
const SubService = require("../models/subservice");
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dwnoxkmak",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Default vendor details
const defaultVendor = {
  isApproved: false,
  isCustomer: false,
  image: '',
  fname: 'Karthick',
  lname: 'Kumar',
  username: 'Karthick',
  email: 'Karthick@gmail.com',
  address: 'Ashok nagar, Chennai-625501',
  area: 'Ashok nagar',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: 625501,
  mobile: 8767564555,
  experience: 5,
  visitCharge: 500,
  description: 'Basic description for services.',
  password: 'Karthick12345678',
};

async function seedDefaultVendor() {
  try {
    // Connect to the database
    mongoose.connect("mongodb+srv://antsuser:Work45day123@ants-cluster.jrmeo.mongodb.net/?retryWrites=true&w=majority&appName=ants-cluster", {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log("Connected to the database.");
    // Upload default image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload('nature.jpeg', {
      folder: 'vendors',
      resource_type: 'image'
    });

    // Set the Cloudinary image URL
    defaultVendor.image = uploadResponse.secure_url;

    // Check if the default vendor already exists
    const existingVendor = await Vendor.findOne({ username: defaultVendor.username });

    if (existingVendor) {
      console.log('Default vendor already exists.');
      return;
    }

    // Fetch all services and subservices
    const services = await Service.find({});
    const subservices = await SubService.find({});

    // Generate unique ID and hash password
    const vendorId =new mongoose.Types.ObjectId().toHexString();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultVendor.password, salt);

    // Prepare vendor data
    const vendorData = {
      id: vendorId,
      isApproved: defaultVendor.isApproved,
      isCustomer: defaultVendor.isCustomer,
      image: defaultVendor.image,
      imageId: vendorId.slice(0, 10), // Unique imageId
      fname: defaultVendor.fname,
      lname: defaultVendor.lname,
      username: defaultVendor.username,
      email: defaultVendor.email,
      address: defaultVendor.address,
      area: defaultVendor.area,
      city: defaultVendor.city,
      state: defaultVendor.state,
      pincode: defaultVendor.pincode,
      mobile: defaultVendor.mobile,
      service: services.map(service => service._id),
      subservice: subservices.map(subservice => subservice._id),
      experience: defaultVendor.experience,
      visitCharge: defaultVendor.visitCharge,
      description: defaultVendor.description,
      comments: [],
    };

    // Register and insert the default vendor
    const newVendor = new Vendor(vendorData);
    await Vendor.register(newVendor, defaultVendor.password);

    console.log('Default vendor inserted successfully.');

  } catch (error) {
    console.error('Error seeding default vendor:', error);
  } 
}

module.exports = seedDefaultVendor;
