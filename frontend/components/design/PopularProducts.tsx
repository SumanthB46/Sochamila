"use client";

import Image from "next/image";
import Link from "next/link";

export default function PopularProducts() {
  return (
    <section className="w-full bg-white px-6 md:px-12 lg:px-20 py-16 text-center">
      <h2 className="text-xl font-semibold mb-10">
        Our Most Popular Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
        {[
          "/popular/1.jpeg",
          "/popular/2.jpeg",
          "/popular/4.jpeg",
          "/popular/5.jpeg",
          "/popular/6.jpeg",
        ].map((img, i) => (
          <div key={i} className="group cursor-pointer">
            <div
              className="
                w-full h-[180px] bg-gray-100 rounded-md overflow-hidden
                transition-all duration-300
                group-hover:shadow-md
              "
            >
              <Image
                src={img}
                alt="Popular product"
                width={220}
                height={220}
                className="
                  w-full h-full object-contain
                  transition-transform duration-300
                  group-hover:scale-105
                "
              />
            </div>

            <p
              className="
                text-xs text-gray-600 mt-3
                transition-colors
                group-hover:text-teal-600
              "
            >
              Oversized Heavyweight T-Shirt
            </p>
          </div>
        ))}
      </div>

      <Link
        href="#"
        className="
          inline-block mt-10 px-6 py-2
          bg-teal-600 text-white text-sm rounded
          hover:bg-teal-700 transition
        "
      >
        See more
      </Link>
    </section>
  );
}
