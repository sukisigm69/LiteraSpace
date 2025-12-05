    "use client";
    import { useState, useEffect } from "react";
    import { useSession } from "next-auth/react";
    import { useRouter } from "next/navigation";
    import { ArrowLeft, Save, User, Mail, Image as ImageIcon } from "lucide-react";

    export default function EditProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        image: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (session?.user) {
        setFormData({
            name: session.user.name || "",
            email: session.user.email || "",
            image: session.user.image || "https://i.pinimg.com/736x/ef/ed/b2/efedb22a7a6f6e4a18deb432228d137b.jpg",
        });
        }
    }, [session, status, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        const res = await fetch("/api/user/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Gagal memperbarui profil");

        const data = await res.json();

        // Update session agar user info terbaru langsung muncul
        await update({
            ...session,
            user: {
            ...session.user,
            name: data.user.username,
            email: data.user.email,
            image: data.user.profile_image,
            },
        });

        alert("✅ Profil berhasil diperbarui!");
        router.push("/profile");
        } catch (error) {
        console.error("Error:", error);
        alert("❌ Gagal memperbarui profil");
        } finally {
        setLoading(false);
        }
    };

    if (status === "loading") {
        return (
        <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
            Memuat halaman edit profil...
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-10 px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 relative">
            <button
            onClick={() => router.push("/profile")}
            className="absolute top-5 left-5 bg-white/80 p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition"
            >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>

            <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Edit Profil
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 mb-3 shadow-md">
                <img
                    src={formData.image}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                <ImageIcon className="w-4 h-4" />
                <span>URL Foto Profil</span>
                </div>
                <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Masukkan URL gambar..."
                className="mt-2 w-full sm:w-2/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <User className="w-4 h-4 text-blue-600" />
                Nama Lengkap
                </label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                />
            </div>

            <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <Mail className="w-4 h-4 text-blue-600" />
                Email
                </label>
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                />
            </div>

            <div className="pt-4">
                <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all font-medium ${
                    loading && "opacity-70 cursor-not-allowed"
                }`}
                >
                <Save className="w-5 h-5" />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
    }
