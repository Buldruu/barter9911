import "dotenv/config";
import bcrypt from "bcrypt";
import { initDb, get, run } from "./db.js";

await initDb();

const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
const pass = process.env.ADMIN_BOOTSTRAP_PASSWORD;

const exists = await get("SELECT id FROM users WHERE email = ?", [email]);
if (!exists) {
  const hash = await bcrypt.hash(pass, 10);
  await run("INSERT INTO users (email, password_hash, role) VALUES (?,?,?)", [
    email,
    hash,
    "admin",
  ]);
  console.log("✅ Admin created:", email, pass);
} else {
  console.log("ℹ️ Admin already exists:", email);
}
process.exit(0);
