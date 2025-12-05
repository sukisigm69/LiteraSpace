"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function PetugasPage() {
  const { data: session, status } = useSession();
  const [borrowings, setBorrowings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch peminjaman aktif & history
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

  // Fetch notifikasi
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBorrowings();
    fetchNotifications();
  }, []);

  // Handle aksi Accept / Decline / Close
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/borrowings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Gagal update status");

      // Refresh data peminjaman & notifikasi
      fetchBorrowings();
      fetchNotifications();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui status peminjaman.");
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Memeriksa akses...
      </div>
    );
  }

  if (!session || !["petugas", "admin"].includes(session.user.role)) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </div>
    );
  }

  // History peminjaman
  const history = borrowings.filter((b) =>
    ["done", "returned", "declined"].includes(b.status)
  );

  // Peminjaman aktif
  const activeBorrowings = borrowings.filter((b) =>
    ["pending", "approved", "borrowed"].includes(b.status)
  );

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">📘 Dashboard Petugas</h1>
      <p className="mb-6">
        Selamat datang, <b>{session.user.name}</b>{" "}
        <span className="text-blue-600">({session.user.role})</span>
      </p>

      {/* Notifikasi */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🔔 Notifikasi</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">Tidak ada notifikasi</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {notifications.map((n) => (
              <li key={n.id}>{n.message}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabel Peminjaman Aktif */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
        <h2 className="text-xl font-bold p-4 border-b border-gray-200">Peminjaman Aktif</h2>
        <table className="w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">ID Buku</th>
              <th className="p-3 text-left">Judul</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activeBorrowings.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  Tidak ada peminjaman aktif.
                </td>
              </tr>
            ) : (
              activeBorrowings.map((b, idx) => (
                <tr key={b.borrowing_id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="p-3 border-t">{b.book_id}</td>
                  <td className="p-3 border-t">{b.title}</td>
                  <td className="p-3 border-t">{b.username}</td>
                  <td className="p-3 border-t capitalize">{b.status}</td>
                  <td className="p-3 border-t flex gap-2">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(b.borrowing_id, "approve")}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(b.borrowing_id, "decline")}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {b.status === "approved" || b.status === "borrowed" ? (
                      <button
                        onClick={() => handleAction(b.borrowing_id, "close")}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                      >
                        Close
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* History Peminjaman */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden p-4">
        <h2 className="text-xl font-bold mb-4">📖 History Peminjaman</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">Belum ada history peminjaman.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-2 text-left">ID Buku</th>
                <th className="p-2 text-left">Judul</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((b, idx) => (
                <tr key={b.borrowing_id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="p-2">{b.book_id}</td>
                  <td className="p-2">{b.title}</td>
                  <td className="p-2">{b.username}</td>
                  <td className="p-2 capitalize">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
