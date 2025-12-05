import { NextResponse } from "next/server";
import connection from "@/app/lib/database";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([]);

    const [rows] = await connection.execute(
      `SELECT id, type, message, created_at 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ Error GET notifications:", err);
    return NextResponse.json([], { status: 200 });
  }
}
