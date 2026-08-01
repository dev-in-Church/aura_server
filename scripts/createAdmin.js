/**
 * Create (or update) an admin user.
 *
 * Usage:
 *   node scripts/createAdmin.js "Admin Name" admin@auraexpressafricaltd.com "StrongPassword123"
 *
 * If the email already exists, its name and password are updated.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../src/config/database");

async function main() {
  const [, , nameArg, emailArg, passwordArg] = process.argv;

  const name = nameArg;
  const email = emailArg;
  const password = passwordArg;

  if (!name || !email || !password) {
    console.error(
      'Usage: node scripts/createAdmin.js "Name" email@example.com "password"',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  try {
    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO admin_users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
       RETURNING id, name, email, role`,
      [name, email.toLowerCase(), password_hash],
    );

    console.log("Admin user ready:");
    console.log(result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
}

main();
