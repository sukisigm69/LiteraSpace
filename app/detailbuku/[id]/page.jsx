"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Star,
  Users,
  BookOpen,
  Heart,
  Bookmark,
  Calendar,
  Tag,
  Clock,
  Box,
} from "lucide-react";

export default function DetailBuku() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Proteksi login
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
  }, [session, status, router]);

  // Fetch detail buku
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;

      try {
        const res = await fetch(`/api/books/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setErrorMsg("Buku tidak ditemukan.");
          return;
        }

        const data = await res.json();
        setBook(data);
      } catch (err) {
        setErrorMsg("Gagal memuat data buku.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Cek favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!session || !id) return;

      const res = await fetch("/api/favorites", {
        cache: "no-store", // WAJIB biar realtime
      });

      if (!res.ok) return;

      const favs = await res.json();
      setIsFavorite(favs.some((item) => item.book_id == id));
    };

    checkFavorite();
  }, [session, id]);

  // Toggle favorites
  const handleFavorite = async () => {
    if (!session) {
      alert("Silakan login dulu.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id }),
      });

      if (!res.ok) {
        alert("Gagal memperbarui favorit.");
        return;
      }

      if (!isFavorite) {
        alert("Berhasil ditambahkan!");
        setIsFavorite(true);
      } else {
        alert("Dihapus dari favorit.");
        setIsFavorite(false);
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  // Borrow
  const handleBorrow = async () => {
    if (!session) {
      alert("Silakan login untuk meminjam buku.");
      router.push("/login");
      return;
    }

    if (book?.stock <= 0) {
      alert("Stok kosong.");
      return;
    }

    setIsBorrowing(true);

    try {
      const res = await fetch("/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id }),
      });

      if (res.ok) alert("Peminjaman berhasil!");
      else alert("Gagal meminjam.");
    } catch {
      alert("Terjadi kesalahan.");
    }

    setIsBorrowing(false);
  };

  // Loading
  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Memuat detail buku...
      </div>
    );
  }

  // Error
  if (errorMsg || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p>{errorMsg || "Buku tidak ditemukan."}</p>
        <button
          onClick={() => router.push("/koleksi")}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Kembali ke Koleksi
        </button>
      </div>
    );
  }

  // UI utama
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Gambar */}
        <div className="lg:w-1/2 relative">
          <img
            src={book.image || "/default-book.jpg"}
            alt={book.title}
            className="w-full h-[450px] object-cover"
          />

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            className={`absolute top-5 right-5 p-3 rounded-full shadow-lg transition ${
              isFavorite ? "bg-red-100 text-red-600" : "bg-white text-gray-600"
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-600" : ""}`} />
          </button>
        </div>

        {/* Info */}
        <div className="lg:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              {book.title}
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              oleh{" "}
              <span className="font-semibold text-blue-700">{book.author}</span>
            </p>

            <div className="flex items-center gap-6 mb-4 text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>{book.rating || "4.5"}</span>
              </div>

              <div className="flex items-center gap-1">
                <Users className="w-5 h-5" />
                <span>{book.readers || 0} pembaca</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{book.pages || 320} halaman</span>
              </div>
            </div>

            {/* DESKRIPSI TIDAK DIUBAH */}
            <p className="text-gray-700 leading-relaxed mb-6">
              {book.description ||
                `Buku ini memberikan wawasan mendalam tentang konsep dan filosofi yang dibahas oleh ${book.author}.`}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                {book.category || "Umum"}
              </span>

              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Terbit: {book.year || "Tidak diketahui"}
              </span>

              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Penerbit: {book.publisher || "Tidak diketahui"}
              </span>

              <span className="flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                Stok:{" "}
                <span
                  className={`font-semibold ${
                    book.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {book.stock > 0 ? book.stock : "Habis"}
                </span>
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleBorrow}
              disabled={isBorrowing}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                isBorrowing
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl"
              }`}
            >
              <Bookmark className="w-5 h-5" />
              {isBorrowing ? "Meminjam..." : "Pinjam Buku"}
            </button>

            <button
              onClick={() => router.push("/koleksi")}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all"
            >
              Kembali ke Koleksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
