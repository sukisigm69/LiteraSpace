import connection from "@/app/lib/database";

export async function GET() {
  try {
    const [rows] = await connection.execute(`
      SELECT 
        borrowings.id,
        books.title AS book_title,
        users.username AS user_name,
        borrowings.request_date
      FROM borrowings
      JOIN books ON borrowings.book_id = books.id
      JOIN users ON borrowings.user_id = users.id
      WHERE borrowings.status = 'pending'
      ORDER BY borrowings.request_date DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("Error fetching pending borrowings:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
