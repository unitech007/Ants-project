var express = require("express");
var router = express.Router();
const Vendor = require("../models/vendor");
var Service = require("../models/service");
var Subservice = require("../models/subservice");
const Worktype = require("../models/worktype");
const middleware = require("../middleware");
const Booking = require("../models/booking"); // Import the Booking model (assuming you have a Booking model)

router.get("/getWorktypes", async function (req, res) {
    try {
        const { serviceId, subServiceId, vendorId } = req.query;

        if (!serviceId || !subServiceId) {
            return res.status(400).json({ error: "Service ID and Subservice ID are required" });
        }
        // Fetch service and subservice details
        const service = await Service.findById(serviceId);
        const subservice = await Subservice.findById(subServiceId);
        
       if (!service || !subservice) {
        return res.status(404).send("Service or Subservice not found");
      }
        let worktypes = await Worktype.find({ service: serviceId, subservice: subServiceId }).select("_id name price").lean();

        if (vendorId) {
            const vendor = await Vendor.findById(vendorId)
                .populate("worktypePrices.worktype","_id name price")
                .lean();

            if (vendor?.worktypePrices ) {
                worktypes = worktypes.map((wt) => {
                    if (!wt || !wt._id) return wt;

                    const vendorWorktype = vendor.worktypePrices.find(
                        (vwt) => vwt?.worktype?._id && String(vwt.worktype._id) === String(wt._id)
                    );

                    return {
                        ...wt,
                        name: wt.name || vendorWorktype?.worktype?.name, // Ensure the worktype name is available
                        price: vendorWorktype ? vendorWorktype.price : wt.price // Vendor price if available, otherwise 0
                    };
                });
            }
        } else {
            // No vendor selected, set default price 0
            worktypes = (worktypes || []).map(worktype => ({
                ...worktype,
                price: 0
            }));
            
        }
        // 🔹 Add Debugging Here
        console.log("Worktypes Data Received:", worktypes);
        worktypes.forEach(wt => {
            console.log(`Adding Worktype: ${wt._id} - ${wt.name} Price: ${wt.price}`);
        });

        res.json({ worktypes });
    } catch (err) {
        console.error("Error fetching worktypes:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// Edit Booking Route
router.get("/:id", async (req, res) => {
    try {
        console.log("Fetching booking for ID:", req.params.id);
        const booking = await Booking.findById(req.params.id)
            .populate("vendor")
            .populate("worktype")
            .lean();

        if (!booking) {
            console.log("Booking not found!");
            return res.status(404).send("Booking not found");
        }

        console.log("Booking details:", booking);
        
        // Fetch correct Service ObjectId
        const serviceData = await Service.findOne({
            name: { $regex: new RegExp("^" + booking.serviceName.trim() + "$", "i") }
        }).lean();

        if (!serviceData) {
            console.log("Service not found for:", booking.serviceName);
            return res.status(404).send("Service not found");
        }

        console.log("Service ID:", serviceData._id);

        // Fetch correct Subservice ObjectId
        const subserviceData = await Subservice.findOne({
            name: { $regex: new RegExp("^" + booking.subServiceName.replace(/\s/g, "") + "$", "i") }
        }).lean();

        if (!subserviceData) {
            console.log("Subservice not found for:", booking.subServiceName);
            return res.status(404).send("Subservice not found");
        }

        console.log("Subservice ID:", subserviceData._id);

        // Fetch vendors using the correct service and subservice IDs
        const vendors = await Vendor.find({
            service: serviceData._id,
            subservice: subserviceData._id
        }).lean();

        console.log("Fetched Vendors:", vendors.length > 0 ? vendors : "No vendors found");

        // Fetch worktypes using service and subservice IDs
        let worktypes = await Worktype.find({
            service: serviceData._id,
            subservice: subserviceData._id
        }).lean();

        if (!worktypes.length) {
            console.log("No worktypes found for this service and subservice.");
        }

        // Ensure worktypes have a default price
        worktypes = worktypes.map(worktype => ({
            ...worktype,
            price: worktype.price || 0
        }));

        res.render("booking/editbooking", {
            booking,
            vendor: vendors, // Pass vendors to the template
            worktypes, // Pass worktypes to the template
            serviceName: booking.serviceName, // Pass service name explicitly
            subServiceName: booking.subServiceName, // Pass subservice name explicitly
            serviceId: serviceData._id, // Ensure serviceId is passed
            subServiceId: subserviceData._id, // Ensure subServiceId is passed
            worktype: booking.worktype,  // Name stored in DB
            worktypePrices: booking.worktypePrices,  // Price stored in DB
        });

    } catch (error) {
        console.error("Error in GET /editbooking/:id", error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});





/* // Middleware to override method
router.use((req, res, next) => {
    if (req.body && req.body._method === "PUT") {
        req.method = "PUT";
    }
    next();
}); */



// Update Booking Route
router.put("/:id", async (req, res) => {
    try {
        console.log("Received data:", req.body); // Debugging step
        const { date, time, vendor, worktype, worktypePrices } = req.body;
         
        if (!date || !time || !vendor || !worktype || !worktypePrices) {
            throw new Error("Missing required fields.");
        }
        // Extract only the vendor ID
        const vendorId = typeof vendor === "object" ? vendor.id : vendor; 

        // Fetch the full vendor details
        const selectedVendor = await Vendor.findById(vendorId);
        if (!selectedVendor) {
            req.flash("error", "Selected vendor not found!");
            return res.redirect("back");
        }

        // Fetch the worktype name from the database
        const worktypeData = await Worktype.findById(worktype);
        if (!worktypeData) {
            req.flash("error", "Selected worktype not found!");
            return res.redirect("back");
        }

        // Ensure worktype and price are valid
        if (!worktype || !worktypePrices) {
            req.flash("error", "Please select a valid work type with a price.");
            return res.redirect("back");
        }

        // Convert prices properly before storing
        const worktypeName = worktypeData.name;
        const visitCharge = parseFloat(selectedVendor.visitCharge) || 0;
        const workPrice = parseFloat(worktypePrices) || 0;
        const totalPrice = visitCharge + workPrice;

        // Update the booking in the database
        await Booking.findByIdAndUpdate(req.params.id, {
            date,
            time,
            vendor: { // Store as an embedded object
                username: selectedVendor.username,
                visitCharge: selectedVendor.visitCharge,
                experience: selectedVendor.experience
            },
            worktype: worktypeName, // Store name instead of ID
            worktypePrices: workPrice,
            totalPrice,
            user: req.user._id, // Associate with logged-in user
        });

        req.flash("success", "Booking updated successfully!");
        res.redirect("/mybooking");
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).send(`Server error: ${error.message}`);
        res.redirect("back");
    }
});


 
 module.exports = router;