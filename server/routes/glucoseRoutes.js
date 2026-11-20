const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  addReading,
  getReadings,
  updateReading,
  deleteReading
} = require("../controllers/glucoseController");
router.post("/", protect, addReading);
router.get("/", protect, getReadings);
router.put("/:id", protect, updateReading);
router.delete("/:id", protect, deleteReading);
module.exports = router;