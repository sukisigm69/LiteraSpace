    "use client";
    import { useState, useEffect } from "react";
    import { useSession, signOut } from "next-auth/react";
    import {
    BookOpen,
    Search,
    TrendingUp,
    Users,
    Award,
    ChevronRight,
    Star,
    Heart,
    } from "lucide-react";

    export default function LandingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: session, status } = useSession();
    const [featuredBooks, setFeaturedBooks] = useState([]);

    // 🔹 Ambil data buku dari database
    useEffect(() => {
        const fetchBooks = async () => {
        try {
            const res = await fetch("/api/books");
            const data = await res.json();
            setFeaturedBooks(data.slice(0, 3));
        } catch (error) {
            console.error("Gagal mengambil data buku:", error);
        }
        };
        fetchBooks();
    }, []);

    const stats = [
        { icon: BookOpen, label: "Total Buku", value: "10,000+" },
        { icon: Users, label: "Anggota Aktif", value: "5,000+" },
        { icon: TrendingUp, label: "Buku Dipinjam", value: "25,000+" },
        { icon: Award, label: "Rating Rata-rata", value: "4.8/5" },
    ];

    const categories = [
        { name: "Fiksi", count: "2,500+", color: "from-purple-500 to-pink-500" },
        { name: "Non-Fiksi", count: "1,800+", color: "from-blue-500 to-cyan-500" },
        { name: "Sains", count: "1,200+", color: "from-green-500 to-emerald-500" },
        { name: "Sejarah", count: "950+", color: "from-orange-500 to-red-500" },
    ];

    // 🔹 Fungsi Logout dengan konfirmasi
    const handleLogout = async () => {
        const confirmLogout = confirm("Apakah kamu yakin ingin logout?");
        if (confirmLogout) {
        await signOut({ callbackUrl: "/login" });
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container mx-auto flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-2">
<div className="flex items-center gap-3">
  <img
    src="/aset/logo3.png"
    alt="BookVerse Logo"
    className="w-10 h-10 object-contain rounded-lg"
  />
  <h1 className="text-2xl font-bold text-gray-800">
    LiteraSpace
  </h1>
</div>
            </div>


            <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-blue-600 font-semibold">
                Beranda 
                </a>
                <a
                href="/koleksi"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                Koleksi
                </a>
                <a
                href="/tentang"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                Tentang
                </a>
            </nav>

            {status === "loading" ? (
                <div className="text-gray-500 animate-pulse">Memeriksa login...</div>
            ) : session ? (
                <div className="flex items-center gap-4">
                <a
                    href="/profile"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                    Halo, {session.user.name?.split(" ")[0] || "User"}
                </a>
                <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                    Logout
                </button>
                </div>
            ) : (
                <a
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                Masuk
                </a>
            )}
            </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 text-center">
            <div className="container mx-auto max-w-4xl">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                ✨ Platform Perpustakaan Digital Terbaik
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Jelajahi Dunia{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Pengetahuan
                </span>
                <br />
                Tanpa Batas
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Akses ribuan buku digital, jurnal, dan referensi akademik kapan saja, di mana saja. Mulai petualangan literasimu sekarang!
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Cari buku, penulis, atau topik..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg shadow-lg"
                />
                <button
                    onClick={() => {
                    if (!session) {
                        alert("Silakan login terlebih dahulu untuk mencari buku.");
                        window.location.href = "/login";
                        return;
                    }
                    window.location.href = `/koleksi?search=${searchQuery}`;
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                    Cari
                </button>
                </div>
            </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-6">
            <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div
                key={i}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-3xl font-bold text-gray-800 mb-1">
                    {stat.value}
                </h4>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
            ))}
            </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-6">
            <div className="container mx-auto">
            <div className="text-center mb-12">
                <h3 className="text-4xl font-bold mb-4">Jelajahi Kategori</h3>
                <p className="text-gray-600 text-lg">
                Temukan buku berdasarkan minat dan kebutuhanmu
                </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
                {categories.map((category, i) => (
                <div
                    key={i}
                    onClick={() =>
                    (window.location.href = `/koleksi?category=${category.name}`)
                    }
                    className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                >
                    <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                    ></div>
                    <div className="relative">
                    <h4 className="text-2xl font-bold mb-2">{category.name}</h4>
                    <p className="text-gray-600 mb-4">{category.count} Buku</p>
                    <ChevronRight className="w-6 h-6 text-blue-600 group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
                ))}
            </div>
            </div>
        </section>

        {/* Koleksi Unggulan */}
        <section className="py-16 px-6 bg-white">
            <div className="container mx-auto">
            <div className="flex justify-between items-center mb-12">
                <div>
                <h3 className="text-4xl font-bold mb-2">Koleksi Unggulan</h3>
                <p className="text-gray-600 text-lg">
                    Buku-buku terpopuler minggu ini
                </p>
                </div>
                <a
                href="/koleksi"
                className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
                >
                Lihat Semua <ChevronRight className="w-5 h-5" />
                </a>
            </div>

            {featuredBooks.length === 0 ? (
                <p className="text-center text-gray-500">
                Memuat koleksi unggulan...
                </p>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                {featuredBooks.map((book, i) => (
                    <div
                    key={i}
                    className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden"
                    >
                    <div className="h-64 relative overflow-hidden">
                        <img
                        src={book.image || "/placeholder-book.jpg"}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                        {book.category || "Umum"}
                        </div>
                        <button className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition">
                        <Heart className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                    <div className="p-6">
                        <h4 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition">
                        {book.title}
                        </h4>
                        <p className="text-gray-600 mb-4">oleh {book.author}</p>
                        <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold text-gray-800">
                            {book.rating || "4.5"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <Users className="w-4 h-4" />
                            <span>{book.readers || "1.2k"}</span>
                        </div>
                        </div>
                        <button
                        onClick={() => {
                            if (!session) {
                            alert(
                                "Silakan login terlebih dahulu untuk melihat detail buku."
                            );
                            window.location.href = "/login";
                            return;
                            }
                            window.location.href = `/detailbuku/${book.id}`;

                        }}
                        className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                        >
                        Lihat Detail
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-6">
            <div className="container mx-auto text-center text-gray-400 border-t border-gray-800 pt-8">
            © {new Date().getFullYear()} LiteraSpace     - Perpustakaan Digital
            </div>
        </footer>
        </main>
    );
    }
