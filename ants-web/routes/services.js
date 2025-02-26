var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var Service = require("../models/service");
var Subservice = require("../models/subservice");

router.get("/", async (req, res) => {
    try {
        const services = await Service.find(); // Fetch all services
        res.render("services", {
            services,
            pageTitle: req.__("common.ServicespageTitle"),
            description: req.__("common.ServicesDescription"),
            currentUser: req.user,
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to get subservices for a specific service ID
router.get("/:serviceId", async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await Service.findById(serviceId); 
        const subservices = await Subservice.find({ service: serviceId });

        if (!subservices.length) {
            return res.status(404).send('No subservices found for this service ID.');
        }

        res.render("subservices/subservices", {
            service,
            subservices,
            pageTitle: req.__("common.SubserviceTitle", { service: service.name }),
            description: req.__("common.SubserviceDescription", { service: service.name }),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router;
