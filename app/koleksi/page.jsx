"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  BookOpen,
  Search,
  Home,
  Library,
  Heart,
  Clock,
  Star,
  ChevronRight,
  Bell,
  Grid,
  List,
  Users,
  Award,
  User,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function KoleksiBuku() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("library");
  const router = useRouter();

  const defaultImage =
    "https://i.pinimg.com/736x/ef/ed/b2/efedb22a7a6f6e4a18deb432228d137b.jpg";

  const menuItems = [
    { icon: Home, label: "Home", key: "home", link: "/home" },
    { icon: Library, label: "Collection", key: "library", link: "/koleksi" },
    { icon: Heart, label: "Favorite", key: "favorites", link: "/favorites" },
    { icon: Clock, label: "History", key: "history", link: "/history" },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // 🔹 Ambil data buku
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        const formatted = data.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author || "Tidak diketahui",
          image:
            b.image ||
            "https://i.pinimg.com/736x/ae/cd/25/aecd250504c8812d912d742dd9156325.jpg",
          category: b.category_name || "Umum",
          readers: b.readers || 0,
          rating: b.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          year: b.year_published || "2024",
          isBestseller: b.stock > 3,
        }));

        setBooks(formatted);
      } catch (error) {
        console.error("Gagal memuat buku:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetail = (id) => router.push(`/detailbuku/${id}`);

  const handleLogout = async () => {
    const confirmLogout = confirm("Apakah kamu yakin ingin keluar?");
    if (confirmLogout) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-500">
        Memuat koleksi buku...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-30`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="/aset/logo3.png"
              alt="LiteraSpace Logo"
              className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
            />
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-gray-800">LiteraSpace</h1>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveMenu(item.key);
                router.push(item.link);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                activeMenu === item.key
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Profil Pengguna */}
        <div className="p-4 border-t border-gray-200">
          {status === "loading" ? (
            <div className="text-gray-500 text-sm text-center">
              Memuat akun...
            </div>
          ) : session?.user ? (
            <div
              onClick={() => router.push("/profile")}
              className={`flex items-center gap-3 cursor-pointer group ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                <img
                  src={session.user.image || defaultImage}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {session.user.role || "Member"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all w-full"
            >
              <User className="w-4 h-4" />
              {sidebarOpen && <span>Login</span>}
            </button>
          )}
        </div>

        {/* Logout */}
        {session?.user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all mx-4 mb-4 px-4 py-2 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        )}

        {/* Tombol toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-all"
        >
          <ChevronRight
            className={`w-4 h-4 text-gray-600 transition-transform ${
              sidebarOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>

      {/* Konten Utama */}
      <main
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300 overflow-y-auto`}
      >
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari buku, penulis, atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
             <button
  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all ml-6"
  onClick={() => router.push("/notifications")}
>
  <Bell className="w-5 h-5" />
  {/* Badge merah */}
  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
</button>
          </div>
        </header>

        {/* Daftar Buku */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Digital Colllection Book
          </h2>
          <p className="text-gray-600 mb-6">
            Explore The {books.length} available books
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
            <span className="text-gray-600 font-medium">
              {filteredBooks.length} Books Were Found
            </span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-white shadow" : "hover:bg-gray-200"
                }`}
              >
                <Grid className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-white shadow" : "hover:bg-gray-200"
                }`}
              >
                <List className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Grid dan List mode */}
          {viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleDetail(book.id)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {book.isBestseller && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Bestseller
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1 hover:text-blue-600 transition">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        By {book.author}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{book.rating}</span>
                      </div>
                      <button className="text-blue-600 font-semibold hover:underline">
                        See Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleDetail(book.id)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-4"
                >
                  <div className="w-full sm:w-32 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        By {book.author}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        {book.category} • {book.year}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{book.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{book.readers} pembaca</span>
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
