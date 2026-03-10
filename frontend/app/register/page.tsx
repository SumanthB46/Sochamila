"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const isPasswordValid =
    Object.values(passwordRules).every(Boolean);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name.trim()) {
      return setError("Please enter your full name.");
    }

    if (!form.email.trim()) {
      return setError("Please enter your email address.");
    }

    if (!isPasswordValid) {
      return setError("Password does not meet required rules.");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      setError("");

      const resp = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "CUSTOMER",
      });

      const token = resp?.data?.data?.token;
      if (!token) {
        setError("Registration succeeded but no token received. Please login.");
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      // store token in session for the session and set cookie for server-side reads
      sessionStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/;`;

      // redirect to customer dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh relative bg-linear-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8 overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-52 h-52 bg-linear-to-br from-indigo-200 to-purple-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-52 h-52 bg-linear-to-br from-pink-200 to-indigo-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

      {/* HOME BUTTON */}
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md mb-3 xs:mb-4 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold transition duration-300 shadow-lg hover:shadow-xl">
          <span className="text-lg">←</span> <span className="">Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md bg-white/90 backdrop-blur-xl rounded-2xl xs:rounded-2xl sm:rounded-3xl shadow-2xl p-4 xs:p-5 sm:p-7 border border-white/50 relative z-10">

        <div className="mb-4 text-center">
          <div className="inline-block bg-linear-to-r from-indigo-600 to-purple-600 rounded-full p-2 mb-2">
            <span className="text-xl"></span>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 mb-1">
            Create your account
          </h1>
        </div>

        <p className="text-xs xs:text-xs sm:text-sm text-center text-gray-600 mb-4 xs:mb-5 font-medium">
          Join Sochamila and start designing custom products
        </p>

        {error && (
          <div className="bg-linear-to-r from-red-50 to-pink-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs flex items-start gap-2 animate-pulse shadow-sm">
            <span className="text-lg mt-0 shrink-0">⚠️</span>
            <span className="font-medium text-xs">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg mb-3 text-xs flex items-start gap-2 animate-pulse shadow-sm">
            <span className="text-lg mt-0 shrink-0">✓</span>
            <span className="font-medium text-xs">Registration successful! Redirecting to login...</span>
          </div>
        )}

        <div className="space-y-2 xs:space-y-2.5 sm:space-y-3">

          <input
            name="name"
            placeholder="Full Name"
            onChange={onChange}
            value={form.name}
            disabled={loading || success}
            className="w-full input-light py-2 xs:py-2 sm:py-2.5 px-3 text-xs xs:text-xs sm:text-sm rounded-lg xs:rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={onChange}
            value={form.email}
            disabled={loading || success}
            className="w-full input-light py-2 xs:py-2 sm:py-2.5 px-3 text-xs xs:text-xs sm:text-sm rounded-lg xs:rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={onChange}
            value={form.password}
            disabled={loading || success}
            className="w-full input-light py-2 xs:py-2 sm:py-2.5 px-3 text-xs xs:text-xs sm:text-sm rounded-lg xs:rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={onChange}
            value={form.confirmPassword}
            disabled={loading || success}
            className="w-full input-light py-2 xs:py-2 sm:py-2.5 px-3 text-xs xs:text-xs sm:text-sm rounded-lg xs:rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />

          {/* PASSWORD RULES UI */}
          <div className="bg-linear-to-br from-gray-50 to-indigo-50 rounded-lg xs:rounded-lg p-2.5 xs:p-3 sm:p-4 space-y-1.5 xs:space-y-1.5 border border-gray-200/50">
            <p className="text-xs xs:text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
              <span className="text-sm">🔐</span> Password Rules:
            </p>
            <p className={`text-xs flex items-center gap-2 ${passwordRules.length ? "text-green-600 font-semibold" : "text-gray-400"}`}>
              <span>{passwordRules.length ? "✓" : "○"}</span> <span className="text-xs">8+ characters</span>
            </p>
            <p className={`text-xs flex items-center gap-2 ${passwordRules.uppercase ? "text-green-600 font-semibold" : "text-gray-400"}`}>
              <span>{passwordRules.uppercase ? "✓" : "○"}</span> <span className="text-xs">Uppercase</span>
            </p>
            <p className={`text-xs flex items-center gap-2 ${passwordRules.lowercase ? "text-green-600 font-semibold" : "text-gray-400"}`}>
              <span>{passwordRules.lowercase ? "✓" : "○"}</span> <span className="text-xs">Lowercase</span>
            </p>
            <p className={`text-xs flex items-center gap-2 ${passwordRules.number ? "text-green-600 font-semibold" : "text-gray-400"}`}>
              <span>{passwordRules.number ? "✓" : "○"}</span> <span className="text-xs">Number</span>
            </p>
            <p className={`text-xs flex items-center gap-2 ${passwordRules.special ? "text-green-600 font-semibold" : "text-gray-400"}`}>
              <span>{passwordRules.special ? "✓" : "○"}</span> <span className="text-xs">Special char</span>
            </p>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading || success}
            className="w-full mt-3 xs:mt-4 sm:mt-5 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500
                       text-white font-semibold py-2 xs:py-2.25 sm:py-2.5 px-4 xs:px-5 sm:px-6 rounded-lg xs:rounded-lg sm:rounded-xl
                       hover:opacity-90 hover:shadow-lg active:scale-95 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed
                       text-xs xs:text-xs sm:text-sm shadow-lg"
          >
            {success ? "✓ Account Created!" : loading ? "⏳ Creating..." : "Create Account"}
          </button>

          <p className="text-xs text-gray-600 text-center mt-3 xs:mt-3 sm:mt-4 leading-relaxed">
            By creating an account, you agree to our Terms & Privacy Policy.
          </p>

          <div className="bg-linear-to-r from-indigo-100/30 to-purple-100/30 rounded-lg p-2.5 xs:p-3 border border-indigo-200/30 mt-3 xs:mt-3">
            <p className="text-center text-xs text-gray-700 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 font-bold hover:text-purple-600 transition">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
