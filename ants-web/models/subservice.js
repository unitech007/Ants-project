const mongoose = require("mongoose");

const SubserviceSchema = new mongoose.Schema({
    service: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Service' // Reference to the Service model
    },
    name: { 
        type: String, 
        
    },
    keyname: { 
        type: String, 
        
    },
    worktypes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worktype" // Reference to Worktype model
        }
    ],
    images: String, // Array of strings to store image URLs or paths
});

module.exports = mongoose.model("Subservice", SubserviceSchema);