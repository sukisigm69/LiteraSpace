import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import LogoutButton from "../components/LogoutButton"
import { User, Mail, Shield, Clock, Edit2, Camera } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  console.log(session)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 p-2 rounded-lg transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-4xl">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-lg border border-slate-200 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {user?.name || "User Name"}
                  </h2>
                  <p className="text-slate-600 mt-1">Member</p>
                </div>
              </div>

              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Personal Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Full Name</p>
                    <p className="text-base font-medium text-slate-900">
                      {user?.name || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Email Address</p>
                    <p className="text-base font-medium text-slate-900">
                      {user?.email || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Username</p>
                    <p className="text-base font-medium text-slate-900">
                      @{user?.name?.toLowerCase().replace(/\s+/g, "") || "username"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">About</h3>
              <p className="text-slate-600 leading-relaxed">
                Welcome to your profile! This is where you can view and manage
                your personal information. Keep your details up to date to
                ensure the best experience.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Account Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Member Since</span>
                  <span className="text-sm font-medium text-slate-900">
                    Oct 2024
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Plan</span>
                  <span className="text-sm font-medium text-slate-900">
                    Free
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Security</h3>

              <div className="space-y-3">
                <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors text-left flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  Change Password
                </button>

                <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors text-left flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  Login History
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">Upgrade to Pro</h4>
              <p className="text-sm text-blue-100 mb-4">
                Get access to premium features and unlock your full potential
              </p>
              <button className="w-full bg-white text-blue-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                View Plans
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
