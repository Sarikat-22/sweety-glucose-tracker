
const pool = require("../config/db");

// Convert a JavaScript date to YYYY-MM-DD using local time
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Validate YYYY-MM-DD and check that it is a real date
const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

// Get summary statistics for a date range
const getSummary = async (userId, startDate, endDate) => {
  const result = await pool.query(
    `SELECT
       MAX(glucose_level) AS high,
       MIN(glucose_level) AS low,
       ROUND(AVG(glucose_level), 1) AS average,
       COUNT(*) AS count
     FROM glucose_readings
     WHERE user_id = $1
       AND reading_date >= $2::date
       AND reading_date < $3::date`,
    [userId, startDate, endDate]
  );

  const stats = result.rows[0];

  return {
    high: stats.high === null ? null : Number(stats.high),
    low: stats.low === null ? null : Number(stats.low),
    average: stats.average === null ? null : Number(stats.average),
    count: Number(stats.count)
  };
};

// DAILY REPORT
const getDailyReport = async (req, res) => {
  try {
    const reportDate = req.query.date || formatDate(new Date());

    if (!isValidDate(reportDate)) {
      return res.status(400).json({
        message: "Invalid date. Use YYYY-MM-DD format."
      });
    }

    if (reportDate > formatDate(new Date())) {
      return res.status(400).json({
        message: "Future dates are not allowed."
      });
    }

    const nextDate = new Date(
      Number(reportDate.slice(0, 4)),
      Number(reportDate.slice(5, 7)) - 1,
      Number(reportDate.slice(8, 10)) + 1
    );

    const endDate = formatDate(nextDate);

    const summary = await getSummary(
      req.user.id,
      reportDate,
      endDate
    );

    const readingsResult = await pool.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         reading_slot,
         glucose_level
       FROM glucose_readings
       WHERE user_id = $1
         AND reading_date >= $2::date
         AND reading_date < $3::date
       ORDER BY
         CASE reading_slot
           WHEN 'Morning fasting' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [req.user.id, reportDate, endDate]
    );

    return res.status(200).json({
      message: "Daily report fetched successfully",
      date: reportDate,
      summary,
      readings: readingsResult.rows
    });
  } catch (error) {
    console.error("Daily report error:", error);
    return res.status(500).json({
      message: "Failed to fetch daily report"
    });
  }
};

// MONTH-TO-DATE REPORT
const getMonthToDateReport = async (req, res) => {
  try {
    const today = new Date();

    const startDate = formatDate(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    const endDate = formatDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    );

    const summary = await getSummary(
      req.user.id,
      startDate,
      endDate
    );

    return res.status(200).json({
      message: "Month-to-date report fetched successfully",
      period: {
        startDate,
        endDate: formatDate(today)
      },
      summary
    });
  } catch (error) {
    console.error("Month-to-date report error:", error);
    return res.status(500).json({
      message: "Failed to fetch month-to-date report"
    });
  }
};

// PREVIOUS-MONTH REPORT
const getPreviousMonthReport = async (req, res) => {
  try {
    const today = new Date();

    const firstDayPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const firstDayCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const startDate = formatDate(firstDayPreviousMonth);
    const endDate = formatDate(firstDayCurrentMonth);

    const summary = await getSummary(
      req.user.id,
      startDate,
      endDate
    );

    // Last calendar day of the previous month
    const lastDayPreviousMonth = formatDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      )
    );

    return res.status(200).json({
      message: "Previous-month report fetched successfully",
      period: {
        startDate,
        endDate: lastDayPreviousMonth
      },
      summary
    });
  } catch (error) {
    console.error("Previous-month report error:", error);
    return res.status(500).json({
      message: "Failed to fetch previous-month report"
    });
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport
};
