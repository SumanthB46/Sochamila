"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrderSuccessPage() {
  const router = useRouter();

  // Optional: Clear any cart or checkout state here if needed

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600">
          Thank you for your order. We've received your custom design request and will start processing it shortly.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
        <div className="text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-teal-600 text-sm font-semibold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Order Confirmation</p>
              <p className="text-sm text-gray-600">
                You'll receive an email confirmation with your order details.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-teal-600 text-sm font-semibold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Design Review</p>
              <p className="text-sm text-gray-600">
                Our team will review your custom design for printability.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-teal-600 text-sm font-semibold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Production & Shipping</p>
              <p className="text-sm text-gray-600">
                Once approved, we'll produce and ship your order within 7-10 business days.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => router.push("/orders")}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          View My Orders
        </button>
        <button
          onClick={() => router.push("/products")}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}