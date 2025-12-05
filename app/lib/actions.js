"use server";

import bcrypt from "bcryptjs";
import connection from "./database";
import { redirect } from "next/navigation";

// --------------------------
// Register user baru
// --------------------------
export async function registerUser(formData) {
  const username = formData.get("username")?.trim();
  const email = formData.get("email")?.trim().toLowerCase();
  const password = formData.get("password");

  if (!username || !email || !password) {
    throw new Error("Semua field harus diisi!");
  }

  // Cek apakah email sudah ada
  const [existing] = await connection.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Email sudah terdaftar!");
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert user
  await connection.execute(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
    [username, email, hashedPassword, "user"]
  );

  // Redirect ke login
  redirect("/login");
}

// --------------------------
// Ambil user dari email
// --------------------------
export async function getUserByEmail(email) {
  if (!email) return null;

  const [users] = await connection.execute(
    "SELECT id, username, email, password, role, profile_image FROM users WHERE email = ?",
    [email]
  );

  return users[0] || null;
}
