"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Package,
  User,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Check,
  Store,
  Tag,
  ChevronDown,
  X
} from "lucide-react";

type OrderItem = {
  id: string;
  sizeId: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
  mockupUrl?: string | null;
  pdfUrl?: string | null;
  vendorId?: string | null;
  vendor?: Vendor | null;
};

type Order = {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type Vendor = { id: string; name: string; email: string };

interface AssignmentModal {
  isOpen: boolean;
  orderItemId: string;
  vendorId: string;
  vendorName: string;
  itemName: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignmentModal, setAssignmentModal] = useState<AssignmentModal>({
    isOpen: false,
    orderItemId: '',
    vendorId: '',
    vendorName: '',
    itemName: ''
  });

  useEffect(() => {
    async function load() {
      try {
        const [oRes, vRes] = await Promise.all([
          api.get("/admin/orders"),
          api.get("/admin/vendors"),
        ]);

        setOrders(oRes.data.data || []);
        setVendors(vRes.data.data || []);
      } catch (err) {
        console.error("Failed to load admin orders/vendors", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleAssign = async (orderItemId: string, vendorId: string) => {
    try {
      setAssigning(orderItemId);
      await api.post(`/admin/orders/assign/${orderItemId}`, { vendorId });
      // refresh
      const res = await api.get("/admin/orders");
      setOrders(res.data.data || []);

      // Show success feedback
      const vendor = vendors.find(v => v.id === vendorId);
      if (vendor) {
        alert(`Successfully assigned to ${vendor.name}`);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to assign vendor");
    } finally {
      setAssigning(null);
      setAssignmentModal({
        isOpen: false,
        orderItemId: '',
        vendorId: '',
        vendorName: '',
        itemName: ''
      });
    }
  };

  const openAssignmentModal = (orderItemId: string, vendorId: string, vendorName: string, itemName: string) => {
    setAssignmentModal({
      isOpen: true,
      orderItemId,
      vendorId,
      vendorName,
      itemName
    });
  };

  const closeAssignmentModal = () => {
    setAssignmentModal({
      isOpen: false,
      orderItemId: '',
      vendorId: '',
      vendorName: '',
      itemName: ''
    });
  };

  const confirmAssignment = () => {
    if (assignmentModal.orderItemId && assignmentModal.vendorId) {
      handleAssign(assignmentModal.orderItemId, assignmentModal.vendorId);
    }
  };

  const ORDER_STATUSES = [
    'PLACED', 'CONFIRMED', 'ASSIGNED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  ] as const;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLACED': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ASSIGNED': return <User className="w-4 h-4 text-purple-500" />;
      case 'PRINTING': return <Package className="w-4 h-4 text-orange-500" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'DELIVERED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'PRINTING': return 'bg-orange-100 text-orange-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
      const updated: any = res.data?.data;
      if (updated) {
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and assign orders to vendors</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">There are no orders to display at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-xs tracking-wide font-bold uppercase ${getStatusColor(order.status)} ring-1 ring-inset ${getStatusColor(order.status).replace('bg-', 'ring-').replace('text-', 'ring-')}/20`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">#{order.id.slice(0, 8)}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <User className="w-3.5 h-3.5" />
                            Customer ID
                          </div>
                          <span className="font-medium text-gray-900 font-mono text-sm">{order.userId.slice(0, 8)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <IndianRupee className="w-3.5 h-3.5" />
                            Total Amount
                          </div>
                          <span className="font-bold text-lg text-gray-900 tracking-tight">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5" />
                            Order Date
                          </div>
                          <span className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm shrink-0">
                      <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full sm:w-auto border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer appearance-none shrink-0"
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 bg-white">
                  <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-wider">
                    <Package className="w-4 h-4 text-indigo-500" />
                    Items ({order.items.length})
                  </h3>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {order.items.map(item => (
                      <div key={item.id} className="group relative border border-gray-100 bg-white rounded-xl p-5 hover:border-indigo-100 hover:shadow-md transition-all duration-200">
                        <div className="flex flex-col sm:flex-row gap-5">

                          {/* Item Image / Thumbnail */}
                          <div className="flex-shrink-0 relative">
                            <div className="w-full sm:w-28 h-28 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden group-hover:border-indigo-100 transition-colors">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  className="w-full h-full object-contain p-2"
                                  alt="Product design"
                                />
                              ) : (
                                <Package className="w-8 h-8 text-gray-300" />
                              )}
                            </div>
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-gray-900 text-white text-xs font-bold rounded-full shadow-sm ring-2 ring-white">
                              ×{item.quantity}
                            </span>
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Custom Product</h4>
                                  <p className="text-xs text-gray-500 font-mono bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100">Size ID: {item.sizeId.slice(0, 12)}...</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">₹{item.price.toLocaleString()} each</p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {item.pdfUrl && (
                                <div className="pt-2">
                                  <a
                                    href={item.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Print PDF
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Vendor Assignment Section */}
                            <div className="mt-5 pt-4 border-t border-gray-100">
                              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-gray-400" />
                                Vendor Assignment
                              </label>

                              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <div className="relative flex-1 w-full">
                                  <select
                                    defaultValue={item.vendorId || ""}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
                                    onChange={(e) => {
                                      const selectedVendor = vendors.find(v => v.id === e.target.value);
                                      if (selectedVendor) {
                                        openAssignmentModal(
                                          item.id,
                                          e.target.value,
                                          selectedVendor.name,
                                          `Item ${item.sizeId.slice(0, 8)}...`
                                        );
                                      }
                                    }}
                                  >
                                    <option value="">Choose a vendor to fulfill this item...</option>
                                    {vendors.map(v => (
                                      <option key={v.id} value={v.id}>
                                        {v.name} ({v.email})
                                      </option>
                                    ))}
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </div>

                                {assigning === item.id && (
                                  <div className="flex justify-center shrink-0">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-700"></div>
                                      Assigning...
                                    </div>
                                  </div>
                                )}
                              </div>

                              {item.vendor && (
                                <div className="mt-3 p-3 bg-green-50/50 rounded-lg border border-green-100 flex items-center justify-between group/vendor">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                      <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Assigned to:</span>
                                    <span className="text-sm font-bold text-gray-900">{item.vendor.name}</span>
                                  </div>
                                  <Link
                                    href={`/admin/vendors/${item.vendor.id}`}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-2.5 py-1.5 rounded-md border border-indigo-100 transition-colors flex items-center gap-1.5 opacity-0 sm:opacity-100 group-hover/vendor:opacity-100 focus:opacity-100"
                                  >
                                    View Profile
                                  </Link>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Confirmation Modal */}
      {assignmentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Vendor Assignment</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to assign <span className="font-medium text-indigo-600">{assignmentModal.itemName}</span> to <span className="font-medium text-indigo-600">{assignmentModal.vendorName}</span>?
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={confirmAssignment}
                    disabled={assigning === assignmentModal.orderItemId}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {assigning === assignmentModal.orderItemId ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Confirm Assignment
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeAssignmentModal}
                    disabled={assigning === assignmentModal.orderItemId}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
