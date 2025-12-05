import connection from "@/app/lib/database";

// GET: Ambil semua notifikasi user
export async function GET(req, { params }) {
  const { userId } = params;
  const [rows] = await connection.execute(
    "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC",
    [userId]
  );
  return new Response(JSON.stringify(rows), { status: 200 });
}

// PUT: Tandai notifikasi sudah dibaca
export async function PUT(req, { params }) {
  const { notifId } = params;
  await connection.execute("UPDATE notifications SET read=1 WHERE id=?", [notifId]);
  return new Response("OK", { status: 200 });
}
