"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";

export default function VendorLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            return setError("Please enter email and password.");
        }
        try {
            setLoading(true);
            setError("");
            const res = await api.post("/auth/login", { email: form.email, password: form.password });
            const token = res.data?.data?.token;
            const role = res.data?.data?.user?.role;

            if (role !== "VENDOR") {
                return setError("This login is for vendors only.");
            }

            sessionStorage.setItem("token", token);
            localStorage.setItem("token", token);
            router.push("/vendor/dashboard");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white text-2xl font-black">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
                    <p className="text-gray-500 mt-1 text-sm">Sign in to view your assigned orders</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm font-medium flex items-center gap-2">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In to Vendor Portal"}
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Not a vendor?{" "}
                        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                            Customer login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
