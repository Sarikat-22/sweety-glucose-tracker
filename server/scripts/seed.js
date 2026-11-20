
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
  try {
    // Create a demo user
    const email = "demo@sweety.com";
    const password = "Demo@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ["Demo User", email, hashedPassword]
    );

    // Get the user ID, including when the user already exists
    let userId;

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      userId = existingUser.rows[0].id;
    }

    // Use yesterday's date for sample readings
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const readingDate = [
      yesterday.getFullYear(),
      String(yesterday.getMonth() + 1).padStart(2, "0"),
      String(yesterday.getDate()).padStart(2, "0")
    ].join("-");

    const readings = [
      ["Morning fasting", 105],
      ["After breakfast", 145],
      ["After lunch", 135],
      ["After dinner", 125]
    ];

    // Insert sample readings without duplicating existing ones
    for (const [slot, level] of readings) {
      await pool.query(
        `INSERT INTO glucose_readings
         (user_id, reading_date, reading_slot, glucose_level)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, reading_slot) DO NOTHING`,
        [userId, readingDate, slot, level]
      );
    }

    console.log("Database seeding completed!");
    console.log("Demo email:", email);
    console.log("Demo password:", password);
    console.log("Sample readings:", readings.length);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedDatabase();
