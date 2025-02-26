const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
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
        type: String,
        required: true
    },
     type: { // 'type' field
        type: String,
        required: true,
        enum: ["Home", "Office"], // Optional: restrict to specific values
    }, 
    isDefault: {
        type: Boolean,
        default: false // Indicates if this address is the default
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Address", AddressSchema);
