import connection from "@/app/lib/database";
import { NextResponse } from "next/server";

// 🔹 GET — Ambil detail buku berdasarkan ID
export async function GET(req, { params }) {
  const { id } = await params; // <-- FIX WAJIB

  try {
    const [rows] = await connection.execute("SELECT * FROM books WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: "Buku tidak ditemukan" }, { status: 404 });
    }

    const book = rows[0];

    // 🔹 Default cover jika kosong
    const title = book.title || "";
    const defaultImage =
      title.includes("Clean Code")
        ? "https://i.pinimg.com/736x/1b/35/0a/1b350a004666a6159610d0718cd1012b.jpg"
        : title.includes("Pragmatic")
        ? "https://m.media-amazon.com/images/I/41as+WafrFL._SX377_.jpg"
        : title.includes("JavaScript")
        ? "https://m.media-amazon.com/images/I/51gdVAEfPUL._SX379_.jpg"
        : title.includes("Journal 3")
        ? "https://i.pinimg.com/1200x/34/d9/1a/34d91a03a5c8c8a683b53b7ffb1ae9b4.jpg"
        : "https://i.pinimg.com/736x/ae/cd/25/aecd250504c8812d912d742dd9156325.jpg";

    const bookWithImage = {
      ...book,
      image: book.image || defaultImage,
      category: book.category_id || "Umum",
      publisher: book.publisher || "Tidak diketahui",
      year: book.year_published || "Tidak diketahui",
    };

    return NextResponse.json(bookWithImage);
  } catch (error) {
    console.error("❌ Error fetching book detail:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// 🔹 PATCH — Tambah/Kurangi stok (khusus Admin)
export async function PATCH(req, { params }) {
  const { id } = await params; // <-- FIX WAJIB

  try {
    const { stockChange, role } = await req.json();

    // 🔒 Hanya admin yang boleh update stok
    if (role !== "admin") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya admin yang bisa memperbarui stok." },
        { status: 403 }
      );
    }

    const [rows] = await connection.execute("SELECT stock FROM books WHERE id = ?", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: "Buku tidak ditemukan" }, { status: 404 });
    }

    const currentStock = rows[0].stock;
    const newStock = Math.max(0, currentStock + Number(stockChange));

    await connection.execute("UPDATE books SET stock = ? WHERE id = ?", [newStock, id]);

    return NextResponse.json({ id, stock: newStock, message: "Stok berhasil diperbarui" });
  } catch (error) {
    console.error("❌ Error updating stock:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
