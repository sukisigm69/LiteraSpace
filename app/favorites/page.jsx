"use client";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Home,
  Library,
  Heart,
  Clock,
  ChevronRight,
  Bell,
  Trash2,
  BookMarked,
  TrendingUp,
  Star,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("favorites");

  const defaultProfileImage =
    "https://i.pinimg.com/736x/8a/2f/3b/8a2f3b6f0a3b2c8d1b5f6c3e4f1a2b3c.jpg";

  const menuItems = [
    { icon: Home, label: "Home", key: "home", link: "/home" },
    { icon: Library, label: "Collection", key: "library", link: "/koleksi" },
    { icon: Heart, label: "Favorites", key: "favorites", link: "/favorites" },
    { icon: Clock, label: "History", key: "history", link: "/history" },
  ];

  const getFallbackImage = (title = "") => {
    if (title.includes("Clean Code"))
      return "https://i.pinimg.com/736x/1b/35/0a/1b350a004666a6159610d0718cd1012b.jpg";
    if (title.includes("Pragmatic"))
      return "https://m.media-amazon.com/images/I/41as+WafrFL._SX377_.jpg";
    if (title.includes("JavaScript"))
      return "https://m.media-amazon.com/images/I/51gdVAEfPUL._SX379_.jpg";
    if (title.includes("Journal 3"))
      return "https://i.pinimg.com/1200x/34/d9/1a/34d91a03a5c8c8a683b53b7ffb1ae9b4.jpg";

    return "https://i.pinimg.com/736x/ae/cd/25/aecd250504c8812d912d742dd9156325.jpg";
  };

  useEffect(() => {
    if (!session?.user) return;
    async function loadFavorites() {
      try {
        const res = await fetch("/api/favorites", { cache: "no-store" });
        const data = await res.json();

        const formatted = data.map((item) => ({
          id: item.book_id,
          title: item.title,
          author: item.author,
          image: item.image || getFallbackImage(item.title),
        }));

        setFavoriteBooks(formatted);
        setFilteredBooks(formatted);
        setLoading(false);
      } catch (err) {
        console.error("FAILED LOAD FAVORITES:", err);
        setLoading(false);
      }
    }

    loadFavorites();
  }, [session]);

  useEffect(() => {
    let result = favoriteBooks;
    if (searchQuery) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredBooks(result);
  }, [searchQuery, favoriteBooks]);

  const handleRemoveFavorite = async (bookId) => {
    if (!confirm("Remove from favorites?")) return;

    await fetch("/api/favorites", {
      method: "DELETE",
      body: JSON.stringify({ bookId }),
    });

    setFavoriteBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleDetail = (id) => router.push(`/detailbuku/${id}`);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?"))
      await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-black">
        Loading favorites...
      </div>
    );
  }

  const user = session?.user || {
    name: "User",
    role: "member",
    image: defaultProfileImage,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white   transition-all duration-300 flex flex-col fixed h-full z-30`}
      >
        {/* LOGO */}
        <div className="p-6   flex items-center gap-3">
          <img
            src="/aset/logo3.png"
            alt="LiteraSpace Logo"
            className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
          />
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-black">LiteraSpace</h1>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.link)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-left ${
                activeMenu === item.key
                  ? "bg-blue-50 text-blue-600"
                  : "text-black hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-black">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* PROFILE */}
        <div className="p-4   mt-auto">
          <div
            className={`flex items-center gap-3 cursor-pointer ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <img
              src={user.image || defaultProfileImage}
              className="w-10 h-10 rounded-full "
            />
            {sidebarOpen && (
              <div>
                <p className="font-semibold text-black">
                  {user.name?.split(" ")[0]}
                </p>
                <p className="text-xs text-black capitalize">{user.role}</p>
              </div>
            )}
          </div>

          {/* LOGOUT */}
          {session?.user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-black hover:text-red-600 hover:bg-red-50 mt-4 w-full px-4 py-2 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && "Logout"}
            </button>
          )}
        </div>

        {/* TOGGLE SIDEBAR */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-white  p-1.5 rounded-full"
        >
          <ChevronRight
            className={`w-4 h-4 text-black transition-transform ${
              sidebarOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all overflow-y-auto`}
      >
        {/* HEADER */}
        <header className="bg-white   sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="relative w-full max-w-xl">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border"
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

        <div className="p-8 text-black">
          <h2 className="text-3xl font-bold mb-2 text-black">Favorite Books</h2>
          <p className="text-black mb-6">A collection of books you like</p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Favorites" value={favoriteBooks.length} icon={BookMarked} color="blue" />
            <StatCard title="Currently Borrowed" value={0} icon={TrendingUp} color="green" />
            <StatCard title="Returned" value={0} icon={Star} color="purple" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onRemove={handleRemoveFavorite}
                onDetail={handleDetail}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const bg = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl  shadow-sm text-black">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bg[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-black">{title}</p>
          <p className="text-2xl font-bold text-black">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book, onRemove, onDetail }) {
  return (
    <div className="bg-white  rounded-xl overflow-hidden shadow hover:shadow-lg transition text-black">
      <div className="relative h-56 bg-gray-100 cursor-pointer" onClick={() => onDetail(book.id)}>
        <img src={book.image} className="object-cover w-full h-full" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(book.id);
          }}
          className="absolute top-3 right-3 bg-white p-2 rounded-lg shadow"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg line-clamp-2 text-black">{book.title}</h3>
        <p className="text-sm text-black mb-3">by {book.author}</p>

        <button
          onClick={() => onDetail(book.id)}
          className="w-full block bg-blue-600 text-center text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Book Details
        </button>
      </div>
    </div>
  );
}
