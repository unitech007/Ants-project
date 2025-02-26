const mongoose = require("mongoose");
const passportLocalMongooseCustomer = require("passport-local-mongoose");

const CustomerSchema = new mongoose.Schema({
    isCustomer: {
        type: Boolean,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
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
    // Array of addresses
    addresses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

CustomerSchema.plugin(passportLocalMongooseCustomer);

module.exports = mongoose.model("Customer", CustomerSchema);
