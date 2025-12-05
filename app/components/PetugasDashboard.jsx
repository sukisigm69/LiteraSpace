"use client";

import { useState, useEffect } from "react";

export default function PetugasDashboard({ session }) {
  const [borrowings, setBorrowings] = useState([]);

  // Ambil data peminjaman
  const fetchBorrowings = async () => {
    try {
      const res = await fetch("/api/borrowings", { cache: "no-store" });
      const data = await res.json();
      setBorrowings(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data peminjaman.");
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  async function updateBorrowing(id, action) {
    try {
      const res = await fetch(`/api/borrowings/update?action=${action}&id=${id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Gagal mengupdate status");
      fetchBorrowings();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat update status.");
    }
  }

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">📘 Dashboard Petugas</h1>
      <p className="mb-6">
        Selamat datang, <b>{session.user.name}</b>
        <span className="text-blue-600"> ({session.user.role})</span>
      </p>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">ID Buku</th>
              <th className="p-3 text-left">Judul</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {borrowings.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Belum ada peminjaman.
                </td>
              </tr>
            ) : (
              borrowings.map((item, index) => (
                <tr key={item.borrowing_id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="p-3 border-t">{item.book_id}</td>
                  <td className="p-3 border-t">{item.title}</td>
                  <td className="p-3 border-t">{item.username}</td>
                  <td className="p-3 border-t capitalize">{item.status}</td>
                  <td className="p-3 border-t">{item.borrow_date || "-"}</td>
                  <td className="p-3 border-t">
                    {item.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBorrowing(item.borrowing_id, "accept")}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBorrowing(item.borrowing_id, "decline")}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {item.status === "approved" && (
                      <button
                        onClick={() => updateBorrowing(item.borrowing_id, "close")}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
