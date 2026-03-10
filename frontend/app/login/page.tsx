"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // When user lands on login page, force logout
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      sessionStorage.removeItem("token");
      // Also clear cookie (session cookie will be cleared on close)
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const token = response?.data?.data?.token;
      const role = response?.data?.data?.user?.role;

      if (!token) {
        throw new Error("Token not received");
      }

      // Store token in sessionStorage (no persistent auto-login)
      sessionStorage.setItem("token", token);

      // Set session cookie (no max-age) so middleware can read it during the session
      document.cookie = `token=${token}; path=/;`;

      // Redirect based on role
      if (role === "VENDOR") {
        router.push("/admin/vendors/dashboard");
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "CUSTOMER") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }

      // Clear the redirect after login storage
      sessionStorage.removeItem('redirectAfterLogin');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
        <p className="text-gray-500">Checking login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-linear-to-r from-indigo-600 to-purple-600
                     hover:from-indigo-700 hover:to-purple-700
                     text-white text-sm font-bold transition shadow-lg"
        >
          <span className="text-lg">←</span>
          Back to Home
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Login to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:bg-gray-100"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 border rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:bg-gray-100"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white
                     bg-blue-600 hover:bg-blue-700
                     transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
