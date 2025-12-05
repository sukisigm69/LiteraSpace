"use client";
import { useEffect, useState } from "react";

export default function BukuPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("/api/books", { cache: "no-store" })
      .then((res) => res.json())
      .then(setBooks);
  }, []);

  const handleBorrow = async (bookId) => {
    await fetch("/api/borrowings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    alert("Permintaan pinjam buku dikirim!");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 flex items-center gap-2">
        <span role="img" aria-label="book">📚</span> Daftar Buku yang Tersedia
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col"
          >
            <div className="h-56 w-full overflow-hidden">
              <img
                src={
                  book.image ||
                  "https://cdn-icons-png.flaticon.com/512/29/29302.png"
                }
                alt={book.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {book.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4">{book.author}</p>
              </div>

              <button
                onClick={() => handleBorrow(book.id)}
                className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-full"
              >
                Pinjam
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
