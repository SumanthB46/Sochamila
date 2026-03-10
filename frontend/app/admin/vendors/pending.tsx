export default function VendorPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">

        <h2 className="text-2xl font-bold mb-3">
          KYC Under Verification
        </h2>

        <p className="text-gray-600 mb-6">
          Your vendor account is currently under admin review.
          You will be notified once approved.
        </p>

        <p className="text-sm text-indigo-600 font-semibold">
          Status: Pending
        </p>
      </div>
    </div>
  );
}
