var mongoose = require("mongoose");
var passportLocalMongooseVendor = require("passport-local-mongoose");

var VendorSchema = new mongoose.Schema({
    // New simplified schema fields
    name: { 
        type: String, 
        required: true, 
        default: "Unnamed Vendor"
    },
    
    rating: { 
        type: Number, 
        required: true,
        default: 0 
    },
    
    price: { 
        type: Number, 
        required: true,
        default: 0 
    },
    
    isApproved: {
        type: Boolean,
        default: false,
        required: true
    },

    isCustomer: {
        type: Boolean,
        default: false,
        required: true
    },

    image: String,
    imageId: String,

    fname: {
        type: String,
        required: true
    },

    lname: {
        type: String,
        required: true
    },

    username: {
        type: String,
        unique: true,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String
    },

    address: {
        type: String,
        required: true
    },

    area: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    pincode: {
        type: Number,
        required: true
    },

    mobile: {
        type: Number,
        required: true
    },

    service: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Service",
                 // Ensure every Worktype is tied to a Service
            }],
            subservice: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Subservice",
                 // Ensure every Worktype is tied to a Subservice
            }],

    experience: {
        type: Number,
        required: true
    },

    visitCharge: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    worktypePrices: [
            {
                worktype: { type: mongoose.Schema.Types.ObjectId, ref: "Worktype" },
                price: { type: Number }
            }
        ],

    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer"
        },
        fname: String,
        lname: String
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date
});

VendorSchema.plugin(passportLocalMongooseVendor);
module.exports = mongoose.model("Vendor", VendorSchema);