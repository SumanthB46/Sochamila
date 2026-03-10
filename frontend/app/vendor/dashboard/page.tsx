"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
    Package,
    FileText,
    IndianRupee,
    Calendar,
    User,
    CheckCircle,
    Clock,
    Truck,
    AlertCircle,
    Download,
    LogOut,
    LayoutDashboard,
    ShoppingBag,
} from "lucide-react";

type DesignItem = {
    orderItemId: string;
    orderId: string;
    order: {
        id: string;
        customerId: string;
        customer?: { name: string; email: string };
        totalAmount: number;
        status: string;
        createdAt: string;
    };
    product?: { id: string; name: string };
    size?: { id: string; label: string };
    quantity: number;
    price: number;
    fulfillmentStatus: string;
    design: {
        imageUrl?: string | null;
        mockupUrl?: string | null;
        pdfUrl?: string | null;
    };
    hasDesigns: boolean;
};

const STATUS_COLORS: Record<string, string> = {
    PLACED: "bg-blue-100 text-blue-700 ring-blue-200",
    CONFIRMED: "bg-green-100 text-green-700 ring-green-200",
    ASSIGNED: "bg-purple-100 text-purple-700 ring-purple-200",
    PRINTING: "bg-orange-100 text-orange-700 ring-orange-200",
    SHIPPED: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    DELIVERED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    CANCELLED: "bg-red-100 text-red-700 ring-red-200",
    PENDING: "bg-yellow-100 text-yellow-700 ring-yellow-200",
};

const STATUS_ICONS: Record<string, React.ReactElement> = {
    PLACED: <Clock className="w-3.5 h-3.5" />,
    CONFIRMED: <CheckCircle className="w-3.5 h-3.5" />,
    ASSIGNED: <User className="w-3.5 h-3.5" />,
    PRINTING: <Package className="w-3.5 h-3.5" />,
    SHIPPED: <Truck className="w-3.5 h-3.5" />,
    DELIVERED: <CheckCircle className="w-3.5 h-3.5" />,
    PENDING: <Clock className="w-3.5 h-3.5" />,
};

export default function VendorDashboardPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<DesignItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "withPdf">("all");

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            router.push("/vendor/login");
            return;
        }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/vendor/assigned-designs");
            setOrders(res.data?.data || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch assigned orders");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        router.push("/vendor/login");
    };

    const filteredOrders = orders.filter(o => {
        if (activeTab === "pending") return o.fulfillmentStatus === "PENDING";
        if (activeTab === "withPdf") return Boolean(o.design.pdfUrl);
        return true;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.fulfillmentStatus === "PENDING").length,
        withPdf: orders.filter(o => o.design.pdfUrl).length,
        totalValue: orders.reduce((sum, o) => sum + o.price * o.quantity, 0),
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Nav */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 leading-none">Sochamila</p>
                            <p className="text-xs text-gray-500">Vendor Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Assigned Orders</h1>
                    <p className="text-gray-500 mt-1">Orders assigned to you for fulfillment. Download the print PDF for each item.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Orders", value: stats.total, icon: <ShoppingBag className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50" },
                        { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50" },
                        { label: "With PDF", value: stats.withPdf, icon: <FileText className="w-5 h-5 text-green-600" />, bg: "bg-green-50" },
                        { label: "Total Value", value: `₹${stats.totalValue.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: "all", label: `All (${stats.total})` },
                        { key: "pending", label: `Pending (${stats.pending})` },
                        { key: "withPdf", label: `With PDF (${stats.withPdf})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
                        <p className="text-gray-400 text-sm">Orders assigned to you by the admin will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredOrders.map(item => (
                            <div
                                key={item.orderItemId}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ring-1 ${STATUS_COLORS[item.order.status] || STATUS_COLORS.PENDING}`}>
                                            {STATUS_ICONS[item.order.status] || <Clock className="w-3.5 h-3.5" />}
                                            {item.order.status}
                                        </span>
                                        <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                            #{item.orderId.slice(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(item.order.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                        })}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex flex-col sm:flex-row gap-6">
                                    {/* Product Image */}
                                    <div className="relative shrink-0">
                                        <div className="w-32 h-32 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {item.design.imageUrl ? (
                                                <img src={item.design.imageUrl} alt="Product" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Package className="w-10 h-10 text-gray-300" />
                                            )}
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                                            ×{item.quantity}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product</p>
                                            <p className="font-semibold text-gray-900">{item.product?.name || "Custom Product"}</p>
                                            {item.size?.label && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                                    Size: {item.size.label}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Value</p>
                                            <p className="text-xl font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">₹{item.price.toLocaleString()} × {item.quantity}</p>
                                        </div>
                                        {item.order.customer && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                        <User className="w-3.5 h-3.5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{item.order.customer.name}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{item.order.customer.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PDF Download Section */}
                                <div className={`mx-6 mb-6 rounded-xl p-4 border ${item.design.pdfUrl ? "bg-indigo-50 border-indigo-100" : "bg-gray-50 border-gray-100"}`}>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.design.pdfUrl ? "bg-indigo-600" : "bg-gray-200"}`}>
                                                <FileText className={`w-5 h-5 ${item.design.pdfUrl ? "text-white" : "text-gray-400"}`} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">Print Design PDF</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.design.pdfUrl
                                                        ? "Download the PDF to see the exact print layout and design details."
                                                        : "No print PDF attached to this order item."}
                                                </p>
                                            </div>
                                        </div>
                                        {item.design.pdfUrl ? (
                                            <a
                                                href={item.design.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 shrink-0"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Print PDF
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed shrink-0">
                                                <Download className="w-4 h-4" />
                                                No PDF Available
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
