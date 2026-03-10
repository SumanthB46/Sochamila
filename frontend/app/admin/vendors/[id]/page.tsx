"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { 
  ArrowLeft, 
  Store, 
  Mail, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Package,
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Truck,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart,
  CalendarDays
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  kycStatus: string;
  createdAt: string;
  isActive: boolean;
  assignedOrderItems?: Array<{
    id: string;
    orderId: string;
    quantity: number;
    price: number;
    order?: {
      status: string;
      createdAt: string;
    };
    size?: {
      size: string;
    };
  }>;
}

interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface OrderStatusBreakdown {
  PENDING: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
}

interface RevenueData {
  daily: { date: string; revenue: number; orders: number }[];
  weekly: { week: string; revenue: number; orders: number }[];
  monthly: { month: string; revenue: number; orders: number }[];
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params as any)?.id;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<VendorStats>({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
  const [orderStatus, setOrderStatus] = useState<OrderStatusBreakdown>({ 
    PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 
  });
  const [revenueData, setRevenueData] = useState<RevenueData>({ daily: [], weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    
    const loadVendorData = async () => {
      try {
        setLoading(true);
        
        // Fetch vendor details
        const vendorRes = await api.get(`/admin/vendors/${id}`);
        if (!mounted) return;
        setVendor(vendorRes.data.data);
        
        // Fetch vendor stats
        const statsRes = await api.get(`/admin/vendors/${id}/stats`);
        if (!mounted) return;
        setStats(statsRes.data?.data || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
        
        // Fetch order items for status breakdown
        const itemsRes = await api.get(`/admin/vendors/${id}`);
        if (!mounted) return;
        const items = itemsRes.data.data?.assignedOrderItems || [];
        
        // Calculate order status breakdown
        const statusCount: OrderStatusBreakdown = { 
          PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 
        };
        items.forEach((item: any) => {
          const status = item.order?.status || 'PENDING';
          if (statusCount.hasOwnProperty(status)) {
            statusCount[status as keyof OrderStatusBreakdown]++;
          }
        });
        setOrderStatus(statusCount);
        
        // Generate mock revenue data (in real app, this would come from API)
        generateRevenueData(items);
        
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadVendorData();
    return () => { mounted = false; };
  }, [id]);

  const generateRevenueData = (items: any[]) => {
    if (!items || items.length === 0) {
      // If no items, show empty data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthly = months.map(month => ({ month, revenue: 0, orders: 0 }));
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const weekly = weeks.map(week => ({ week, revenue: 0, orders: 0 }));
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const daily = days.map(day => ({ date: day, revenue: 0, orders: 0 }));
      setRevenueData({ monthly, weekly, daily });
      return;
    }

    // Group items by month
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    const weeklyMap = new Map<string, { revenue: number; orders: number }>();
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    
    items.forEach((item: any) => {
      const orderDate = item.order?.createdAt ? new Date(item.order.createdAt) : new Date();
      const monthKey = orderDate.toLocaleString('en-US', { month: 'short' });
      const weekKey = `Week ${Math.ceil(orderDate.getDate() / 7)}`;
      const dayKey = orderDate.toLocaleString('en-US', { weekday: 'short' });
      
      const itemRevenue = (item.price || 0) * (item.quantity || 1);
      
      // Monthly aggregation
      const monthData = monthlyMap.get(monthKey) || { revenue: 0, orders: 0 };
      monthData.revenue += itemRevenue;
      monthData.orders += 1;
      monthlyMap.set(monthKey, monthData);
      
      // Weekly aggregation
      const weekData = weeklyMap.get(weekKey) || { revenue: 0, orders: 0 };
      weekData.revenue += itemRevenue;
      weekData.orders += 1;
      weeklyMap.set(weekKey, weekData);
      
      // Daily aggregation
      const dayData = dailyMap.get(dayKey) || { revenue: 0, orders: 0 };
      dayData.revenue += itemRevenue;
      dayData.orders += 1;
      dailyMap.set(dayKey, dayData);
    });
    
    // Convert maps to arrays
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthly = months.map(month => ({
      month,
      revenue: Math.round(monthlyMap.get(month)?.revenue || 0),
      orders: monthlyMap.get(month)?.orders || 0
    }));
    
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weekly = weeks.map(week => ({
      week,
      revenue: Math.round(weeklyMap.get(week)?.revenue || 0),
      orders: weeklyMap.get(week)?.orders || 0
    }));
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daily = days.map(day => ({
      date: day,
      revenue: Math.round(dailyMap.get(day)?.revenue || 0),
      orders: dailyMap.get(day)?.orders || 0
    }));
    
    setRevenueData({ monthly, weekly, daily });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
      SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
      DELIVERED: 'bg-green-100 text-green-700 border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'PROCESSING': return <Loader2 className="w-4 h-4" />;
      case 'SHIPPED': return <Truck className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!vendor) return <div className="p-10">Vendor not found</div>;

  const totalOrdersByStatus = Object.values(orderStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              vendor.kycStatus === 'APPROVED' 
                ? 'bg-green-100 text-green-700' 
                : vendor.kycStatus === 'PENDING'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {vendor.kycStatus}
            </span>
          </div>
          <p className="text-gray-500 flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {vendor.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {new Date(vendor.createdAt).toLocaleDateString('en-IN', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
            </span>
          </p>
        </div>
      </div>

      {/* ================= KEY METRICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+12% this month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+8% this month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Lifetime</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{stats.avgOrderValue.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Avg Order Value</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{orderStatus.PROCESSING + orderStatus.SHIPPED}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
      </div>

      {/* ================= ORDER STATUS BREAKDOWN ================= */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Order Status Breakdown
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(orderStatus).map(([status, count]) => (
              <div key={status} className={`p-4 rounded-xl border-2 ${getStatusColor(status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status)}
                  <span className="text-xs font-medium uppercase">{status}</span>
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs opacity-75">
                  {totalOrdersByStatus > 0 ? Math.round((count / totalOrdersByStatus) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
              {Object.entries(orderStatus).map(([status, count]) => {
                const percentage = totalOrdersByStatus > 0 ? (count / totalOrdersByStatus) * 100 : 0;
                const bgColors: Record<string, string> = {
                  PENDING: 'bg-amber-500',
                  PROCESSING: 'bg-blue-500',
                  SHIPPED: 'bg-purple-500',
                  DELIVERED: 'bg-green-500',
                  CANCELLED: 'bg-red-500',
                };
                return (
                  <div 
                    key={status}
                    className={`${bgColors[status]} transition-all`}
                    style={{ width: `${percentage}%` }}
                    title={`${status}: ${count} orders`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Order Distribution</span>
              <span>{totalOrdersByStatus} Total Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= NO DATA MESSAGE ================= */}
      {stats.totalOrders === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">No Orders Yet</h3>
              <p className="text-amber-700 text-sm">This vendor has not received any orders yet. Data will appear here once orders are assigned.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= REVENUE ANALYTICS ================= */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Revenue Analytics
          </h2>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setRevenueView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  revenueView === view
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {/* Chart */}
          <div className="h-64 flex items-end gap-2">
            {revenueData[revenueView].map((item, idx) => {
              const maxRevenue = Math.max(...revenueData[revenueView].map(d => d.revenue));
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const label = 'month' in item ? item.month : 'week' in item ? item.week : item.date;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div 
                      className="bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
                      style={{ height: `${height * 2}px` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      ₹{item.revenue.toLocaleString()} ({item.orders} orders)
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              );
            })}
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{revenueData[revenueView].reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-sm text-gray-500">Total Orders</div>
              <div className="text-xl font-bold text-gray-900">
                {revenueData[revenueView].reduce((sum, d) => sum + d.orders, 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Avg Revenue</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{Math.round(revenueData[revenueView].reduce((sum, d) => sum + d.revenue, 0) / revenueData[revenueView].length).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT ORDERS ================= */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {vendor.assignedOrderItems && vendor.assignedOrderItems.length > 0 ? (
            vendor.assignedOrderItems.slice(0, 10).map((item: any) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.order?.status === 'DELIVERED' ? 'bg-green-100' :
                    item.order?.status === 'SHIPPED' ? 'bg-purple-100' :
                    item.order?.status === 'PROCESSING' ? 'bg-blue-100' :
                    item.order?.status === 'CANCELLED' ? 'bg-red-100' :
                    'bg-amber-100'
                  }`}>
                    <Package className={`w-5 h-5 ${
                      item.order?.status === 'DELIVERED' ? 'text-green-600' :
                      item.order?.status === 'SHIPPED' ? 'text-purple-600' :
                      item.order?.status === 'PROCESSING' ? 'text-blue-600' :
                      item.order?.status === 'CANCELLED' ? 'text-red-600' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{item.orderId?.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {item.size?.size || 'N/A'} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.order?.status || 'PENDING')}`}>
                    {item.order?.status || 'PENDING'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No orders assigned to this vendor yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
