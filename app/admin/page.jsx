"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", author: "", image: "", stock: 1 });
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Proteksi akses admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/login");
    }
  }, [session, status, router]);

  // Ambil data buku
  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data buku");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError("Tidak bisa memuat data buku.");
    }
  };

  useEffect(() => {
    if (session?.user.role === "admin") fetchBooks();
  }, [session]);

  // Tambah buku baru
  const handleAddBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim()) return alert("Judul & penulis harus diisi");

    setLoading(true);
    try {
      const payload = {
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        image: newBook.image.trim() || "/placeholder.png",
        stock: Math.max(1, Number(newBook.stock) || 1),
      };

      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menambah buku");

      setNewBook({ title: "", author: "", image: "", stock: 1 });
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menambah buku");
    } finally {
      setLoading(false);
    }
  };

  // Hapus buku
  const handleDeleteBook = async (id) => {
    if (!confirm("Yakin mau hapus buku ini?")) return;
    try {
      const res = await fetch(`/api/books?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus buku");
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus buku");
    }
  };

  // Simpan edit buku
  const handleSaveEdit = async () => {
    if (!editBook.title.trim() || !editBook.author.trim()) return alert("Judul & penulis harus diisi");

    try {
      const payload = { ...editBook, stock: Math.max(1, Number(editBook.stock) || 1) };
      const res = await fetch("/api/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan");
      setEditBook(null);
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan");
    }
  };

  // Update stok
  const handleUpdateStock = async (id, change) => {
    try {
      const res = await fetch(`/api/books?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockChange: change }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui stok");
      fetchBooks(); // refresh dari server
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui stok");
    }
  };

  if (status === "loading") return <div className="flex h-screen items-center justify-center text-gray-500">Memeriksa akses...</div>;
  if (!session || session.user.role !== "admin") return <div className="flex h-screen items-center justify-center text-gray-500">Tidak memiliki izin</div>;

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">📚 Manajemen Buku (Admin)</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form Tambah Buku */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Tambah Buku Baru</h2>
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Judul Buku" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} className="border p-2 rounded w-64"/>
          <input type="text" placeholder="Penulis" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} className="border p-2 rounded w-64"/>
          <input type="text" placeholder="URL Gambar (Opsional)" value={newBook.image} onChange={e => setNewBook({ ...newBook, image: e.target.value })} className="border p-2 rounded w-80"/>
          <input type="number" placeholder="Stock" min="1" value={newBook.stock} onChange={e => setNewBook({ ...newBook, stock: Math.max(1, parseInt(e.target.value) || 1) })} className="border p-2 rounded w-24"/>
          <button onClick={handleAddBook} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{loading ? "Menambah..." : "Tambah Buku"}</button>
        </div>
      </div>

      {/* Tabel Buku */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Gambar</th>
              <th className="p-3 text-left">Judul</th>
              <th className="p-3 text-left">Penulis</th>
              <th className="p-3 text-left">Stok</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-500">Belum ada buku.</td></tr>
            ) : (
              books.map((book, index) => (
                <tr key={book.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="p-3 border-t">{book.id}</td>
                  <td className="p-3 border-t"><img src={book.image || "/placeholder.png"} alt={book.title} className="w-16 h-20 object-cover rounded"/></td>
                  {editBook?.id === book.id ? (
                    <>
                      <td className="p-3 border-t"><input value={editBook.title} onChange={e => setEditBook({ ...editBook, title: e.target.value })} className="border p-1 rounded w-full"/></td>
                      <td className="p-3 border-t"><input value={editBook.author} onChange={e => setEditBook({ ...editBook, author: e.target.value })} className="border p-1 rounded w-full"/></td>
                      <td className="p-3 border-t"><input type="number" min="1" value={editBook.stock} onChange={e => setEditBook({ ...editBook, stock: Math.max(1, parseInt(e.target.value) || 1) })} className="border p-1 rounded w-20"/></td>
                      <td className="p-3 border-t flex gap-2">
                        <button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Simpan</button>
                        <button onClick={() => setEditBook(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded">Batal</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 border-t">{book.title}</td>
                      <td className="p-3 border-t">{book.author}</td>
                      <td className="p-3 border-t font-medium text-green-700">
                        {book.stock ?? 0}
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleUpdateStock(book.id, +1)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">+1</button>
                          <button onClick={() => handleUpdateStock(book.id, -1)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">-1</button>
                        </div>
                      </td>
                      <td className="p-3 border-t flex gap-2">
                        <button onClick={() => setEditBook(book)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">Edit</button>
                        <button onClick={() => handleDeleteBook(book.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Hapus</button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
