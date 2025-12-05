import { NextResponse } from "next/server";
import connection from "@/app/lib/database";

// 🔹 GET — Ambil semua user
export async function GET() {
  try {
    const [rows] = await connection.execute(
      "SELECT id, username, email, role, image FROM users ORDER BY id DESC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ Error GET /users:", err);
    return NextResponse.json({ error: "Gagal mengambil data users." }, { status: 500 });
  }
}

// 🔹 GET by ID (optional)
export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID tidak diberikan." }, { status: 400 });

    const [rows] = await connection.execute(
      "SELECT id, username, email, role, image FROM users WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("❌ Error POST /users:", err);
    return NextResponse.json({ error: "Gagal mengambil user." }, { status: 500 });
  }
}
