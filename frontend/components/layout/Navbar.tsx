"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  LogIn,
  UserPlus,
  Briefcase,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useCart } from "../../lib/cart";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (!token) {
      setIsLoggedIn(false);
      setUserRole(null);
      return;
    }
    try {
      const decoded = jwtDecode<{ exp: number; role: string }>(token);
      setIsLoggedIn(decoded.exp * 1000 > Date.now());
      setUserRole(decoded.role || null);
    } catch {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  // Determine dashboard URL based on user role
  const getDashboardUrl = () => {
    if (userRole === "ADMIN") return "/admin";
    if (userRole === "VENDOR") return "/admin/vendors/dashboard";
    return "/dashboard";
  };

  const navLinks = [
    { name: "Shop", href: "/products", requiresAuth: false },
    { name: "Create", href: "/JeseyGen", requiresAuth: true },
  ];

  return (
    <>
      {/* ================= ANNOUNCEMENT ================= */}
      <div className="w-full bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-center py-2 text-xs sm:text-sm font-semibold tracking-wide">
        🎉 Flat 20% OFF on your first order — Use <span className="underline">SOCHA20</span>
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="w-full bg-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50 shadow-md backdrop-blur">

        {/* ================= LEFT - LOGO ================= */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <Image 
            src="/PAINT.png" 
            alt="Sochamila Logo" 
            width={32} 
            height={32}
            priority
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          />
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-[#a19926] tracking-tight group-hover:tracking-wider transition-all">
            SOCHAMILA
          </span>
        </Link>

        {/* ================= CENTER - DESKTOP LINKS ================= */}
        <div className="hidden lg:flex gap-8 items-center">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.requiresAuth && !isLoggedIn ? "/login" : item.href}
              onClick={() => {
                if (item.requiresAuth && !isLoggedIn) {
                  sessionStorage.setItem('redirectAfterLogin', item.href);
                }
              }}
              className="relative font-semibold text-gray-700 transition hover:text-indigo-600
              after:absolute after:left-1/2 after:-bottom-1 after:h-[3px]
              after:w-0 after:bg-linear-to-r after:from-indigo-500 after:to-purple-500
              after:rounded-full after:-translate-x-1/2 after:transition-all
              hover:after:w-10"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* ================= SEARCH BAR - DESKTOP ================= */}
        <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-xl flex-1 mx-4 max-w-xs
          focus-within:ring-2 focus-within:ring-indigo-400 transition shadow-inner">
          <Search size={18} className="text-gray-500 shrink-0" />
          <input
            placeholder="Search..."
            className="ml-2 bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-500"
          />
        </div>

        {/* ================= RIGHT - DESKTOP AUTH & ICONS ================= */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5">

          {/* CUSTOMER AUTH - hide Login when logged in */}
          {!isLoggedIn && (
            <Link
              href="/login"
              className="flex items-center gap-1 font-semibold text-gray-700 hover:text-indigo-600 transition text-sm xl:text-base"
            >
              <LogIn size={18} />
              <span className="hidden xl:inline">Login</span>
            </Link>
          )}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-indigo-600 transition text-sm xl:text-base"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <LayoutDashboard size={18} />
                <span className="hidden xl:inline">Account</span>
                <ChevronDown size={16} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                  <Link
                    href={getDashboardUrl()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Homepage
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* REGISTER BUTTON */}
          <Link
            href="/register"
            className="flex items-center gap-1 px-4 py-2 rounded-xl font-semibold text-white
            bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500
            hover:shadow-lg hover:-translate-y-px transition-all text-sm xl:text-base"
          >
            <UserPlus size={18} /> 
            <span className="hidden xl:inline">Register</span>
          </Link>

          {/* VENDOR LOGIN */}
          <Link
            href="/vendor/register"
            className="flex items-center gap-1 px-3 xl:px-4 py-2 rounded-xl
            border border-indigo-500 text-indigo-600 font-semibold
            hover:bg-indigo-50 transition text-sm xl:text-base"
          >
            <Briefcase size={18} /> 
            <span className="hidden xl:inline">Vendor</span>
          </Link>

          {/* ICONS */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Heart size={20} className="hover:text-red-500 hover:scale-110 transition" />
          </button>
          <Link href="/checkout" className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <ShoppingCart size={20} className="hover:text-indigo-600 hover:scale-110 transition" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* ================= RIGHT - TABLET & MOBILE ================= */}
        <div className="lg:hidden flex items-center gap-2">
          
          {/* MOBILE SEARCH */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Search size={20} />
          </button>

          {/* MOBILE ICONS */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition md:block hidden">
            <Heart size={20} />
          </button>
          <Link href="/checkout" className="relative p-2 hover:bg-gray-100 rounded-lg transition md:block hidden">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ================= MOBILE SEARCH BAR ================= */}
      {searchOpen && (
        <div className="lg:hidden bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-300 focus-within:border-indigo-500 transition">
            <Search size={18} className="text-gray-500" />
            <input
              placeholder="Search products..."
              className="ml-2 bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>
      )}

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b shadow-lg animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-3">
            
            {/* MOBILE NAV LINKS */}
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.requiresAuth && !isLoggedIn ? "/login" : item.href}
                onClick={() => {
                  if (item.requiresAuth && !isLoggedIn) {
                    sessionStorage.setItem('redirectAfterLogin', item.href);
                    setMobileOpen(false);
                  } else {
                    setMobileOpen(false);
                  }
                }}
                className="block py-2 px-3 rounded-lg hover:bg-gray-100 font-semibold text-gray-700 transition"
              >
                {item.name}
              </Link>
            ))}

            <div className="border-t pt-3 mt-3 space-y-2">
              
              {/* MOBILE AUTH BUTTONS */}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 font-semibold text-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn size={18} /> Login
                </Link>
              )}
              {isLoggedIn && (
                <>
                  <Link
                    href={getDashboardUrl()}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 font-semibold text-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 font-semibold text-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Homepage
                  </Link>
                </>
              )}

              <Link
                href="/register"
                className="flex items-center gap-2 py-2 px-3 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg transition"
                onClick={() => setMobileOpen(false)}
              >
                <UserPlus size={18} /> Register
              </Link>

              <Link
                href="/vendor/register"
                className="flex items-center gap-2 py-2 px-3 rounded-lg border border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
                onClick={() => setMobileOpen(false)}
              >
                <Briefcase size={18} /> Vendor
              </Link>
            </div>

            {/* MOBILE ICONS */}
            <div className="border-t pt-3 mt-3 flex gap-4">
              <button className="flex-1 py-2 px-3 rounded-lg hover:bg-gray-100 font-semibold flex items-center justify-center gap-2">
                <Heart size={18} /> Wishlist
              </button>
              <Link href="/checkout" className="relative flex-1 py-2 px-3 rounded-lg hover:bg-gray-100 font-semibold flex items-center justify-center gap-2">
                <ShoppingCart size={18} /> Cart
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
