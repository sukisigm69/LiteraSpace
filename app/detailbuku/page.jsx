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
  Calendar,
  Clock,
} from "lucide-react";

export default function DetailBuku() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [book, setBook] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      const res = await fetch(`/api/books/${id}`);
      const data = await res.json();
      setBook(data);

      // cek jika buku ada di favorit
      const fav = await fetch("/api/favorites");
      if (fav.ok) {
        const favData = await fav.json();
        const isFav = favData.some((f) => f.book_id === data.id);
        setIsWishlisted(isFav);
      }

      setLoading(false);
    }

    fetchBook();
  }, [id]);

  const handleWishlist = async () => {
    if (!session) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    const method = isWishlisted ? "DELETE" : "POST";

    const res = await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id }),
    });

    if (res.ok) {
      setIsWishlisted(!isWishlisted);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Back Button */}
      <button
        className="flex items-center gap-2 mb-4 text-gray-600"
        onClick={() => router.back()}
      >
        <ArrowLeft /> Kembali
      </button>

      {/* Book Image */}
      <img
        src={book.image}
        alt={book.title}
        className="w-full rounded-xl mb-4"
      />

      {/* Title */}
      <h1 className="text-2xl font-bold">{book.title}</h1>

      <p className="text-gray-600">Author: {book.author}</p>

      {/* Stock */}
      <div className="mt-2 text-sm text-gray-700">
        Stok tersedia: {book.stock}
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-700 leading-relaxed">
        {book.description}
      </p>

      {/* Favorite Button */}
      <button
        onClick={handleWishlist}
        className={`w-full mt-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          isWishlisted
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`} />
        {isWishlisted ? "Tersimpan" : "Simpan"}
      </button>
    </div>
  );
}
