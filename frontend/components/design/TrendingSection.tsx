"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function TrendingSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const products = [
    {
      title: "Bella + Canvas Sweatshirt",
      desc: "Holiday Vibes Edition",
      img: "/1.webp",
      price: "₹399.99",
    },
    {
      title: "Kids Premium Shirt",
      desc: "Hogwarts Fan Art",
      img: "/2.webp",
      price: "₹429.99",
    },
    {
      title: "Embroidered Cap",
      desc: "Christmasbear",
      img: "/3.png",
      price: "₹726.99",
    },
    {
      title: "Full Color Mug",
      desc: "Cookie Tester",
      img: "/4.webp",
      price: "₹621.99",
    },
    {
      title: "Tote Bag",
      desc: "Nice or Naughty?",
      img: "/5.webp",
      price: "₹551.99",
    },
  ];

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering && scrollRef.current) {
        const el = scrollRef.current;
        el.scrollLeft += 0.6;

        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isHovering]);

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });

  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  return (
    <section className="px-6 md:px-12 lg:px-20 py-14 bg-gray-50">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">
            🔥 Trending Right Now
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Designs people are loving today
          </p>
        </div>

        <Link
          href="/products"
          className="text-sm font-medium text-teal-600 hover:underline"
        >
          Explore all
        </Link>
      </div>

      {/* SLIDER */}
      <div className="relative">
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth"
        >
          {[...products, ...products].map((product, i) => (
            <div
              key={i}
              className="
                min-w-[260px]
                bg-white
                rounded-2xl
                overflow-hidden
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              {/* IMAGE */}
              <div className="relative h-[240px] bg-gray-100">
                <Image
                  src={product.img}
                  alt={product.title}
                  fill
                  sizes="260px"
                  className="object-contain p-4"
                />

                {/* BADGE */}
                <span className="
                  absolute top-3 left-3
                  bg-red-500 text-white
                  text-xs font-semibold
                  px-2 py-1 rounded-full
                ">
                  🔥 Trending
                </span>

                {/* HOVER CTA */}
                <div className="
                  absolute inset-0
                  bg-black/50
                  opacity-0
                  flex items-center justify-center
                  transition-opacity duration-300
                  hover:opacity-100
                ">
                  <Link
                    href="/products"
                    className="
                      bg-white text-black
                      px-4 py-2 rounded-lg
                      text-sm font-semibold
                      hover:bg-gray-100 transition
                    "
                  >
                    Customize
                  </Link>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 text-center">
                <h3 className="text-sm font-semibold">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {product.desc}
                </p>
                <p className="text-sm font-semibold text-teal-600 mt-2">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* NAV BUTTONS */}
        <button
          onClick={scrollLeft}
          className="
            hidden md:flex
            absolute left-[-18px] top-1/2 -translate-y-1/2
            w-10 h-10 rounded-full
            bg-white shadow-md
            items-center justify-center
            hover:bg-teal-600 hover:text-white
            transition
          "
        >
          ◀
        </button>

        <button
          onClick={scrollRight}
          className="
            hidden md:flex
            absolute right-[-18px] top-1/2 -translate-y-1/2
            w-10 h-10 rounded-full
            bg-white shadow-md
            items-center justify-center
            hover:bg-teal-600 hover:text-white
            transition
          "
        >
          ▶
        </button>
      </div>
    </section>
  );
}
