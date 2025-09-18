const express = require("express");
const router = express.Router();
const leadsController = require("../controllers/leadsController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Create a new lead (only logged-in user)
router.post("/", authMiddleware, leadsController.createLead);

// ✅ Get all leads for the logged-in user
router.get("/", authMiddleware, leadsController.getLeads);

// ✅ Update lead status by lead_id (only if it belongs to logged-in user)
router.patch("/:id/status", authMiddleware, leadsController.updateLeadStatus);

module.exports = router;
