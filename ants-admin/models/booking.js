const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    serviceName: String,
    subServiceName: String,
    worktype: String,
    worktypePrices: Number,
    date: String,
    time: String,
    vendor: {
        username: { type: String, required: true },         // Vendor's name
        visitCharge: { type: Number, required: true }, // Vendor's visit charge
        experience: { type: String, required: true },  // Vendor's experience
    },
    totalPrice: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer" // User who made the booking
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
    stage: {  
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active'
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
