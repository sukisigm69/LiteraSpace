import { NextResponse } from "next/server";
import connection from "@/app/lib/database";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([]);

    const [rows] = await connection.execute(
      `SELECT 
          h.id,
          h.borrowId,
          h.userId,
          h.bookId,
          h.action,
          h.date,
          h.time,
          b.title,
          b.author,
          b.image,
          (
            SELECT status 
            FROM borrowings 
            WHERE id = h.borrowId
          ) AS status
       FROM history h
       JOIN books b ON h.bookId = b.id
       WHERE h.userId = ?
       ORDER BY h.date DESC, h.time DESC`,
      [userId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ Error GET History:", err);
    return NextResponse.json([], { status: 200 });
  }
}
