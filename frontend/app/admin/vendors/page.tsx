"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Store,
  Mail,
  Calendar,
  ArrowRight,
  Package,
  IndianRupee,
  BarChart3,
  Search,
  Filter,
  MoreVertical,
  Eye,
  ArrowLeft
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  kycStatus?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  rating?: number;
}

interface VendorWithStats extends Vendor {
  stats?: VendorStats;
}

export default function AdminVendorsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filterStatus based on URL parameter
  const initialStatus = searchParams.get('status');
  const [vendors, setVendors] = useState<VendorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState<Record<string, VendorStats>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>
    (initialStatus === 'PENDING' || initialStatus === 'APPROVED' || initialStatus === 'REJECTED' ? initialStatus : 'ALL');
  
  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/vendors');
      const vendorList = res.data.data || [];
      setVendors(vendorList);
      
      // Fetch stats for each vendor
      for (const vendor of vendorList) {
        if (vendor.kycStatus === 'APPROVED') {
          try {
            const statsRes = await api.get(`/admin/vendors/${vendor.id}/stats`);
            setVendorStats(prev => ({
              ...prev,
              [vendor.id]: statsRes.data?.data || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
            }));
          } catch (err) {
            // Fallback if stats endpoint doesn't exist
            setVendorStats(prev => ({
              ...prev,
              [vendor.id]: { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
            }));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadVendors();
  }, []);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadVendors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const updateKyc = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.patch(`/admin/vendors/${id}/kyc`, { kycStatus: status });
      const updated = res.data.data;
      
      // Ensure kycStatus is properly set
      const updatedVendor = { ...updated, kycStatus: status };
      setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
      
      // Trigger toast notification
      sessionStorage.setItem("adminNotification", JSON.stringify({
        type: 'success',
        message: `Vendor ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      }));

      // Force refresh from server after a short delay
      setTimeout(() => loadVendors(), 500);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to update vendor';
      sessionStorage.setItem("adminNotification", JSON.stringify({
        type: 'error',
        message,
      }));
    }
  };

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Separate vendors by status
  const pendingVendors = vendors.filter(v => !v.kycStatus || v.kycStatus === 'PENDING');
  const approvedVendors = vendors.filter(v => v.kycStatus === 'APPROVED');
  const rejectedVendors = vendors.filter(v => v.kycStatus === 'REJECTED');

  // Calculate overall stats
  const totalRevenue = Object.values(vendorStats).reduce((sum, stats) => sum + (stats.totalRevenue || 0), 0);
  const totalOrders = Object.values(vendorStats).reduce((sum, stats) => sum + (stats.totalOrders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Filter vendors based on search and status
  const filterVendors = (vendorList: VendorWithStats[]) => {
    let filtered = vendorList;
    
    // Apply status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(v => v.kycStatus === filterStatus || (filterStatus === 'PENDING' && (!v.kycStatus || v.kycStatus === 'PENDING')));
    }
    
    // Apply search filter
    return filtered.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER & STATS ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700 hover:text-gray-900"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-7 h-7 text-indigo-600" />
                Vendor Management
              </h1>
              <p className="text-gray-500 mt-1">Manage your marketplace vendors and track their performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Vendors</div>
              <div className="text-2xl font-bold text-gray-900">{vendors.length}</div>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Active</div>
              <div className="text-2xl font-bold text-green-600">{approvedVendors.length}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalOrders.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">₹{avgOrderValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                // Update URL to reflect the filter
                if (status === 'ALL') {
                  router.push('/admin/vendors', { scroll: false });
                } else {
                  router.push(`/admin/vendors?status=${status}`, { scroll: false });
                }
              }}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ================= PENDING APPROVALS ================= */}
      {(filterStatus === 'ALL' || filterStatus === 'PENDING') && filterVendors(pendingVendors).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Pending Approval
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
              {filterVendors(pendingVendors).length}
            </span>
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filterVendors(pendingVendors).map(v => (
              <div key={`${v.id}-pending`} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{v.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-3.5 h-3.5" />
                        {v.email}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                    PENDING
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  Registered on {new Date(v.createdAt || '').toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => updateKyc(v.id, 'APPROVED')} 
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button 
                    onClick={() => updateKyc(v.id, 'REJECTED')} 
                    className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= APPROVED VENDORS - LIST VIEW ================= */}
      {(filterStatus === 'ALL' || filterStatus === 'APPROVED') && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            Approved Vendors
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
              {filterVendors(approvedVendors).length}
            </span>
          </h2>

          {filterVendors(approvedVendors).length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200 border-dashed">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No approved vendors</h3>
              <p className="text-gray-500">Approved vendors will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                <div className="col-span-4">Vendor</div>
                <div className="col-span-2 text-center">Orders</div>
                <div className="col-span-2 text-center">Revenue</div>
                <div className="col-span-2 text-center">Avg Order</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              
              {/* Vendor List */}
              {filterVendors(approvedVendors).map(v => {
                const stats = vendorStats[v.id] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
                return (
                  <div 
                    key={`${v.id}-approved`} 
                    className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition items-center"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{v.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{v.email}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="text-lg font-bold text-gray-900">{stats.totalOrders || 0}</div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="text-lg font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="text-lg font-bold text-gray-900">₹{(stats.avgOrderValue || 0).toLocaleString()}</div>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <Link 
                        href={`/admin/vendors/${v.id}`} 
                        className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ================= REJECTED VENDORS ================= */}
      {(filterStatus === 'ALL' || filterStatus === 'REJECTED') && filterVendors(rejectedVendors).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            Rejected Vendors
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
              {filterVendors(rejectedVendors).length}
            </span>
          </h2>

          <div className="space-y-3">
            {filterVendors(rejectedVendors).map(v => (
              <div key={`${v.id}-rejected`} className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-200 opacity-75 hover:opacity-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{v.name}</div>
                    <div className="text-sm text-gray-500">{v.email}</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  REJECTED
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= EMPTY STATE ================= */}
      {filterVendors(vendors).length === 0 && searchTerm && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No vendors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
