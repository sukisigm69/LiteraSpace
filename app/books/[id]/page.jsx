"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

export default function DetailBuku() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams(); // ambil id buku dari URL
  const { id } = params;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books`);
        const data = await res.json();
        const selected = data.find((b) => b.id == id);
        setBook(selected);
      } catch (err) {
        console.error("Gagal mengambil buku:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  const handleBorrow = async () => {
    if (!session) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    setIsBorrowing(true);
    try {
      const res = await fetch("/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id }),
      });

      if (res.ok) {
        alert("Permintaan peminjaman dikirim!");
      } else {
        alert("Gagal meminjam buku.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus buku ini?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/books?id=${id}`, { method: "DELETE" });

      if (res.ok) {
        alert("Buku berhasil dihapus.");
        router.push("/admin/books"); // arahkan kembali ke halaman dashboard
      } else {
        alert("Gagal menghapus buku.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Memuat buku...</p>;
  if (!book) return <p className="text-center mt-10">Buku tidak ditemukan.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10">
      <img
        src={book.image}
        alt={book.title}
        className="w-full h-72 object-cover rounded-xl mb-4"
      />
      <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
      <p className="text-gray-600 mb-6">Penulis: {book.author}</p>

      <div className="flex gap-3">
        <button
          onClick={handleBorrow}
          disabled={isBorrowing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isBorrowing ? "Meminjam..." : "Pinjam Buku"}
        </button>

        {session?.user?.role === "admin" && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Menghapus..." : "Hapus Buku"}
          </button>
        )}
      </div>
    </div>
  );
}
