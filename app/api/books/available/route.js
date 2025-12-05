import connection from "@/app/lib/database";

export async function GET() {
  const [books] = await connection.execute(
    `SELECT COUNT(*) AS available FROM books WHERE stock > 0`
  );

  return new Response(JSON.stringify(books[0]), {
    headers: { "Content-Type": "application/json" },
  });
}
