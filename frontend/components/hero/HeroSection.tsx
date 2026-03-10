"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Snowfall from "react-snowfall";

const banners = [
  {
    img: "/hero.jpg",
    title: "MAKE YOUR BEST DESIGN",
    subtitle: "Creativity without limits",
  },
  {
    img: "/hero.jpg",
    title: "EXPRESS YOUR STYLE",
    subtitle: "Design what you imagine",
  },
  {
    img: "/hero.jpg",
    title: "UNLOCK YOUR CREATIVITY",
    subtitle: "Your ideas, your way",
  },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const current = banners[index];

  return (
    <section
      className="
        relative w-full 
        h-[40vh] sm:h-[50vh] md:h-[90vh]
        overflow-hidden flex items-center
      "
    >
      {/* Snow Effect */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Snowfall snowflakeCount={220} />
      </div>

      {/* Background Image */}
      <Image
        src={current.img}
        alt="Hero Slide"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div
        className="
          relative z-10 px-6 
          md:px-16 lg:px-24 
          mt-10 sm:mt-14 md:mt-40 
          max-w-3xl
        "
      >
        <p className="text-gray-200 text-sm md:text-base mb-2">
          {current.subtitle}
        </p>

        <h1
          className="
            text-xl sm:text-2xl md:text-4xl 
            font-bold text-white mb-6 
            leading-snug
          "
        >
          {current.title}
        </h1>

        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/products")}
            className="px-5 py-2 sm:px-6 sm:py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
          >
            Create Now
          </button>

          <button
            onClick={() => router.push("/products")}
            className="px-5 py-2 sm:px-6 sm:py-3 bg-black/60 text-white border border-white rounded-full font-medium hover:bg-black/80 transition"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Slider Dots */}
      <div className="absolute bottom-3 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition ${
              index === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
