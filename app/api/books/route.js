import { NextResponse } from "next/server";
import connection from "@/app/lib/database";

// fallback gambar
function getDefaultImage(title = "") {
  if (title.includes("Clean Code"))
    return "https://i.pinimg.com/736x/1b/35/0a/1b350a004666a6159610d0718cd1012b.jpg";
  if (title.includes("Pragmatic"))
    return "https://m.media-amazon.com/images/I/41as+WafrFL._SX377_.jpg";
  if (title.includes("JavaScript"))
    return "https://m.media-amazon.com/images/I/51gdVAEfPUL._SX379_.jpg";
  if (title.includes("Journal 3"))
    return "https://i.pinimg.com/1200x/34/d9/1a/34d91a03a5c8c8a683b53b7ffb1ae9b4.jpg";
  return "https://i.pinimg.com/736x/ae/cd/25/aecd250504c8812d912d742dd9156325.jpg";
}

export async function GET() {
  try {
    const [rows] = await connection.execute("SELECT * FROM books ORDER BY id DESC");
    const booksWithImages = rows.map(b => ({
      ...b,
      image: b.image && b.image.trim() !== "" ? b.image : getDefaultImage(b.title),
    }));
    return NextResponse.json(booksWithImages);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data buku." }, { status: 500 });
  }
}

// 🔹 Tambah buku
export async function POST(req) {
  try {
    const { title, author, image, stock } = await req.json();

    if (!title || !author)
      return NextResponse.json({ error: "Judul dan penulis harus diisi." }, { status: 400 });

    const finalImage = image && image.trim() !== "" ? image : getDefaultImage(title);

    await connection.execute(
      "INSERT INTO books (title, author, image, stock) VALUES (?, ?, ?, ?)",
      [title, author, finalImage, stock || 1]
    );

    return NextResponse.json({ message: "Buku berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Error POST:", err);
    return NextResponse.json({ error: "Gagal menambah buku." }, { status: 500 });
  }
}

// 🔹 Edit buku
export async function PUT(req) {
  try {
    const { id, title, author, image, stock } = await req.json();

    if (!id) return NextResponse.json({ error: "ID buku tidak ditemukan." }, { status: 400 });

    const finalImage = image && image.trim() !== "" ? image : getDefaultImage(title);

    await connection.execute(
      "UPDATE books SET title = ?, author = ?, image = ?, stock = ? WHERE id = ?",
      [title, author, finalImage, stock || 1, id]
    );

    return NextResponse.json({ message: "Buku berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Error PUT:", err);
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}

// 🔹 Hapus buku
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    await connection.execute("DELETE FROM books WHERE id = ?", [id]);
    return NextResponse.json({ message: "Buku berhasil dihapus." });
  } catch (err) {
    console.error("❌ Error DELETE:", err);
    return NextResponse.json({ error: "Gagal menghapus buku." }, { status: 500 });
  }
}

// 🔹 Tambah / Kurangi stok
export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { stockChange } = await req.json();

    if (!id)
      return NextResponse.json({ error: "ID tidak ditemukan." }, { status: 400 });

    // Ambil stok lama
    const [rows] = await connection.execute("SELECT stock FROM books WHERE id = ?", [id]);
    if (rows.length === 0)
      return NextResponse.json({ error: "Buku tidak ditemukan." }, { status: 404 });

    const newStock = Math.max(0, (rows[0].stock || 0) + Number(stockChange || 0));

    await connection.execute("UPDATE books SET stock = ? WHERE id = ?", [newStock, id]);

    // Ambil data buku lengkap dengan fallback gambar
    const [updatedRows] = await connection.execute("SELECT * FROM books WHERE id = ?", [id]);
    const book = updatedRows[0];
    book.image = book.image && book.image.trim() !== "" ? book.image : getDefaultImage(book.title);

    return NextResponse.json({
      message: "Stok berhasil diperbarui.",
      newStock,
      book,
    });
  } catch (err) {
    console.error("❌ Error PATCH:", err);
    return NextResponse.json({ error: "Gagal memperbarui stok." }, { status: 500 });
  }
}
