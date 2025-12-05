import { NextResponse } from "next/server";
import connection from "@/app/lib/database";

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const [rows] = await connection.execute("SELECT id, username, email, role, image FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("❌ Error GET user:", err);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}
