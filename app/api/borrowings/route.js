import connection from "@/app/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET semua borrowings (untuk admin/petugas)
export async function GET() {
  const [rows] = await connection.execute(`
    SELECT bo.id AS borrowing_id, bo.book_id, b.title, b.stock,
           u.username, bo.status, bo.borrow_date, bo.return_date
    FROM borrowings bo
    JOIN books b ON bo.book_id = b.id
    JOIN users u ON bo.user_id = u.id
    ORDER BY bo.id DESC
  `);

  return new Response(JSON.stringify(rows), { status: 200 });
}

// POST user meminjam buku
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const { bookId } = await req.json();

    // cek stok buku
    const [bookRows] = await connection.execute(
      "SELECT stock, title FROM books WHERE id = ?",
      [bookId]
    );
    if (!bookRows.length) return new Response("Buku tidak ditemukan", { status: 404 });
    if (bookRows[0].stock <= 0) return new Response("Stok buku habis", { status: 400 });

    const bookTitle = bookRows[0].title;

    // insert peminjaman
    const [result] = await connection.execute(
      "INSERT INTO borrowings (book_id, user_id, status, borrow_date) VALUES (?, ?, 'pending', NOW())",
      [bookId, session.user.id]
    );

    const borrowId = result.insertId;

    // catat ke history
    await connection.execute(
      `INSERT INTO history (borrowId, userId, bookId, action, date, time)
       VALUES (?, ?, ?, 'pending', CURDATE(), CURTIME())`,
      [borrowId, session.user.id, bookId]
    );

    // notif ke semua petugas
    const [petugasRows] = await connection.execute("SELECT id FROM users WHERE role = 'petugas'");
    for (const petugas of petugasRows) {
      await connection.execute(
        "INSERT INTO notifications (user_id, type, message) VALUES (?, 'borrow_request', ?)",
        [petugas.id, `User ${session.user.username} meminjam buku ${bookTitle}`]
      );
    }

    return new Response(
      "Permintaan peminjaman dikirim dan menunggu persetujuan petugas.",
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
