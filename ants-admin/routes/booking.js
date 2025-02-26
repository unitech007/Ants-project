var express = require("express");
var router = express.Router();
const Vendor = require("../models/vendor");
var Service = require("../models/service");
var Subservice = require("../models/subservice");
const Worktype = require("../models/worktype");
const middleware = require("../middleware");
const Booking = require("../models/booking"); // Import the Booking model (assuming you have a Booking model)
const Customer = require("../models/customer");

// Unified booking route for all services
router.get("/", async function (req, res) {
    try {
        const { serviceName, subServiceName, serviceId, subServiceId } = req.query;

        if (!serviceId || !subServiceId) {
            return res.status(400).json({ error: "Service ID and Subservice ID are required" });
        }
        // Fetch service and subservice details
          const service = await Service.findById(serviceId).lean();
          const subservice = await Subservice.findById(subServiceId).lean();

         if (!service || !subservice) {
          return res.status(404).send("Service or Subservice not found");
        }
        // Fetch vendors for the specific subservice
        const vendors = await Vendor.find({ service: serviceId, subservice: subServiceId });

        // Fetch worktypes filtered by service and subservice
        let worktypes = await Worktype.find({ service: serviceId, subservice: subServiceId }).lean();

        // Set default price 0 for all worktypes
        worktypes = worktypes.map(worktype => ({
            ...worktype,
            price: 0
        }));

        const customers = await Customer.find().select("_id username ").lean(); // Fetch customers

        console.log("Fetched Vendors:", vendors);
        console.log("Service ID:", serviceId);
        console.log("Subservice ID:", subServiceId);

        // Render the booking page with the fetched data
        res.render("booking/booking", {
            service,
            subservice,
            serviceName,
            subServiceName,
            vendor: vendors,
            serviceId,
            subServiceId,
            worktypes, // Pass worktypes with default price 0
            customers
        });
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Server Error");
    }
});

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
                        price: vendorWorktype?.price ?? 0 // Vendor price if available, otherwise 0
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

// POST route to handle form submission
 router.post("/", middleware.isLoggedIn, async function(req, res) {
    try {
        const { date, time, vendor, serviceName, subServiceName, worktype, worktypePrices, customerId } = req.body;
        console.log("Received vendor data:", vendor); // Debugging log
        console.log("Received customer ID:", customerId); // Debugging log

        // Fetch the correct customer ID
        const userId = customerId || req.user._id; // Use selected customer ID or fallback to logged-in user

        // If vendor username is missing, fetch it from the database
        if (!vendor.username) {
            const vendorData = await Vendor.findById(vendor.id);
            if (!vendorData) throw new Error("Vendor not found in database.");
            vendor.username = vendorData.username; // Assign username
        }

        // Validate vendor details
        if (!vendor || !vendor.username || !vendor.visitCharge || !vendor.experience) {
            throw new Error("Incomplete vendor details in booking request.");
        }
        console.log("Received worktype ID:", worktype);
        console.log("Received worktypePrices:", worktypePrices);

        // Fetch the worktype name from the database
        const worktypeData = await Worktype.findById(worktype);
        if (!worktypeData) {
            throw new Error("Selected worktype not found.");
        }
        const worktypeName = worktypeData.name; // Get worktype name

        // Validate work type
        if (!worktype || !worktypePrices) {
            throw new Error("Please select a work type and ensure price is available.");
        }
         
        //  Convert prices properly before adding
        const visitCharge = parseFloat(vendor.visitCharge) || 0;
        const workPrice = parseFloat(worktypePrices) || 0;
        const totalPrice = visitCharge + workPrice;

        // Debugging log to confirm calculation
        console.log("Visit Charge (converted):", visitCharge);
        console.log("Worktype Price (converted):", workPrice);
        console.log("Total Price (calculated):", totalPrice);

        // Save the booking to the database
        const newBooking = new Booking({
            serviceName,
            subServiceName,
            date,
            time,
            vendor: {
                username: vendor.username,
                visitCharge: vendor.visitCharge,
                experience: vendor.experience,
            },
            worktype: worktypeName,
            worktypePrices,
            totalPrice, // Store total price
            user: userId, // Store the correct customer ID
        });

        await newBooking.save();

         // Set success flash message
        req.flash("success", "Successfully booked! Our vendors will contact you as soon as possible.");
        // Redirect to a success page or send confirmation
        res.redirect("/bookingdetails"); // Redirect to the user's booking page
    } catch (err) {
        console.error("Error creating booking:", err.message);
        req.flash("error", "Booking error: " + err.message);
        res.status(500).send("Booking error: " + err.message);
    }
});
 
 module.exports = router;