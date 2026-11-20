
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");
const glucoseRoutes = require("./routes/glucoseRoutes");
const reportRoutes = require("./routes/reportRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test API route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Sweety Glucose Tracker API"
  });
});

// Database test route
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database()"
    );

    res.json({
      status: "success",
      database: result.rows[0].current_database
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/glucose", glucoseRoutes);
app.use("/api/reports", reportRoutes);
const protect = require("./middleware/authMiddleware");

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Sweety server running on port ${PORT}`);
});
