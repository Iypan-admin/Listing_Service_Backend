const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
    uploadCSV,
    getAllCards,
    getCardStats,
    getRecentInactiveCards
} = require("../controllers/cardActivationsController");

// POST /api/cards/upload
router.post("/upload", upload.single("file"), uploadCSV);

// GET /api/cards/  (all cards)
router.get("/", getAllCards);

// ✅ New route for stats
// GET /api/cards/stats
router.get("/stats", getCardStats);

router.get("/recent-inactive", getRecentInactiveCards);

module.exports = router;
