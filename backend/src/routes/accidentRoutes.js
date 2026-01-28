const express = require("express");
const router = express.Router();
const {
  reportAccident,
  getAllAccidents,
  getAccident,
  updateAccidentStatus,
  getPendingAccidents,
} = require("../controllers/accidentController");

// POST /api/accidents/report - Report new accident
router.post("/report", reportAccident);

// GET /api/accidents/pending - Get pending accidents
router.get("/pending", getPendingAccidents);

// GET /api/accidents - Get all accidents
router.get("/", getAllAccidents);

// GET /api/accidents/:id - Get accident by ID
router.get("/:id", getAccident);

// PATCH /api/accidents/:id/status - Update accident status
router.patch("/:id/status", updateAccidentStatus);

module.exports = router;
