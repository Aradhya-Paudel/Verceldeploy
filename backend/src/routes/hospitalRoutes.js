const express = require("express");
const router = express.Router();
const {
  getAllHospitals,
  getHospital,
  getHospitalByName,
  getHospitalDashboard,
  updateBeds,
  updateBloodInventory,
  updateStaff,
  updateAmbulanceCount,
  getHospitalFleet,
  getBloodInventory,
  getStaff,
  findBestHospital,
} = require("../controllers/hospitalController");

// GET /api/hospitals - Sabai hospital ko list paune (Get all hospitals)
router.get("/", getAllHospitals);

// POST /api/hospitals/find-best - Casualty ko lagi best hospital khojne (Find best hospital for casualty)
router.post("/find-best", findBestHospital);

// GET /api/hospitals/by-name/:name - Name le hospital khojne (Get hospital by name)
router.get("/by-name/:name", getHospitalByName);

// GET /api/hospitals/:id - ID le hospital khojne (Get hospital by ID)
router.get("/:id", getHospital);

// GET /api/hospitals/:id/dashboard - Hospital ko dashboard data paune (Get hospital dashboard data)
router.get("/:id/dashboard", getHospitalDashboard);

// GET /api/hospitals/:id/fleet - Hospital ko ambulance haru paune (Get hospital ambulances)
router.get("/:id/fleet", getHospitalFleet);

// GET /api/hospitals/:id/blood-inventory - Hospital ko blood inventory paune (Get blood inventory)
router.get("/:id/blood-inventory", getBloodInventory);

// GET /api/hospitals/:id/staff - Hospital ko staff paune (Get staff)
router.get("/:id/staff", getStaff);

// PATCH /api/hospitals/:id/beds - Hospital ko beds update garne (Update beds)
router.patch("/:id/beds", updateBeds);

// PATCH /api/hospitals/:id/blood-inventory - Blood inventory update garne (Update blood inventory)
router.patch("/:id/blood-inventory", updateBloodInventory);

// PATCH /api/hospitals/:id/staff - Staff update garne (Update staff)
router.patch("/:id/staff", updateStaff);

// PATCH /api/hospitals/:id/ambulance-count - Ambulance count update garne (Update ambulance count)
router.patch("/:id/ambulance-count", updateAmbulanceCount);

module.exports = router;
