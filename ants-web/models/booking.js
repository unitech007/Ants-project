const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    serviceName: String,
    subServiceName: String,
    date: String,
    time: String,
    vendor:String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"  // Or "Vendor", depending on how you handle users
    }
});


module.exports = mongoose.model("Booking", bookingSchema);


