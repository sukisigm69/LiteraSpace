"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", author: "", image: "", stock: 1 });
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("books"); // 'books' atau 'users'
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

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

  // Ambil data user dengan filter
  const fetchUsers = async () => {
    try {
      let url = "/api/users";
      const params = new URLSearchParams();
      
      if (searchQuery) params.append("search", searchQuery);
      if (userRoleFilter) params.append("role", userRoleFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data user");
      
      const data = await res.json();
      
      // Normalize user data untuk kompatibilitas
      const normalizedUsers = data.users?.map((user) => ({
        ...user,
        id: String(user.id), // Konversi ID ke string
        name: user.username || user.name || "N/A",
        isBanned: user.isBanned !== undefined ? Boolean(user.isBanned) : false,
        isVerified: user.isVerified !== undefined ? Boolean(user.isVerified) : false,
        createdAt: user.createdAt || new Date().toISOString(),
      })) || [];
      
      setUsers(normalizedUsers);
    } catch (err) {
      console.error(err);
      setError("Tidak bisa memuat data user.");
    }
  };

  useEffect(() => {
    if (session?.user.role === "admin") {
      fetchBooks();
      fetchUsers();
    }
  }, [session]);

  // Re-fetch users ketika filter berubah
  useEffect(() => {
    if (session?.user.role === "admin" && activeTab === "users") {
      fetchUsers();
    }
  }, [searchQuery, userRoleFilter]);

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
      alert("Buku berhasil ditambahkan!");
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
      alert("Buku berhasil dihapus!");
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
      alert("Perubahan berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan");
    }
  };

  // Update stok buku
  const handleUpdateStock = async (id, change) => {
    try {
      const res = await fetch(`/api/books?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockChange: change }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui stok");
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui stok");
    }
  };

  // Hapus user
  const handleDeleteUser = async (id) => {
    if (!confirm("Yakin mau hapus user ini?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal hapus user");
      }
      fetchUsers();
      alert("User berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menghapus user");
    }
  };

  // Update role user (promote/demote)
  const handleUpdateUserRole = async (id, newRole) => {
    if (!confirm(`Yakin ingin mengubah role user menjadi ${newRole === 'petugas' ? 'petugas' : newRole}?`)) return;
    
    try {
      const res = await fetch(`/api/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal memperbarui role user");
      }
      
      fetchUsers();
      alert(`Role berhasil diubah menjadi ${newRole === 'petugas' ? 'petugas' : newRole}!`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal memperbarui role user");
    }
  };

  // Ban/unban user
  const handleToggleUserStatus = async (id, isCurrentlyBanned) => {
    const action = isCurrentlyBanned ? "membuka blokir" : "memblokir";
    if (!confirm(`Yakin ingin ${action} user ini?`)) return;
    
    try {
      const res = await fetch(`/api/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBanned: !isCurrentlyBanned }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal memperbarui status user");
      }
      
      fetchUsers();
      alert(`User berhasil ${action}!`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal memperbarui status user");
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setUserRoleFilter("");
  };

  if (status === "loading") return <div className="flex h-screen items-center justify-center text-gray-500">Memeriksa akses...</div>;
  if (!session || session.user.role !== "admin") return <div className="flex h-screen items-center justify-center text-gray-500">Tidak memiliki izin</div>;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">🔧 Dashboard Admin</h1>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("books")}
          className={`px-4 py-2 font-medium text-lg whitespace-nowrap ${activeTab === "books" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-500"}`}
        >
          📚 Manajemen Buku
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium text-lg whitespace-nowrap ${activeTab === "users" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-500"}`}
        >
          👥 Manajemen User
        </button>
      </div>

      {error && <p className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}

      {/* TAB: MANAJEMEN BUKU */}
      {activeTab === "books" && (
        <>
          {/* Form Tambah Buku */}
          <div className="bg-white shadow-md rounded-xl p-4 md:p-6 mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Tambah Buku Baru</h2>
            <div className="flex flex-wrap gap-3">
              <input 
                type="text" 
                placeholder="Judul Buku" 
                value={newBook.title} 
                onChange={e => setNewBook({ ...newBook, title: e.target.value })} 
                className="border p-2 rounded flex-1 min-w-[200px]"
              />
              <input 
                type="text" 
                placeholder="Penulis" 
                value={newBook.author} 
                onChange={e => setNewBook({ ...newBook, author: e.target.value })} 
                className="border p-2 rounded flex-1 min-w-[200px]"
              />
              <input 
                type="text" 
                placeholder="URL Gambar (Opsional)" 
                value={newBook.image} 
                onChange={e => setNewBook({ ...newBook, image: e.target.value })} 
                className="border p-2 rounded flex-1 min-w-[250px]"
              />
              <input 
                type="number" 
                placeholder="Stock" 
                min="1" 
                value={newBook.stock} 
                onChange={e => setNewBook({ ...newBook, stock: Math.max(1, parseInt(e.target.value) || 1) })} 
                className="border p-2 rounded w-24"
              />
              <button 
                onClick={handleAddBook} 
                disabled={loading} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Menambah..." : "Tambah Buku"}
              </button>
            </div>
          </div>

          {/* Tabel Buku */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
            <div className="p-4 bg-blue-600 text-white">
              <h2 className="text-lg md:text-xl font-semibold">Daftar Buku ({books.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
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
                        <td className="p-3 border-t text-sm">{book.id}</td>
                        <td className="p-3 border-t">
                          <img src={book.image || "/placeholder.png"} alt={book.title} className="w-16 h-20 object-cover rounded"/>
                        </td>
                        {editBook?.id === book.id ? (
                          <>
                            <td className="p-3 border-t">
                              <input 
                                value={editBook.title} 
                                onChange={e => setEditBook({ ...editBook, title: e.target.value })} 
                                className="border p-1 rounded w-full"
                              />
                            </td>
                            <td className="p-3 border-t">
                              <input 
                                value={editBook.author} 
                                onChange={e => setEditBook({ ...editBook, author: e.target.value })} 
                                className="border p-1 rounded w-full"
                              />
                            </td>
                            <td className="p-3 border-t">
                              <input 
                                type="number" 
                                min="1" 
                                value={editBook.stock} 
                                onChange={e => setEditBook({ ...editBook, stock: Math.max(1, parseInt(e.target.value) || 1) })} 
                                className="border p-1 rounded w-20"
                              />
                            </td>
                            <td className="p-3 border-t flex flex-wrap gap-2">
                              <button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Simpan</button>
                              <button onClick={() => setEditBook(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm">Batal</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 border-t">{book.title}</td>
                            <td className="p-3 border-t">{book.author}</td>
                            <td className="p-3 border-t font-medium text-green-700">
                              <div className="flex items-center gap-2">
                                <span>{book.stock ?? 0}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => handleUpdateStock(book.id, +1)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">+1</button>
                                  <button onClick={() => handleUpdateStock(book.id, -1)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">-1</button>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 border-t flex flex-wrap gap-2">
                              <button onClick={() => setEditBook(book)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">Edit</button>
                              <button onClick={() => handleDeleteBook(book.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Hapus</button>
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
        </>
      )}

      {/* TAB: MANAJEMEN USER */}
      {activeTab === "users" && (
        <>
          {/* Filter Users */}
          <div className="bg-white shadow-md rounded-xl p-4 md:p-6 mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Filter Users</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari User</label>
                <input 
                  type="text" 
                  placeholder="Cari nama atau email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Role</label>
                <select 
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Semua Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="petugas">Petugas</option>
                </select>
              </div>
              <button 
                onClick={handleResetFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Tabel Users */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold">Daftar User ({users.length})</h2>
              <button 
                onClick={fetchUsers}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
              >
                Refresh Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Username</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Bergabung</th>
                    <th className="p-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-gray-500">
                        {searchQuery || userRoleFilter ? "Tidak ada user yang sesuai dengan filter" : "Belum ada user."}
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="p-3 border-t font-mono text-xs truncate max-w-[100px]" title={String(user.id)}>
                          {String(user.id).substring(0, 8)}...
                        </td>
                        <td className="p-3 border-t font-medium truncate max-w-[150px]" title={user.name}>
                          {user.name}
                        </td>
                        <td className="p-3 border-t truncate max-w-[200px]" title={user.email}>
                          {user.email}
                        </td>
                        <td className="p-3 border-t">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" :
                            user.role === "petugas" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role === "petugas" ? "Petugas" : user.role || "User"}
                          </span>
                        </td>
                        <td className="p-3 border-t">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}>
                            {user.isBanned ? "Banned" : "Active"}
                            {user.isVerified && !user.isBanned && " ✓"}
                          </span>
                        </td>
                        <td className="p-3 border-t text-gray-600 text-sm">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-3 border-t">
                          <div className="flex flex-wrap gap-2">
                            {/* Ubah Role - tidak bisa ubah diri sendiri */}
                            {user.id !== session?.user?.id && (
                              <>
                                {user.role !== "admin" ? (
                                  <div className="flex flex-wrap gap-1">
                                    <button 
                                      onClick={() => handleUpdateUserRole(user.id, "admin")}
                                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs whitespace-nowrap"
                                      title="Promote to Admin"
                                    >
                                      Make Admin
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateUserRole(user.id, "petugas")}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs whitespace-nowrap"
                                      title="Make Petugas"
                                    >
                                      Make Petugas
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    <button 
                                      onClick={() => handleUpdateUserRole(user.id, "user")}
                                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs whitespace-nowrap"
                                      title="Demote to User"
                                    >
                                      Make User
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateUserRole(user.id, "petugas")}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs whitespace-nowrap"
                                      title="Make Petugas"
                                    >
                                      Make Petugas
                                    </button>
                                  </div>
                                )}
                                
                                {/* Ban/Unban */}
                                <button 
                                  onClick={() => handleToggleUserStatus(user.id, user.isBanned)}
                                  className={`${
                                    user.isBanned 
                                      ? "bg-green-500 hover:bg-green-600" 
                                      : "bg-red-500 hover:bg-red-600"
                                  } text-white px-3 py-1 rounded text-xs whitespace-nowrap`}
                                >
                                  {user.isBanned ? "Unban" : "Ban"}
                                </button>
                                
                                {/* Hapus User - tidak bisa hapus diri sendiri */}
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={user.id === session?.user?.id}
                                  className={`${
                                    user.id === session?.user?.id 
                                      ? "bg-gray-400 cursor-not-allowed" 
                                      : "bg-red-700 hover:bg-red-800"
                                  } text-white px-3 py-1 rounded text-xs whitespace-nowrap`}
                                  title={user.id === session?.user?.id ? "Tidak bisa menghapus akun sendiri" : "Hapus User"}
                                >
                                  Hapus
                                </button>
                              </>
                            )}
                            {user.id === session?.user?.id && (
                              <span className="text-xs text-gray-500 italic">(Akun Anda)</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Statistik User */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-wrap gap-4 md:gap-6">
                <div className="bg-white p-4 rounded-lg shadow flex-1 min-w-[150px]">
                  <div className="text-sm text-gray-500">Total Users</div>
                  <div className="text-2xl font-bold">{users.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex-1 min-w-[150px]">
                  <div className="text-sm text-gray-500">Admins</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {users.filter((u) => u.role === "admin").length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex-1 min-w-[150px]">
                  <div className="text-sm text-gray-500">Petugas</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter((u) => u.role === "petugas").length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex-1 min-w-[150px]">
                  <div className="text-sm text-gray-500">Active</div>
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter((u) => !u.isBanned).length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex-1 min-w-[150px]">
                  <div className="text-sm text-gray-500">Banned</div>
                  <div className="text-2xl font-bold text-red-600">
                    {users.filter((u) => u.isBanned).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}