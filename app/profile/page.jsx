"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  Edit2,
  BookOpen,
  ArrowLeft,
  Home,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Memuat profil...
      </div>
    );
  }

  const user = session?.user || {
    name: "Pengguna",
    email: "Tidak diketahui",
    role: "member",
    joined: "2025-01-01",
  };

  const defaultImage =
    "https://i.pinimg.com/736x/ef/ed/b2/efedb22a7a6f6e4a18deb432228d137b.jpg";

  const handleLogout = async () => {
    const confirmLogout = confirm("Apakah kamu yakin ingin keluar?");
    if (confirmLogout) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        {/* 🔙 Tombol Kembali */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-5 left-5 bg-white/80 backdrop-blur-sm p-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* 🔵 HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-40 relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
              <img
                src={user.image || defaultImage}
                alt="Foto Profil"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 📄 BODY */}
        <div className="pt-20 pb-10 px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500 flex justify-center items-center gap-2 mt-1">
            <Mail className="w-4 h-4 text-gray-400" /> {user.email}
          </p>

          {/* 📊 INFO GRID */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Peran</p>
                <p className="font-bold capitalize text-red-500">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Bergabung Sejak</p>
                <p className="font-semibold text-blue-600">
                  {user.joined || "12 Januari 2025"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl sm:col-span-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Buku Dipinjam</p>
                <p className="font-semibold text-blue-600">15 Buku</p>
              </div>
            </div>
          </div>

          {/* 🔘 BUTTONS */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/edit-profile")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              <Edit2 className="w-4 h-4" /> Edit Profil
            </button>

            <button
              onClick={() => router.push("/home")}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              <Home className="w-4 h-4" /> Beranda
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
