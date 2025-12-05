import Link from "next/link";
import { registerUser } from "../lib/actions";
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <form action={registerUser} className="w-full max-w-md">
                
                {/* Main card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <img
                                src="/aset/logo3.png"
                                alt="BookVerse Logo"
                                className="w-10 h-10 object-contain rounded-lg"
                            />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-1 text-center">
                            Create account
                        </h1>
                        <p className="text-slate-500 text-center">
                            Get started with your free account
                        </p>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    name="username" 
                                    placeholder="KarlTzy"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                </div>
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Create a strong password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password requirements */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-medium text-slate-600 mb-2">Password must contain:</p>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                <span>At least 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                <span>One uppercase & lowercase letter</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                <span>One number or special character</span>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:translate-y-[-2px] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            Create account
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-slate-500">or</span>
                        </div>
                    </div>

                    {/* Login link */}
                    <div className="text-center">
                        <p className="text-slate-600 text-sm">
                            Already have an account?{" "}
                            <Link 
                                href="./login"
                                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </div>
    )
}
