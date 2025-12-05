"use client";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Home,
  Library,
  Users,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Activity,
  BarChart3,
  PieChart,
  ShoppingCart,
} from "lucide-react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [timeRange, setTimeRange] = useState("7days");

  // Mock admin session
  const admin = { name: "Admin BookVerse", role: "Super Admin" };

  const menuItems = [
    { icon: Home, label: "Dashboard", key: "dashboard", link: "/admin" },
    { icon: Library, label: "Kelola Buku", key: "books", link: "/admin/books" },
    { icon: Users, label: "Kelola User", key: "users", link: "/admin/users" },
    { icon: BarChart3, label: "Laporan", key: "reports", link: "/admin/reports" },
    { icon: Settings, label: "Pengaturan", key: "settings", link: "/admin/settings" },
  ];

  // Mock stats data
  const stats = [
    {
      label: "Total Buku",
      value: "10,245",
      change: "+12.5%",
      trend: "up",
      icon: BookOpen,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Total User",
      value: "5,432",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Buku Dipinjam",
      value: "25,678",
      change: "+15.3%",
      trend: "up",
      icon: Activity,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Rating Rata-rata",
      value: "4.8",
      change: "-0.2",
      trend: "down",
      icon: Star,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      user: "Ahmad Rizki",
      action: "Meminjam buku",
      book: "The Art of Clean Code",
      time: "5 menit lalu",
      type: "borrow",
    },
    {
      id: 2,
      user: "Siti Nurhaliza",
      action: "Mengembalikan buku",
      book: "Design Thinking",
      time: "15 menit lalu",
      type: "return",
    },
    {
      id: 3,
      user: "Budi Santoso",
      action: "Mendaftar sebagai member",
      time: "1 jam lalu",
      type: "register",
    },
    {
      id: 4,
      user: "Dewi Lestari",
      action: "Memberikan rating",
      book: "Sapiens",
      rating: 5,
      time: "2 jam lalu",
      type: "rating",
    },
    {
      id: 5,
      user: "Andi Wijaya",
      action: "Meminjam buku",
      book: "Atomic Habits",
      time: "3 jam lalu",
      type: "borrow",
    },
  ];

  // Popular books
  const popularBooks = [
    {
      id: 1,
      title: "Atomic Habits",
      author: "James Clear",
      borrowed: 342,
      rating: 4.9,
    },
    {
      id: 2,
      title: "The Psychology of Money",
      author: "Morgan Housel",
      borrowed: 298,
      rating: 4.8,
    },
    {
      id: 3,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      borrowed: 276,
      rating: 4.9,
    },
    {
      id: 4,
      title: "Design Thinking",
      author: "Tim Brown",
      borrowed: 234,
      rating: 4.7,
    },
    {
      id: 5,
      title: "The Art of Clean Code",
      author: "Robert C. Martin",
      borrowed: 198,
      rating: 4.8,
    },
  ];

  // Alerts
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "15 buku akan jatuh tempo dalam 3 hari",
      time: "Hari ini",
    },
    {
      id: 2,
      type: "info",
      message: "5 user baru mendaftar hari ini",
      time: "Hari ini",
    },
    {
      id: 3,
      type: "success",
      message: "Backup database berhasil dilakukan",
      time: "Kemarin",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "borrow":
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case "return":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "register":
        return <User className="w-4 h-4 text-purple-600" />;
      case "rating":
        return <Star className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "info":
        return <Bell className="w-5 h-5 text-blue-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">BookVerse</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.key}
              href={item.link}
              onClick={() => setActiveMenu(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeMenu === item.key
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {admin.name}
                </p>
                <p className="text-xs text-gray-500">{admin.role}</p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <div className="mt-3 flex gap-2">
              <button className="flex-1 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <Settings className="w-4 h-4 mx-auto" />
              </button>
              <button className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <LogOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
          )}
        </div>

        {/* Toggle Button */}
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

      {/* Main Content */}
      <main
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300 overflow-y-auto`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-sm text-gray-600">Selamat datang kembali, Admin!</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Time Range Filter */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Hari Ini</option>
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="30days">30 Hari Terakhir</option>
                  <option value="year">Tahun Ini</option>
                </select>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>

                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                      stat.trend === "up"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-8 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${getAlertColor(
                    alert.type
                  )}`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{alert.time}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    Aktivitas Terbaru
                  </h3>
                  <a
                    href="/admin/activities"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Lihat Semua
                  </a>
                </div>

                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="font-semibold">{activity.user}</span>{" "}
                          {activity.action.toLowerCase()}
                        </p>
                        {activity.book && (
                          <p className="text-sm text-gray-600 truncate">
                            {activity.book}
                          </p>
                        )}
                        {activity.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(activity.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 text-amber-400 fill-amber-400"
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Books */}
            <div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    Buku Populer
                  </h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {popularBooks.map((book, index) => (
                    <div
                      key={book.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-blue-600 text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {book.author}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {book.borrowed}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-gray-600">
                              {book.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Tambah Buku</p>
                <p className="text-xs text-gray-600">Buku baru</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Kelola User</p>
                <p className="text-xs text-gray-600">Semua user</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Lihat Laporan</p>
                <p className="text-xs text-gray-600">Statistik</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Pengaturan</p>
                <p className="text-xs text-gray-600">Sistem</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}