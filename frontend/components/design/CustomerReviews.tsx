"use client";

export default function CustomerReviews() {
  return (
    <section className="w-full bg-gray-50 px-6 md:px-12 lg:px-20 py-16">
      <h2 className="text-xl font-semibold text-center mb-10">
        What our customers are saying
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          "Fantastic quality and fast delivery!",
          "Easy to design and excellent print finish.",
          "Best custom merchandise platform so far.",
        ].map((review, i) => (
          <div
            key={i}
            className="
              bg-white p-6 rounded-lg border
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="text-green-500 mb-2">
              ★★★★★
            </div>

            <p className="text-sm text-gray-700">
              {review}
            </p>

            <p className="text-xs text-gray-500 mt-3">
              Verified Customer
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
