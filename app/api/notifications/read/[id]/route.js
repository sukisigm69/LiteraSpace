import connection from "@/app/lib/database";

// PUT tandai notif sudah dibaca
export async function PUT(req, { params }) {
  const { id } = params;

  await connection.execute(
    "UPDATE notifications SET `read` = 1 WHERE id = ?",
    [id]
  );

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
