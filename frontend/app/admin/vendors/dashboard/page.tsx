'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { 
  X, LogOut, ChevronDown, Search, Filter, Download,
  TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
  Star, Award, Zap, Package, Truck, CheckCircle, AlertCircle,
  DollarSign, Users, Eye, Clock, ArrowUpRight, Menu, Bell, Percent
} from 'lucide-react';

interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  address?: string;
}

interface DashboardData {
  metrics: {
    assignedOrders: number;
    pendingDispatch: number;
    completedOrders: number;
    totalEarnings: number;
  };
  recentOrders: Array<{
    id: string;
    orderId: string;
    status: string;
    date: string;
    totalAmount: number;
  }>;
  quickStats: {
    avgOrderValue: number;
    commissionRate: number;
    pendingPayout: number;
    storeRating: number;
  };
  vendor?: VendorProfile;
}

interface OrdersData {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: string;
  date: string;
  itemDetails?: any[];
}

interface StatsData {
  totalSales: number;
  conversionRate: number;
  avgOrderValue: number;
  earnings: Array<{
    month: string;
    orders: number;
    revenue: number;
    commission: number;
  }>;
  topProducts: Array<{
    product: string;
    sales: number;
    revenue: number;
  }>;
}

const ORDER_STATUS_OPTIONS = ['PENDING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function VendorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersData[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdersData | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdatingOrderId(selectedOrder.id);
      const res = await axios.patch(`/vendor/orders/${selectedOrder.id}`, {
        status: newStatus,
      });

      if (res.data.success) {
        setOrdersData(prev =>
          prev.map(order =>
            order.id === selectedOrder.id
              ? { ...order, status: newStatus }
              : order
          )
        );
        setStatusModalOpen(false);
        setSelectedOrder(null);
        setNewStatus('');
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/login");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('[VENDOR] Fetching dashboard data...');
        
        const requests = {
          dashboard: axios.get('/vendor/dashboard'),
          orders: axios.get('/vendor/orders'),
          stats: axios.get('/vendor/stats'),
        };

        // Fetch with individual error tracking
        const results = await Promise.allSettled([
          requests.dashboard,
          requests.orders,
          requests.stats,
        ]);

        console.log('[VENDOR] Request results:', results.map((r, idx) => {
          if (r.status === 'fulfilled') {
            return { endpoint: ['dashboard', 'orders', 'stats'][idx], status: 'fulfilled' };
          } else {
            return { 
              endpoint: ['dashboard', 'orders', 'stats'][idx], 
              status: 'rejected', 
              error: r.reason,
            };
          }
        }));

        // Handle dashboard (required)
        if (results[0].status === 'fulfilled') {
          console.log('[VENDOR] Dashboard received:', results[0].value.data);
          const dashData = results[0].value.data.data;
          setDashboardData(dashData);
          // Extract vendor profile if available
          if (dashData.vendor) {
            setVendorProfile(dashData.vendor);
          }
        } else {
          const err = results[0].reason;
          console.error('[VENDOR] Dashboard fetch error:', {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            fullError: err,
          });
          throw new Error(`Dashboard failed: ${err.response?.data?.message || err.message}`);
        }

        // Handle orders (optional)
        if (results[1].status === 'fulfilled') {
          console.log('[VENDOR] Orders received:', results[1].value.data);
          setOrdersData(results[1].value.data.data || []);
        } else {
          const err = results[1].reason;
          console.warn('[VENDOR] Orders fetch failed:', err.message);
          setOrdersData([]);
        }

        // Handle stats (optional)
        if (results[2].status === 'fulfilled') {
          console.log('[VENDOR] Stats received:', results[2].value.data);
          setStatsData(results[2].value.data.data);
        } else {
          const err = results[2].reason;
          console.warn('[VENDOR] Stats fetch failed:', err.message);
          setStatsData(null);
        }

        setError(null);
      } catch (err: any) {
        console.error('[VENDOR] Caught error:', err);
        const errorMessage = err.response?.data?.error 
          || err.response?.data?.message 
          || err.message 
          || 'Failed to load vendor dashboard data';
        console.error('[VENDOR] Final error message:', errorMessage);
        setError(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">Sochamila Vendor</h1>
              <p className="text-xs text-slate-500">Store Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
              <Bell size={20} className="text-slate-600" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Vendor Profile Section */}
        {vendorProfile && (
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-8 mb-8 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{vendorProfile.name}</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star size={14} fill="currentColor" /> 4.8
                    </span>
                  </div>
                </div>
                <p className="text-indigo-100 mb-4">{vendorProfile.businessName || 'Premium Vendor Store'}</p>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-indigo-100 text-sm">Email</p>
                    <p className="font-medium">{vendorProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-indigo-100 text-sm">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <p className="font-medium">Active</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-indigo-100 text-sm">Member Since</p>
                    <p className="font-medium">Jan 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs - Enhanced */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ProfessionalMetricCard 
                title="Assigned Orders" 
                value={dashboardData.metrics.assignedOrders} 
                icon={Package}
                color="blue"
                trend="+12%"
                comparison="vs last month" 
              />
              <ProfessionalMetricCard 
                title="Pending Dispatch" 
                value={dashboardData.metrics.pendingDispatch}
                icon={Clock}
                color="orange"
                trend="-5%"
                comparison="vs last month" 
              />
              <ProfessionalMetricCard 
                title="Completed Orders" 
                value={dashboardData.metrics.completedOrders}
                icon={CheckCircle}
                color="green"
                trend="+8%"
                comparison="vs last month" 
              />
              <ProfessionalMetricCard 
                title="Total Earnings" 
                value={formatINR(dashboardData.metrics.totalEarnings)}
                icon={DollarSign}
                color="purple"
                trend="+23%"
                comparison="vs last month" 
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp size={20} className="text-indigo-600" />
                      Recent Orders
                    </h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
                  </div>
                  <div className="space-y-4">
                    {dashboardData.recentOrders.length > 0 ? (
                      dashboardData.recentOrders.map((order) => (
                        <OrderItem
                          key={`${order.id}-${order.orderId}`}
                          orderId={order.orderId}
                          status={order.status}
                          date={new Date(order.date).toLocaleDateString()}
                          amount={order.totalAmount}
                        />
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-8">No recent orders</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-500" />
                  Quick Stats
                </h2>
                <div className="space-y-4">
                  <ProfessionalStatItem label="Avg. Order Value" value={formatINR(dashboardData.quickStats.avgOrderValue)} icon={DollarSign} />
                  <ProfessionalStatItem label="Commission Rate" value={`${dashboardData.quickStats.commissionRate}%`} icon={Percent} />
                  <ProfessionalStatItem label="Pending Payout" value={formatINR(dashboardData.quickStats.pendingPayout)} icon={Truck} />
                  <ProfessionalStatItem label="Store Rating" value={`${dashboardData.quickStats.storeRating}/5`} icon={Star} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Package size={24} className="text-indigo-600" />
                  All Orders
                </h2>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-2 text-slate-700 font-medium">
                  <Filter size={18} />
                  Filter
                </button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2 font-medium">
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {ordersData && ordersData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Items</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData.map((order) => (
                      <tr key={`${order.id}-${order.orderId}`} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">{order.orderId}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{order.customer}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{order.items}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{formatINR(order.total)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PACKED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              setStatusModalOpen(true);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No orders found</p>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && statsData && (
          <div className="space-y-6">
            {/* Top Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProfessionalMetricCard 
                title="Total Sales" 
                value={formatINR(statsData.totalSales)}
                icon={TrendingUp}
                color="green"
                trend="+18%"
                comparison="vs last month" 
              />
              <ProfessionalMetricCard 
                title="Conversion Rate" 
                value={`${statsData.conversionRate.toFixed(1)}%`}
                icon={BarChart3}
                color="blue"
                trend="+3.2%"
                comparison="vs last month" 
              />
              <ProfessionalMetricCard 
                title="Avg Order Value" 
                value={formatINR(statsData.avgOrderValue)}
                icon={DollarSign}
                color="purple"
                trend="+7%"
                comparison="vs last month" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Breakdown */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-600" />
                  Earnings Breakdown
                </h2>
                <div className="space-y-3">
                  {statsData.earnings.map((earning, idx) => (
                    <ProfessionalEarningRow
                      key={`${earning.month}-${idx}`}
                      month={earning.month}
                      orders={earning.orders}
                      revenue={earning.revenue}
                      commission={earning.commission}
                    />
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <PieChart size={20} className="text-orange-600" />
                  Top Selling Products
                </h2>
                <div className="space-y-3">
                  {statsData.topProducts.map((product, idx) => (
                    <ProfessionalAnalyticsRow
                      key={`${product.product}-${idx}`}
                      product={product.product}
                      sales={product.sales}
                      revenue={product.revenue}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {statusModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Package size={24} className="text-indigo-600" />
                  Update Order Status
                </h3>
                <button
                  onClick={() => {
                    setStatusModalOpen(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-slate-900">{selectedOrder?.orderId}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedOrder?.customer}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Select New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                  >
                    <option value="">Choose a status...</option>
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => {
                    setStatusModalOpen(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={updateOrderStatus}
                  disabled={!newStatus || updatingOrderId === selectedOrder?.id}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updatingOrderId === selectedOrder?.id ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components

function ProfessionalMetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend,
  comparison 
}: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const trendIsPositive = trend.startsWith('+');

  return (
    <div className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white rounded-lg">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
          trendIsPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trendIsPositive ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-sm font-medium opacity-75 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-60 mt-2">{comparison}</p>
    </div>
  );
}

// Local INR formatter
function formatINR(value?: number | string) {
  const n = typeof value === 'number' ? value : parseFloat(String(value || '0'));
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
}

function ProfessionalStatItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className="text-indigo-600" />}
        <p className="text-sm text-slate-600 font-medium">{label}</p>
      </div>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}

function OrderItem({ orderId, status, date, amount }: any) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PRINTING': return 'bg-orange-100 text-orange-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{orderId}</p>
            <p className="text-xs text-slate-500">{date}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-900">{formatINR(amount || 0)}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function Card({ title, value, icon }: { title: string; value: string; icon?: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ProfessionalEarningRow({ month, orders, revenue, commission }: any) {
  const totalAmount = revenue + commission;
  const percentage = (commission / revenue * 100).toFixed(0);

  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-900">{month}</p>
          <p className="text-xs text-slate-500">{orders} orders</p>
        </div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {percentage}% Commission
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-600 mb-1">Revenue</p>
          <p className="font-bold text-slate-900">{formatINR(revenue)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600 mb-1">Your Commission</p>
          <p className="font-bold text-green-600">{formatINR(commission)}</p>
        </div>
      </div>
    </div>
  );
}

function ProfessionalAnalyticsRow({ product, sales, revenue }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200 hover:border-slate-300">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-slate-900">{product}</p>
        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
          {sales} sales
        </span>
      </div>
      <p className="text-lg font-bold text-slate-900">{formatINR(revenue)}</p>
    </div>
  );
}
