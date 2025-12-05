import connection from "@/app/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  const session = await getServerSession(authOptions);
  if (!session || !["admin", "petugas"].includes(session.user.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Ambil data borrowing untuk log
    const [borrowRows] = await connection.execute(
      `SELECT user_id, book_id FROM borrowings WHERE id=?`,
      [id]
    );

    if (!borrowRows.length) {
      return new Response("Borrowing not found", { status: 404 });
    }

    const userId = borrowRows[0].user_id;
    const bookId = borrowRows[0].book_id;

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);

    // ===========================
    // ACCEPT
    // ===========================
    if (action === "accept") {
      await connection.execute(
        `UPDATE borrowings 
          SET status='approved', borrow_date=NOW(), return_date=DATE_ADD(NOW(), INTERVAL 7 DAY)
         WHERE id=?`,
        [id]
      );

      await connection.execute(
        `UPDATE books SET stock = stock - 1 WHERE id=?`,
        [bookId]
      );

      await connection.execute(
        `INSERT INTO history (userId, bookId, borrowId, action, date, time)
         VALUES (?, ?, ?, 'accepted', ?, ?)`,
        [userId, bookId, id, date, time]
      );
    }

    // ===========================
    // DECLINE
    // ===========================
    else if (action === "decline") {
      await connection.execute(
        "UPDATE borrowings SET status='declined' WHERE id=?",
        [id]
      );

      await connection.execute(
        `INSERT INTO history (userId, bookId, borrowId, action, date, time)
         VALUES (?, ?, ?, 'declined', ?, ?)`,
        [userId, bookId, id, date, time]
      );
    }

    // ===========================
    // CLOSE (done / returned)
    // ===========================
    else if (action === "close") {
      await connection.execute(
        "UPDATE borrowings SET status='done', return_date=NOW() WHERE id=?",
        [id]
      );

      await connection.execute(
        "UPDATE books SET stock = stock + 1 WHERE id=?",
        [bookId]
      );

      await connection.execute(
        `INSERT INTO history (userId, bookId, borrowId, action, date, time)
         VALUES (?, ?, ?, 'returned', ?, ?)`,
        [userId, bookId, id, date, time]
      );
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ Error aksi admin/petugas:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
