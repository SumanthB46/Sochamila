"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPendingVendorsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to vendors page with pending filter
    router.push("/admin/vendors?status=PENDING");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading pending vendors...</p>
      </div>
    </div>
  );
}