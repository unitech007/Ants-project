const mongoose = require("mongoose");

const WorktypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    keyname: { 
        type: String, 
        
    },
    price:{
        type: Number,
        default: 0,
        
    },
    service: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Service",
         // Ensure every Worktype is tied to a Service
    },
    subservice: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Subservice",
         // Ensure every Worktype is tied to a Subservice
    },
});

module.exports = mongoose.model("Worktype", WorktypeSchema);
