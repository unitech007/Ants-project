const mongoose = require("mongoose");
const Service = require("../models/service");
const Subservice = require("../models/subservice");
const WorkType = require("../models/worktype");

require("dotenv").config(); // Load environment variables

const DB_URL = process.env.DB_URL || 
 "mongodb+srv://antsuser:Work45day123@ants-cluster.jrmeo.mongodb.net/?retryWrites=true&w=majority&appName=ants-cluster";

mongoose
    .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Connection error", err));

const seedDatabase = async () => {
    try {
        // Define services data with name and keyname
        const servicesData = [
            { name: "Beauty", keyname: "Beauty",images:"../assets/images/services/beauty.jpg" },
            { name: "ApplianceRepair", keyname: "ApplianceRepair",images:"../assets/images/services/appliance_repair.jpg" },
            { name: "HomeCleaningRepair", keyname: "HomeCleaningRepair",images:"../assets/images/services/home_cleaning_repair.jpg" },
            { name: "HomeMadeFood", keyname: "HomeMadeFood", images:"../assets/images/services/cakes_chocolates.jpg" },
            
        ];

        // Define subservices data with service, name, and keyname
        const subservicesData = [
            { service: "Beauty", name: "SalonAtHome", keyname: "beauty_name_salon_at_home",images:"../assets/images/subservices/beauty/salon_at_home.png" },
            { service: "Beauty", name: "HairArtist", keyname: "beauty_name_hair_artist",images:"../assets/images/subservices/beauty/hair_artist.png" },
            { service: "Beauty", name: "HairHandMehndi", keyname: "beauty_name_hair_hand_mehndi",images:"../assets/images/subservices/beauty/hand_mehndi.png" },
            { service: "Beauty", name: "BridalMakeup", keyname: "beauty_name_bridal_makeup",images:"../assets/images/subservices/beauty/bridal_makeup.png" },
            { service: "Beauty", name: "GroomMakeup", keyname: "beauty_name_groom_makeup",images:"../assets/images/subservices/beauty/groom_makeup.png" },
            { service: "ApplianceRepair", name: "ROWaterPurifierRepair", keyname: "ro_water_purifier_repair",images:"../assets/images/subservices/appliance_repair/water_purifier.png" },
            { service: "ApplianceRepair", name: "ACServiceRepair", keyname: "ac_service_repair",images:"../assets/images/subservices/appliance_repair/air_conditioner.png" },
            { service: "ApplianceRepair", name: "WashingMachineRepair", keyname: "washing_machine_repair",images:"../assets/images/subservices/appliance_repair/washing_machine.png" },
            { service: "ApplianceRepair", name: "RefrigeratorRepair", keyname: "refrigerator_repair",images:"../assets/images/subservices/appliance_repair/refrigerator.png" },
            { service: "ApplianceRepair", name: "MicrowaveRepair", keyname: "microwave_repair",images:"../assets/images/subservices/appliance_repair/microwave.png" },
            { service: "ApplianceRepair", name: "AirCoolerRepair", keyname: "air_cooler_repair",images:"../assets/images/subservices/appliance_repair/air_cooler.png" },
            { service: "ApplianceRepair", name: "GeyserWaterHeaterRepair", keyname: "geyser_water_heater_repair",images:"../assets/images/subservices/appliance_repair/water_heater.png" },
            { service: "HomeCleaningRepair", name: "Carpentry", keyname: "carpentry",images:"../assets/images/subservices/home_cleaning_repair/carpentry.png" },
            { service: "HomeCleaningRepair", name: "Electrical", keyname: "electrical",images:"../assets/images/subservices/home_cleaning_repair/electrical.png" },
            { service: "HomeCleaningRepair", name: "Plumbing", keyname: "plumbing",images:"../assets/images/subservices/home_cleaning_repair/plumbing.png" },
            { service: "HomeCleaningRepair", name: "HomeDeepCleaning", keyname: "home_deep_cleaning",images:"../assets/images/subservices/home_cleaning_repair/home_cleaning.png" },
            { service: "HomeCleaningRepair", name: "KitchenDeepCleaning", keyname: "kitchen_deep_cleaning",images:"../assets/images/subservices/home_cleaning_repair/kitchen_cleaning.png" },
            { service: "HomeCleaningRepair", name: "BathroomDeepCleaning", keyname: "bathroom_deep_cleaning",images:"../assets/images/subservices/home_cleaning_repair/bathroom_cleaning.png" },
            { service: "HomeCleaningRepair", name: "CarCleaning", keyname: "car_cleaning",images:"../assets/images/subservices/home_cleaning_repair/car_cleaning.png" },
            { service: "HomeCleaningRepair", name: "PestControl", keyname: "pest_control",images:"../assets/images/subservices/home_cleaning_repair/pest_control.png" },
            { service: "HomeCleaningRepair", name: "Painting", keyname: "painting",images:"../assets/images/subservices/home_cleaning_repair/painting.png" },
            { service: "HomeCleaningRepair", name: "FurnitureShampooingCleaning", keyname: "furniture_shampooing_cleaning",images:"../assets/images/subservices/home_cleaning_repair/furniture_shampoo_clean.png" },
            { service: "HomeMadeFood", name: "CakesAndChocolates", keyname: "cakes_and_chocolates",images:"../assets/images/subservices/home_made_food/cakes_chocolates.png" },
            { service: "HomeMadeFood", name: "DifferentPickles", keyname: "different_pickles",images:"../assets/images/subservices/home_made_food/pickles.png" },
            { service: "HomeMadeFood", name: "HomeMadeSnacks", keyname: "home_made_snacks",images:"../assets/images/subservices/home_made_food/home_made_snacks.png" },
            { service: "HomeMadeFood", name: "TiffinServices", keyname: "tiffin_services",images:"../assets/images/subservices/home_made_food/tiffin.png" },
        ];

        // Define worktypes data (example data; replace with actual data)
        const worktypesData = [
            // Beauty - Salon At Home
            { service: "Beauty", subservice: "SalonAtHome", name: "Haircut (Men/Women/Children)", keyname: "Haircut (Men/Women/Children)" },
            { service: "Beauty", subservice: "SalonAtHome", name: "Hair Spa & Treatments", keyname: "Hair Spa & Treatments" },
            { service: "Beauty", subservice: "SalonAtHome", name: "Facial & Cleanup Services", keyname: "Facial & Cleanup Services" },
            { service: "Beauty", subservice: "SalonAtHome", name: "Waxing (Full Body/Partial)", keyname: "Waxing (Full Body/Partial)" },
            { service: "Beauty", subservice: "SalonAtHome", name: "Manicure & Pedicure", keyname: "Manicure & Pedicure" },
        
            // Beauty - Hair Artist
            { service: "Beauty", subservice: "HairArtist", name: "Hair Styling (Curls, Straightening, Blow-dry)", keyname: "Hair Styling (Curls, Straightening, Blow-dry)" },
            { service: "Beauty", subservice: "HairArtist", name: "Hair Coloring & Highlights", keyname: "Hair Coloring & Highlights" },
            { service: "Beauty", subservice: "HairArtist", name: "Hair Extensions", keyname: "Hair Extensions" },
            { service: "Beauty", subservice: "HairArtist", name: "Hair Smoothing & Keratin Treatments", keyname: "Hair Smoothing & Keratin Treatments" },
            { service: "Beauty", subservice: "HairArtist", name: "Bridal & Party Hairdos", keyname: "Bridal & Party Hairdos" },
        
            // Beauty - Hair/Hand Mehndi
            { service: "Beauty", subservice: "HairHandMehndi", name: "Simple Mehndi Designs", keyname: "Simple Mehndi Designs" },
            { service: "Beauty", subservice: "HairHandMehndi", name: "Arabic Mehndi Patterns", keyname: "Arabic Mehndi Patterns" },
            { service: "Beauty", subservice: "HairHandMehndi", name: "Bridal Mehndi Designs", keyname: "Bridal Mehndi Designs" },
            { service: "Beauty", subservice: "HairHandMehndi", name: "Glitter & Colored Mehndi", keyname: "Glitter & Colored Mehndi" },
            { service: "Beauty", subservice: "HairHandMehndi", name: "Custom Mehndi Themes (Festive, Ceremonial)", keyname: "Custom Mehndi Themes (Festive, Ceremonial)" },
        
            // Beauty - Bridal Makeup/Dress Up Artist
            { service: "Beauty", subservice: "BridalMakeup", name: "HD Bridal Makeup", keyname: "HD Bridal Makeup" },
            { service: "Beauty", subservice: "BridalMakeup", name: "Airbrush Bridal Makeup", keyname: "Airbrush Bridal Makeup" },
            { service: "Beauty", subservice: "BridalMakeup", name: "Pre-Wedding Makeup & Grooming", keyname: "Pre-Wedding Makeup & Grooming" },
            { service: "Beauty", subservice: "BridalMakeup", name: "Saree Draping & Jewelry Setting", keyname: "Saree Draping & Jewelry Setting" },
            { service: "Beauty", subservice: "BridalMakeup", name: "Bridal Hairstyling", keyname: "Bridal Hairstyling" },
        
            // Beauty - Groom Makeup/Dress Up Artist
            { service: "Beauty", subservice: "GroomMakeup", name: "HD Groom Makeup", keyname: "HD Groom Makeup" },
            { service: "Beauty", subservice: "GroomMakeup", name: "Hair Styling & Beard Grooming", keyname: "Hair Styling & Beard Grooming" },
            { service: "Beauty", subservice: "GroomMakeup", name: "Pre-Wedding Grooming Packages", keyname: "Pre-Wedding Grooming Packages" },
            { service: "Beauty", subservice: "GroomMakeup", name: "Sherwani Draping Assistance", keyname: "Sherwani Draping Assistance" },
            { service: "Beauty", subservice: "GroomMakeup", name: "Skincare & Facial Treatments", keyname: "Skincare & Facial Treatments" },
        
            // Appliance Repair - RO or Water Purifier Repair
            { service: "ApplianceRepair", subservice: "ROWaterPurifierRepair", name: "Filter Replacement", keyname: "Filter Replacement" },
            { service: "ApplianceRepair", subservice: "ROWaterPurifierRepair", name: "Motor Repair or Replacement", keyname: "Motor Repair or Replacement" },
            { service: "ApplianceRepair", subservice: "ROWaterPurifierRepair", name: "Leak Fixing", keyname: "Leak Fixing" },
            { service: "ApplianceRepair", subservice: "ROWaterPurifierRepair", name: "Water Quality Testing and Adjustment", keyname: "Water Quality Testing and Adjustment" },
            { service: "ApplianceRepair", subservice: "ROWaterPurifierRepair", name: "Installation or Uninstallation", keyname: "Installation or Uninstallation" },
        
            // Appliance Repair - AC Service and Repair
            { service: "ApplianceRepair", subservice: "ACServiceRepair", name: "AC Gas Refilling", keyname: "AC Gas Refilling" },
            { service: "ApplianceRepair", subservice: "ACServiceRepair", name: "AC Cleaning (Indoor & Outdoor Units)", keyname: "AC Cleaning (Indoor & Outdoor Units)" },
            { service: "ApplianceRepair", subservice: "ACServiceRepair", name: "Compressor Repair", keyname: "Compressor Repair" },
            { service: "ApplianceRepair", subservice: "ACServiceRepair", name: "Thermostat Replacement", keyname: "Thermostat Replacement" },
            { service: "ApplianceRepair", subservice: "ACServiceRepair", name: "PCB Board Repair", keyname: "PCB Board Repair" },
        
            // Appliance Repair - Washing Machine Repair
            { service: "ApplianceRepair", subservice: "WashingMachineRepair", name: "Drum Replacement or Repair", keyname: "Drum Replacement or Repair" },
            { service: "ApplianceRepair", subservice: "WashingMachineRepair", name: "Motor Repair", keyname: "Motor Repair" },
            { service: "ApplianceRepair", subservice: "WashingMachineRepair", name: "Water Inlet/Outlet Issue Fixing", keyname: "Water Inlet/Outlet Issue Fixing" },
            { service: "ApplianceRepair", subservice: "WashingMachineRepair", name: "Door Lock Mechanism Repair", keyname: "Door Lock Mechanism Repair" },
            { service: "ApplianceRepair", subservice: "WashingMachineRepair", name: "Control Panel Repair", keyname: "Control Panel Repair" },
            
            // Appliance Repair - Refrigerator Repair
            { service: "ApplianceRepair", subservice: "RefrigeratorRepair", name: "Compressor Repair or Replacement", keyname: "Compressor Repair or Replacement" },
            { service: "ApplianceRepair", subservice: "RefrigeratorRepair", name: "Gas Refilling", keyname: "Gas Refilling" },
            { service: "ApplianceRepair", subservice: "RefrigeratorRepair", name: "Defrosting Issues", keyname: "Defrosting Issues" },
            { service: "ApplianceRepair", subservice: "RefrigeratorRepair", name: "Cooling Coil Repair", keyname: "Cooling Coil Repair" },
            { service: "ApplianceRepair", subservice: "RefrigeratorRepair", name: "Thermostat Repair", keyname: "Thermostat Repair" },

            // Appliance Repair - MicrowaveRepair
            { service: "ApplianceRepair", subservice: "MicrowaveRepair", name: "Magnetron Replacement", keyname: "Magnetron Replacement" },
            { service: "ApplianceRepair", subservice: "MicrowaveRepair", name: "Door Alignment or Seal Repair", keyname: "Door Alignment or Seal Repair" },
            { service: "ApplianceRepair", subservice: "MicrowaveRepair", name: "Heating Issues Fixing", keyname: "Heating Issues Fixing" },
            { service: "ApplianceRepair", subservice: "MicrowaveRepair", name: "Control Board Repair", keyname: "Control Board Repair" },
            { service: "ApplianceRepair", subservice: "MicrowaveRepair", name: "Fuse Replacement", keyname: "Fuse Replacement" },

            // Appliance Repair - AirCoolerRepair
            { service: "ApplianceRepair", subservice: "AirCoolerRepair", name: "Pump Replacement", keyname: "Pump Replacement" },
            { service: "ApplianceRepair", subservice: "AirCoolerRepair", name: "Fan Blade Repair", keyname: "Fan Blade Repair" },
            { service: "ApplianceRepair", subservice: "AirCoolerRepair", name: "Cooling Pad Replacement", keyname: "Cooling Pad Replacement" },
            { service: "ApplianceRepair", subservice: "AirCoolerRepair", name: "AirCooler Motor Repair", keyname: "AirCooler Motor Repair" },
            { service: "ApplianceRepair", subservice: "AirCoolerRepair", name: "Water Leakage Fixing", keyname: "Water Leakage Fixing" },

            // Appliance Repair - GeyserWaterHeaterRepair
            { service: "ApplianceRepair", subservice: "GeyserWaterHeaterRepair", name: "Heating Element Replacement", keyname: "Heating Element Replacement" },
            { service: "ApplianceRepair", subservice: "GeyserWaterHeaterRepair", name: "WaterHeater Thermostat Repair", keyname: "WaterHeater Thermostat Repair" },
            { service: "ApplianceRepair", subservice: "GeyserWaterHeaterRepair", name: "Tank Leakage Fixing", keyname: "Tank Leakage Fixing" },
            { service: "ApplianceRepair", subservice: "GeyserWaterHeaterRepair", name: "WaterHeater Installation or Uninstallation", keyname: "WaterHeater Installation or Uninstallation" },
            { service: "ApplianceRepair", subservice: "GeyserWaterHeaterRepair", name: "Circuit Repair", keyname: "Circuit Repair" },

            // Home Cleaning & Repair - Carpentry
            { service: "HomeCleaningRepair", subservice: "Carpentry", name: "Furniture Repair (Tables, Chairs, Cabinets)", keyname: "Furniture Repair (Tables, Chairs, Cabinets)" },
            { service: "HomeCleaningRepair", subservice: "Carpentry", name: "Modular Furniture Installation", keyname: "Modular Furniture Installation" },
            { service: "HomeCleaningRepair", subservice: "Carpentry", name: "Door Lock and Handle Repair/Replacement", keyname: "Door Lock and Handle Repair/Replacement" },
            { service: "HomeCleaningRepair", subservice: "Carpentry", name: "Shelving and Custom Storage Solutions", keyname: "Shelving and Custom Storage Solutions" },
            { service: "HomeCleaningRepair", subservice: "Carpentry", name: "Wooden Polishing and Finishing", keyname: "Wooden Polishing and Finishing" },
            
            // Home Cleaning & Repair - Electrical
            { service: "HomeCleaningRepair", subservice: "Electrical", name: "Fan Installation and Repair", keyname: "Fan Installation and Repair" },
            { service: "HomeCleaningRepair", subservice: "Electrical", name: "Switchboard Repair or Replacement", keyname: "Switchboard Repair or Replacement" },
            { service: "HomeCleaningRepair", subservice: "Electrical", name: "Wiring and Circuit Repair", keyname: "Wiring and Circuit Repair" },
            { service: "HomeCleaningRepair", subservice: "Electrical", name: "Appliance Installation (Geyser, AC)", keyname: "Appliance Installation (Geyser, AC)" },
            { service: "HomeCleaningRepair", subservice: "Electrical", name: "Lighting Installation and Replacement", keyname: "Lighting Installation and Replacement" },
            
            // Home Cleaning & Repair - Plumbing
            { service: "HomeCleaningRepair", subservice: "Plumbing", name: "Tap and Faucet Repair/Replacement", keyname: "Tap and Faucet Repair/Replacement" },
            { service: "HomeCleaningRepair", subservice: "Plumbing", name: "Leakage and Clogging Fixes", keyname: "Leakage and Clogging Fixes" },
            { service: "HomeCleaningRepair", subservice: "Plumbing", name: "Water Tank Cleaning and Maintenance", keyname: "Water Tank Cleaning and Maintenance" },
            { service: "HomeCleaningRepair", subservice: "Plumbing", name: "Bathroom Fitting Installation (Showers, Basins)", keyname: "Bathroom Fitting Installation (Showers, Basins)" },
            { service: "HomeCleaningRepair", subservice: "Plumbing", name: "Pipeline Repair and Replacement", keyname: "Pipeline Repair and Replacement" },
            
            // Home Cleaning & Repair - HomeDeepCleaning
            { service: "HomeCleaningRepair", subservice: "HomeDeepCleaning", name: "Floor and Wall Cleaning", keyname: "Floor and Wall Cleaning" },
            { service: "HomeCleaningRepair", subservice: "HomeDeepCleaning", name: "Furniture and Upholstery Cleaning", keyname: "Furniture and Upholstery Cleaning" },
            { service: "HomeCleaningRepair", subservice: "HomeDeepCleaning", name: "Window and Glass Cleaning", keyname: "Window and Glass Cleaning" },
            { service: "HomeCleaningRepair", subservice: "HomeDeepCleaning", name: "Ceiling Fan and Light Cleaning", keyname: "Ceiling Fan and Light Cleaning" },
            { service: "HomeCleaningRepair", subservice: "HomeDeepCleaning", name: "Dust Removal from Hard-to-Reach Areas", keyname: "Dust Removal from Hard-to-Reach Areas" },
            
            // Home Cleaning & Repair - KitchenDeepCleaning
            { service: "HomeCleaningRepair", subservice: "KitchenDeepCleaning", name: "Chimney and Exhaust Fan Cleaning", keyname: "Chimney and Exhaust Fan Cleaning" },
            { service: "HomeCleaningRepair", subservice: "KitchenDeepCleaning", name: "Degreasing of Cabinets and Surfaces", keyname: "Degreasing of Cabinets and Surfaces" },
            { service: "HomeCleaningRepair", subservice: "KitchenDeepCleaning", name: "Appliance Cleaning (Microwave, Refrigerator)", keyname: "Appliance Cleaning (Microwave, Refrigerator)" },
            { service: "HomeCleaningRepair", subservice: "KitchenDeepCleaning", name: "Sink and Tile Scrubbing", keyname: "Sink and Tile Scrubbing" },
            { service: "HomeCleaningRepair", subservice: "KitchenDeepCleaning", name: "Garbage Disposal Sanitization", keyname: "Garbage Disposal Sanitization" },
            
            // Home Cleaning & Repair - BathroomDeepCleaning
            { service: "HomeCleaningRepair", subservice: "BathroomDeepCleaning", name: "Tile and Grout Cleaning", keyname: "Tile and Grout Cleaning" },
            { service: "HomeCleaningRepair", subservice: "BathroomDeepCleaning", name: "Showerhead and Tap Descaling", keyname: "Showerhead and Tap Descaling" },
            { service: "HomeCleaningRepair", subservice: "BathroomDeepCleaning", name: "Mirror and Glass Polishing", keyname: "Mirror and Glass Polishing" },
            { service: "HomeCleaningRepair", subservice: "BathroomDeepCleaning", name: "Toilet and Basin Cleaning", keyname: "Toilet and Basin Cleaning" },
            { service: "HomeCleaningRepair", subservice: "BathroomDeepCleaning", name: "Exhaust Fan Cleaning", keyname: "Exhaust Fan Cleaning" },
            
            // Home Cleaning & Repair - CarCleaning
            { service: "HomeCleaningRepair", subservice: "CarCleaning", name: "Exterior Washing and Waxing", keyname: "Exterior Washing and Waxing" },
            { service: "HomeCleaningRepair", subservice: "CarCleaning", name: "Interior Vacuuming", keyname: "Interior Vacuuming" },
            { service: "HomeCleaningRepair", subservice: "CarCleaning", name: "Seat and Upholstery Cleaning", keyname: "Seat and Upholstery Cleaning" },
            { service: "HomeCleaningRepair", subservice: "CarCleaning", name: "Dashboard Polishing", keyname: "Dashboard Polishing" },
            { service: "HomeCleaningRepair", subservice: "CarCleaning", name: "Tire Cleaning and Polishing", keyname: "Tire Cleaning and Polishing" },
            
            // Home Cleaning & Repair - PestControl
            { service: "HomeCleaningRepair", subservice: "PestControl", name: "Cockroach Control", keyname: "Cockroach Control" },
            { service: "HomeCleaningRepair", subservice: "PestControl", name: "Termite Treatment", keyname: "Termite Treatment" },
            { service: "HomeCleaningRepair", subservice: "PestControl", name: "Bed Bug Extermination", keyname: "Bed Bug Extermination" },
            { service: "HomeCleaningRepair", subservice: "PestControl", name: "Mosquito Fogging", keyname: "Mosquito Fogging" },
            { service: "HomeCleaningRepair", subservice: "PestControl", name: "Rodent Control", keyname: "Rodent Control" },
            
            // Home Cleaning & Repair - Painting
            { service: "HomeCleaningRepair", subservice: "Painting", name: "Interior Wall Painting", keyname: "Interior Wall Painting" },
            { service: "HomeCleaningRepair", subservice: "Painting", name: "Exterior Wall Painting", keyname: "Exterior Wall Painting" },
            { service: "HomeCleaningRepair", subservice: "Painting", name: "Furniture Polishing and Repainting", keyname: "Furniture Polishing and Repainting" },
            { service: "HomeCleaningRepair", subservice: "Painting", name: "Textured and Designer Wall Painting", keyname: "Textured and Designer Wall Painting" },
            { service: "HomeCleaningRepair", subservice: "Painting", name: "Stain and Spot Removal", keyname: "Stain and Spot Removal" },
            
            // Home Cleaning & Repair - FurnitureShampooingCleaning
            { service: "HomeCleaningRepair", subservice: "FurnitureShampooingCleaning", name: "Sofa Shampooing", keyname: "Sofa Shampooing" },
            { service: "HomeCleaningRepair", subservice: "FurnitureShampooingCleaning", name: "Carpet and Rug Cleaning", keyname: "Carpet and Rug Cleaning" },
            { service: "HomeCleaningRepair", subservice: "FurnitureShampooingCleaning", name: "Mattress Deep Cleaning", keyname: "Mattress Deep Cleaning" },
            { service: "HomeCleaningRepair", subservice: "FurnitureShampooingCleaning", name: "Chair and Upholstery Cleaning", keyname: "Chair and Upholstery Cleaning" },
            { service: "HomeCleaningRepair", subservice: "FurnitureShampooingCleaning", name: "Stain and Odor Removal", keyname: "Stain and Odor Removal" },
            
            // Home Made Food - CakesAndChocolates
            { service: "HomeMadeFood", subservice: "CakesAndChocolates", name: "Custom Birthday Cakes", keyname: "Custom Birthday Cakes" },
            { service: "HomeMadeFood", subservice: "CakesAndChocolates", name: "Designer and Theme Cakes", keyname: "Designer and Theme Cakes" },
            { service: "HomeMadeFood", subservice: "CakesAndChocolates", name: "Handmade Chocolates (Truffles, Bars)", keyname: "Handmade Chocolates (Truffles, Bars)" },
            { service: "HomeMadeFood", subservice: "CakesAndChocolates", name: "Cupcakes and Pastries", keyname: "Cupcakes and Pastries" },
            { service: "HomeMadeFood", subservice: "CakesAndChocolates", name: "Seasonal Specialties (Christmas Cakes, Easter Eggs)", keyname: "Seasonal Specialties (Christmas Cakes, Easter Eggs)" },
            
            // Home Made Food - DifferentPickles
            { service: "HomeMadeFood", subservice: "DifferentPickles", name: "Mango Pickle", keyname: "Mango Pickle" },
            { service: "HomeMadeFood", subservice: "DifferentPickles", name: "Lemon Pickle", keyname: "Lemon Pickle" },
            { service: "HomeMadeFood", subservice: "DifferentPickles", name: "Mixed Vegetable Pickle", keyname: "Mixed Vegetable Pickle" },
            { service: "HomeMadeFood", subservice: "DifferentPickles", name: "Garlic or Ginger Pickle", keyname: "Garlic or Ginger Pickle" },
            { service: "HomeMadeFood", subservice: "DifferentPickles", name: "Non-Veg Pickles (Fish, Chicken)", keyname: "Non-Veg Pickles (Fish, Chicken)" },
            
            // Home Made Food - HomeMadeSnacks
            { service: "HomeMadeFood", subservice: "HomeMadeSnacks", name: "Namkeens and Mixtures", keyname: "Namkeens and Mixtures" },
            { service: "HomeMadeFood", subservice: "HomeMadeSnacks", name: "Stuffed Samosas and Kachoris", keyname: "Stuffed Samosas and Kachoris" },
            { service: "HomeMadeFood", subservice: "HomeMadeSnacks", name: "Murukku and Chakli", keyname: "Murukku and Chakli" },
            { service: "HomeMadeFood", subservice: "HomeMadeSnacks", name: "Sweet Snacks (Laddoos, Barfis)", keyname: "Sweet Snacks (Laddoos, Barfis)" },
            { service: "HomeMadeFood", subservice: "HomeMadeSnacks", name: "Savory Puffs and Rolls", keyname: "Savory Puffs and Rolls" },
            
            // Home Made Food - TiffinServices
            { service: "HomeMadeFood", subservice: "TiffinServices", name: "Vegetarian Meal Plans", keyname: "Vegetarian Meal Plans" },
            { service: "HomeMadeFood", subservice: "TiffinServices", name: "Non-Vegetarian Meal Plans", keyname: "Non-Vegetarian Meal Plans" },
            { service: "HomeMadeFood", subservice: "TiffinServices", name: "Diet-Specific Tiffins (Keto, Low-Calorie)", keyname: "Diet-Specific Tiffins (Keto, Low-Calorie)" },
            { service: "HomeMadeFood", subservice: "TiffinServices", name: "Corporate Lunch Packages", keyname: "Corporate Lunch Packages" },
            { service: "HomeMadeFood", subservice: "TiffinServices", name: "Regional Cuisine Specialties (North Indian, South Indian)", keyname: "Regional Cuisine Specialties (North Indian, South Indian)" },
                
            
        ];
        

        // Check and insert services data
        for (const service of servicesData) {
            let serviceDoc = await Service.findOne({ name: service.name });
            if (!serviceDoc) {
                serviceDoc = await Service.create(service);
            }
        
            // Add related subservices
            const relatedSubservices = subservicesData.filter(sub => sub.service === service.name);
            const subserviceIds = [];
            for (const subservice of relatedSubservices) {
                let subserviceDoc = await Subservice.findOne({ name: subservice.name, service: serviceDoc._id });
                if (!subserviceDoc) {
                    subserviceDoc = await Subservice.create({ ...subservice, service: serviceDoc._id });
                }
                subserviceIds.push(subserviceDoc._id);
            }
        
            // Update service with subservices array
            serviceDoc.subservices = subserviceIds;
            await serviceDoc.save();
        
            // Add related worktypes
            const relatedWorktypes = worktypesData.filter(worktype =>
                relatedSubservices.some(sub => sub.name === worktype.subservice)
            );
        
            for (const worktype of relatedWorktypes) {
                // Find the subservice document from the database
                const subserviceDoc = await Subservice.findOne({
                    name: worktype.subservice,
                    service: serviceDoc._id,
                });
        
                if (subserviceDoc) {
                    let worktypeDoc = await WorkType.findOne({
                        name: worktype.name,
                        service: serviceDoc._id,
                        subservice: subserviceDoc._id,
                    });
                    if (!worktypeDoc) {
                        worktypeDoc = await WorkType.create({
                            ...worktype,
                            service: serviceDoc._id,
                            subservice: subserviceDoc._id,
                        });
        
                        // Update subservice with the new worktype
                        subserviceDoc.worktypes.push(worktypeDoc._id);
                        await subserviceDoc.save();
                    }
                } else {
                    console.error(`Subservice not found for worktype: ${worktype.name}`);
                }
            }
        }
        


        console.log("Database seeded successfully");
    } catch (err) {
        console.error("Error seeding database:", err);
    } 
};

module.exports =  seedDatabase ;