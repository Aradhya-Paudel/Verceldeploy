const express = require("express");
const router = express.Router();
const {
  addCasualtyToAccident,
  getAllCasualties,
  getCasualtiesForAccident,
  getHospitalRecommendations,
  updateCasualtyStatus,
} = require("../controllers/casualtyController");

// POST /api/casualties - Naya casualty add garne (Add new casualty)
router.post("/", addCasualtyToAccident);

// POST /api/casualties/recommend-hospitals - Hospital recommend garne (Get hospital recommendations)
router.post("/recommend-hospitals", getHospitalRecommendations);

// GET /api/casualties - Sabai casualty paune (Get all casualties)
router.get("/", getAllCasualties);

// GET /api/casualties/accident/:accidentId - Accident anusar casualty paune (Get casualties for accident)
router.get("/accident/:accidentId", getCasualtiesForAccident);

// PATCH /api/casualties/:id/status - Casualty ko status update garne (Update casualty status)
router.patch("/:id/status", updateCasualtyStatus);

module.exports = router;
