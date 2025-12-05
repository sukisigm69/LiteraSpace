  "use client";

  import { useState, useEffect } from "react";
  import { useSession, signOut } from "next-auth/react";
  import { useRouter } from "next/navigation";
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
    User,
    LogOut,
  } from "lucide-react";

  export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect jika belum login
    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/login");
      }
    }, [status, router]);

    const [searchQuery, setSearchQuery] = useState("");
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [availableBooks, setAvailableBooks] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState("home");

    const defaultImage =
      "https://i.pinimg.com/736x/ef/ed/b2/efedb22a7a6f6e4a18deb432228d137b.jpg";

    // Fetch featured books
    useEffect(() => {
      const fetchBooks = async () => {
        try {
          const res = await fetch("/api/books");
          if (!res.ok) throw new Error("Gagal mengambil data buku");
          const data = await res.json();

          const mappedBooks = data.map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            image: book.image || "/book-placeholder.jpg",
            category: book.category_name || "Umum",
            rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
          }));

          setFeaturedBooks(mappedBooks);
        } catch (error) {
          console.error("❌ Gagal fetch buku:", error);
        }
      };

      fetchBooks();
    }, []);

    // Fetch favorites and available books
    useEffect(() => {
      const fetchData = async () => {
        if (!session?.user) return;

        try {
          // Favorites
          const favRes = await fetch("/api/favorites");
          const favData = await favRes.json();
          setFavorites(favData);
          setFavoriteCount(favData.length);

          // Available books
          const availRes = await fetch("/api/books/available");
          const availData = await availRes.json();
          setAvailableBooks(availData.available);
        } catch (err) {
          console.error("❌ Fetch data gagal:", err);
        }
      };

      fetchData();
    }, [session]);

    const toggleFavorite = async (bookId) => {
      if (!session?.user) return;

      const isFavorite = favorites.some((f) => f.book_id === bookId);
      const method = isFavorite ? "DELETE" : "POST";

      await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      // Refresh favorites
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setFavorites(data);
      setFavoriteCount(data.length);
    };

    const handleDetail = (id) => router.push(`/detailbuku/${id}`);

    const menuItems = [
      { icon: Home, label: "Home", key: "home", link: "/home" },
      { icon: Library, label: "Collection", key: "library", link: "/koleksi" },
      { icon: Heart, label: "Favorite", key: "favorites", link: "/favorites" },
      { icon: Clock, label: "History", key: "history", link: "/history" },
    ];

    const stats = [
      { label: "Books That Can Be Borrowed", value: availableBooks, color: "text-blue-600" },
      { label: "Favorite", value: favoriteCount, color: "text-pink-600" },
    ];

    const handleLogout = async () => {
      const confirmLogout = confirm("Apakah kamu yakin ingin logout?");
      if (confirmLogout) await signOut({ callbackUrl: "/login" });
    };

    const user = session?.user || {
      name: "Pengguna",
      role: "member",
      image: defaultImage,
    };

    return (
      <div className="flex h-screen bg-gray-50">
        {/* SIDEBAR */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-30`}
        >
          {/* LOGO */}
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <img
              src="/aset/logo3.png"
              alt="LiteraSpace Logo"
              className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
            />
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">LiteraSpace</h1>}
          </div>

          {/* MENU */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => router.push(item.link)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-left ${
                  activeMenu === item.key ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* PROFILE */}
          <div className="p-4 border-t border-gray-200">
            {session?.user ? (
              <div
                onClick={() => router.push("/profile")}
                className={`flex items-center gap-3 cursor-pointer group ${
                  !sidebarOpen && "justify-center"
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-500">
                  <img
                    src={user.image || defaultImage}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
                      {user.name?.split(" ")[0]}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                <User className="w-4 h-4" />
                {sidebarOpen && <span>Login</span>}
              </a>
            )}
          </div>

          {/* LOGOUT */}
          {session?.user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all mx-4 mb-4 px-4 py-2 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          )}

          {/* TOGGLE SIDEBAR */}
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

        {/* MAIN CONTENT */}
        <main
          className={`flex-1 ${
            sidebarOpen ? "ml-64" : "ml-20"
          } transition-all duration-300 overflow-y-auto`}
        >
          {/* HEADER */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="px-8 py-4 flex items-center justify-between">
              <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari buku, penulis, atau topik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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

          {/* BODY */}
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {user.name?.split(" ")[0] || "Pengunjung"}! 👋
            </h2>
            <p className="text-gray-600 mb-8">Continue your book borrowing activities today</p>

            {/* STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* BUKU */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Available Books</h3>
                <button
                  onClick={() => router.push("/koleksi")}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  See All
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group relative"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-1 line-clamp-1">{book.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-800">{book.rating}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDetail(book.id)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                        >
                          See Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
