
const pool = require("../config/db");

// Validate date format and prevent future dates
const isValidReadingDate = (reading_date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
    return false;
  }

  const [year, month, day] = reading_date.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);

  return reading_date <= today;
};

const validSlots = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner"
];

// ADD READING
const addReading = async (req, res) => {
  try {
    const { reading_date, reading_slot, glucose_level } = req.body;

    if (!reading_date || !reading_slot || glucose_level === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const level = Number(glucose_level);

    if (!Number.isInteger(level) || level < 40 || level > 600) {
      return res.status(400).json({
        message: "Glucose level must be a whole number between 40 and 600"
      });
    }

    if (!validSlots.includes(reading_slot)) {
      return res.status(400).json({ message: "Invalid reading slot" });
    }

    if (!isValidReadingDate(reading_date)) {
      return res.status(400).json({
        message: "Invalid reading date or future dates are not allowed"
      });
    }

    const result = await pool.query(
      `INSERT INTO glucose_readings
       (user_id, reading_date, reading_slot, glucose_level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, reading_date, reading_slot, level]
    );

    return res.status(201).json({
      message: "Glucose reading added successfully",
      reading: result.rows[0]
    });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading already exists for this slot on this date"
      });
    }

    console.error("Add reading error:", error.message);
    return res.status(500).json({ message: "Server error while adding reading" });
  }
};

// GET READINGS
const getReadings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, reading_date, reading_slot, glucose_level
       FROM glucose_readings
       WHERE user_id = $1
       ORDER BY reading_date DESC, id DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      message: "Glucose readings fetched successfully",
      count: result.rows.length,
      readings: result.rows
    });

  } catch (error) {
    console.error("Get readings error:", error.message);
    return res.status(500).json({ message: "Server error while fetching readings" });
  }
};

// UPDATE READING
const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { reading_date, reading_slot, glucose_level } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({ message: "Invalid reading ID" });
    }

    if (!reading_date || !reading_slot || glucose_level === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const level = Number(glucose_level);

    if (!Number.isInteger(level) || level < 40 || level > 600) {
      return res.status(400).json({
        message: "Glucose level must be a whole number between 40 and 600"
      });
    }

    if (!validSlots.includes(reading_slot)) {
      return res.status(400).json({ message: "Invalid reading slot" });
    }

    if (!isValidReadingDate(reading_date)) {
      return res.status(400).json({
        message: "Invalid reading date or future dates are not allowed"
      });
    }

    const result = await pool.query(
      `UPDATE glucose_readings
       SET reading_date = $1,
           reading_slot = $2,
           glucose_level = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [reading_date, reading_slot, level, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reading not found" });
    }

    return res.status(200).json({
      message: "Glucose reading updated successfully",
      reading: result.rows[0]
    });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading already exists for this slot on this date"
      });
    }

    console.error("Update reading error:", error.message);
    return res.status(500).json({ message: "Server error while updating reading" });
  }
};

const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "Invalid reading ID"
      });
    }

    const result = await pool.query(
      `DELETE FROM glucose_readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found"
      });
    }

    return res.status(200).json({
      message: "Glucose reading deleted successfully"
    });

  } catch (error) {
    console.error("Delete reading error:", error);

    return res.status(500).json({
      message: "Server error while deleting reading"
    });
  }
};

module.exports = {
  addReading,
  getReadings,
  updateReading,
  deleteReading
};
