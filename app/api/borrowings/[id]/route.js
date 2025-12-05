import connection from "@/app/lib/database";

// PUT approve/decline/return/close peminjaman
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { action } = await req.json(); // approve, decline, return, close

    const [borrowRows] = await connection.execute(
      "SELECT user_id, book_id, status FROM borrowings WHERE id = ?",
      [id]
    );
    if (!borrowRows.length) return new Response("Data peminjaman tidak ditemukan", { status: 404 });

    const { user_id, book_id, status } = borrowRows[0];

    // approve
    if (action === "approve" && status === "pending") {
      await connection.execute(
        "UPDATE borrowings SET status='approved', borrow_date=NOW(), return_date=DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id=?",
        [id]
      );
      await connection.execute("UPDATE books SET stock = stock - 1 WHERE id=?", [book_id]);
    }

    // decline
    if (action === "decline" && status === "pending") {
      await connection.execute("UPDATE borrowings SET status='declined' WHERE id=?", [id]);
    }

    // return
    if (action === "return" && status === "approved") {
      await connection.execute(
        "UPDATE borrowings SET status='returned', return_date=NOW() WHERE id=?",
        [id]
      );
      await connection.execute("UPDATE books SET stock = stock + 1 WHERE id=?", [book_id]);
    }

    // close
    if (action === "close") {
      await connection.execute("UPDATE borrowings SET status='done' WHERE id=?", [id]);
    }

    // catat ke history setiap perubahan status
    await connection.execute(
      `INSERT INTO history (borrowId, userId, bookId, action, date, time)
       VALUES (?, ?, ?, ?, CURDATE(), CURTIME())`,
      [id, user_id, book_id, action]
    );

    // notif ke user
    await connection.execute(
      "INSERT INTO notifications (user_id, type, message) VALUES (?, 'borrow_response', ?)",
      [user_id, `Permintaan peminjaman buku telah ${action}`]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to update" }), { status: 500 });
  }
}
