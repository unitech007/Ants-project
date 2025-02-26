const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    name: String,
    keyname: String,
    subservices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subservice' }],
    images: String,
});


module.exports = mongoose.model("Service", ServiceSchema);