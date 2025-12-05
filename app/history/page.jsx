"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Home,
  Library,
  Heart,
  Clock,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const profileDefaultImage =
    "https://i.pinimg.com/736x/ef/ed/b2/efedb22a7a6f6e4a18deb432228d137b.jpg";
  const bookDefaultImage =
    "https://i.pinimg.com/736x/ae/cd/25/aecd250504c8812d912d742dd9156325.jpg";

  const getBookImage = (title) => {
    if (!title) return bookDefaultImage;
    if (title.includes("Clean Code"))
      return "https://i.pinimg.com/736x/1b/35/0a/1b350a004666a6159610d0718cd1012b.jpg";
    if (title.includes("Pragmatic"))
      return "https://m.media-amazon.com/images/I/41as+WafrFL._SX377_.jpg";
    if (title.includes("JavaScript"))
      return "https://m.media-amazon.com/images/I/51gdVAEfPUL._SX379_.jpg";
    if (title.includes("Journal 3"))
      return "https://i.pinimg.com/1200x/34/d9/1a/34d91a03a5c8c8a683b53b7ffb1ae9b4.jpg";
    return bookDefaultImage;
  };

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchHistory() {
      try {
        const res = await fetch(`/api/history?userId=${session.user.id}`);
        const data = await res.json();

        const formatted = data.map((item) => ({
          ...item,
          image:
            item.image && item.image.trim() !== ""
              ? item.image
              : getBookImage(item.title),
        }));

        setHistory(formatted);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [session]);

  const statusBadge = (status) => {
    const s = status?.toLowerCase();
    let color = "bg-gray-300 text-gray-700";

    if (s === "pending") color = "bg-yellow-200 text-yellow-700";
    if (s === "approved") color = "bg-blue-200 text-blue-700";
    if (s === "borrowed") color = "bg-green-200 text-green-700";
    if (s === "returned") color = "bg-gray-200 text-gray-600";
    if (s === "declined") color = "bg-red-200 text-red-700";
    if (s === "done") color = "bg-indigo-200 text-indigo-700";

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
        {status}
      </span>
    );
  };

  const menuItems = [
    { icon: Home, label: "Home", key: "home", link: "/home" },
    { icon: Library, label: "Collection", key: "library", link: "/koleksi" },
    { icon: Heart, label: "Favorite", key: "favorites", link: "/favorites" },
    { icon: Clock, label: "History", key: "history", link: "/history" },
  ];

  const user = session?.user || {
    name: "User",
    role: "Member",
    image: profileDefaultImage,
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Checking session...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 fixed h-full z-30 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <img
            src="/aset/logo3.png"
            className="w-10 h-10 object-contain rounded-lg"
          />
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">LiteraSpace</h1>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.link)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-left ${
                item.key === "history"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div
            onClick={() => router.push("/profile")}
            className={`flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
              <img
                src={user.image || profileDefaultImage}
                className="w-full h-full object-cover"
              />
            </div>

            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user.name?.split(" ")[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all mx-4 mb-4 px-4 py-2 rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span>Logout</span>}
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-all"
        >
          <ChevronRight
            className={`w-4 h-4 text-gray-600 ${
              sidebarOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300 p-8 overflow-y-auto`}
      >
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
          <Clock size={26} /> Borrowing History
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading data...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-600">No activity history yet.</p>
        ) : (
          <div className="space-y-4 pb-10">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    onError={(e) => (e.target.src = bookDefaultImage)}
                    className="w-14 h-20 object-cover rounded-lg shadow"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.author}</p>

                    <div className="mt-2">{statusBadge(item.status)}</div>

                    <p className="text-sm mt-1 text-gray-700">
                      <span className="font-medium">{item.action}</span> —{" "}
                      {item.date} {item.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
