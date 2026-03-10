"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  RefreshCcw,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

/* ================= TYPES ================= */

interface DashboardStats {
  products: number;
  orders: number;
  vendors: number;
  revenue: number;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  kycStatus?: string;
  isActive?: boolean;
  createdAt?: string;
}

/* ================= PAGE ================= */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD DATA ================= */

  const loadData = async () => {
    try {
      setError("");
      setRefreshing(true);

      const [statsRes, vendorsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/vendors"),
      ]);

      setStats(statsRes.data?.data || statsRes.data);
      setVendors(Array.isArray(vendorsRes.data?.data) ? vendorsRes.data.data : []);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      
      if (err?.response?.status === 403) {
        setError("You don't have permission to view this data. Please ensure you're logged in as an admin.");
      } else if (err?.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to load dashboard data");
      }
      
      // Set default stats to prevent crash
      setStats({
        products: 0,
        orders: 0,
        vendors: 0,
        revenue: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ================= VENDOR STATS ================= */

  const pendingVendors = vendors.filter(v => !v.kycStatus || v.kycStatus === "PENDING");
  const approvedVendors = vendors.filter(v => v.kycStatus === "APPROVED");

  /* ================= UI ================= */

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            System overview & vendor management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600
              text-sm font-medium hover:bg-indigo-50 transition
            "
            title="Switch to customer dashboard"
          >
            <ShoppingBag size={16} />
            Super Admin Dashboard
          </Link>
          <Link
            href="/"
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 text-gray-600
              text-sm font-medium hover:bg-gray-50 transition
            "
            title="Go to homepage"
          >
            <ShoppingBag size={16} />
            Homepage
          </Link>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg border
              text-sm hover:bg-gray-50 transition
            "
          >
            <RefreshCcw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ================= KEY METRICS ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Key Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats?.products}
            loading={loading}
            icon={<Package size={22} />}
            color="indigo"
          />

          <StatCard
            title="Active Orders"
            value={stats?.orders}
            loading={loading}
            icon={<ShoppingBag size={22} />}
            color="green"
          />

          <StatCard
            title="Total Vendors"
            value={stats?.vendors}
            loading={loading}
            icon={<Users size={22} />}
            color="orange"
          />

          <StatCard
            title="Revenue"
            value={
              stats
                ? `₹${stats.revenue.toLocaleString()}`
                : undefined
            }
            loading={loading}
            icon={<TrendingUp size={22} />}
            color="blue"
          />
        </div>
      </section>

      {/* ================= VENDOR OVERVIEW ================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Vendor Management
          </h2>
          <Link href="/admin/vendors" className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <h3 className="text-3xl font-bold mt-2">{pendingVendors.length}</h3>
                <p className="text-xs text-gray-400 mt-1">Awaiting KYC review</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved Vendors</p>
                <h3 className="text-3xl font-bold mt-2">{approvedVendors.length}</h3>
                <p className="text-xs text-gray-400 mt-1">Active sellers</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <CheckCircle size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Approval Rate</p>
                <h3 className="text-3xl font-bold mt-2">{vendors.length > 0 ? Math.round((approvedVendors.length / vendors.length) * 100) : 0}%</h3>
                <p className="text-xs text-gray-400 mt-1">Of all vendors</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* VENDOR LIST */}
        {vendors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Recent Vendors (Latest {Math.min(10, vendors.length)})</h3>
            </div>

            <div className="divide-y">
              {vendors.slice(0, 10).map(vendor => (
                <div key={vendor.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{vendor.name}</div>
                    <div className="text-xs text-gray-500">{vendor.email}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vendor.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      vendor.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {vendor.kycStatus || 'PENDING'}
                    </span>

                    {vendor.kycStatus === 'APPROVED' ? (
                      <Link href={`/admin/vendors/${vendor.id}`} className="text-indigo-600 text-xs font-medium hover:underline">
                        View
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {vendors.length > 10 && (
              <div className="p-4 text-center border-t bg-gray-50">
                <Link href="/admin/vendors" className="text-indigo-600 text-sm font-medium hover:underline">
                  View all {vendors.length} vendors →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================= QUICK ACTIONS ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickCard
            title="Add New Product"
            description="Create new products with images & variants"
            href="/admin/products/new"
          />

          <QuickCard
            title="Manage Products"
            description="Update pricing, stock and visibility"
            href="/admin/products"
          />

          <QuickCard
            title="Manage Orders"
            description="View and process customer orders"
            href="/admin/orders"
          />
        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value?: string | number;
  icon: React.ReactNode;
  color: "indigo" | "green" | "orange" | "blue";
  loading: boolean;
}) {
  const colorMap = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">
          {loading ? (
            <span className="animate-pulse text-gray-300">
              —
            </span>
          ) : (
            value ?? "0"
          )}
        </h3>
      </div>
    </div>
  );
}

function QuickCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        bg-white rounded-2xl p-6 shadow-sm
        hover:shadow-md transition block
      "
    >
      <h3 className="font-semibold text-lg mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500">
        {description}
      </p>
    </Link>
  );
}
