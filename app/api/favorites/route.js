import connection from "@/app/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET → ambil semua favorites user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [rows] = await connection.execute(
    `SELECT f.id, f.book_id, b.title, b.author, b.image 
     FROM favorites f
     JOIN books b ON f.book_id = b.id
     WHERE f.user_id = ?`,
    [session.user.id]
  );

  return Response.json(rows);
}

// POST → tambah favorite
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { bookId } = await req.json();

  await connection.execute(
    `INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)`,
    [session.user.id, bookId]
  );

  return new Response("Added", { status: 200 });
}

// DELETE → hapus favorite
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { bookId } = await req.json();

  await connection.execute(
    `DELETE FROM favorites WHERE user_id = ? AND book_id = ?`,
    [session.user.id, bookId]
  );

  return new Response("Removed", { status: 200 });
}
