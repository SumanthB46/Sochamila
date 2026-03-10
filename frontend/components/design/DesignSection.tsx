"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles, ChevronRight, Star, ShoppingCart, ArrowRight } from "lucide-react";

export default function DesignSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Jersey");
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});

  /* ================= DATA ================= */
  const categories = [
    { img: "/jersey.webp", name: "Jersey", id: "jersey" },
    { img: "/cap.png", name: "Caps", id: "caps" },
    { img: "/1.webp", name: "Sweatshirts", id: "sweatshirts" },
    { img: "/3.jpeg", name: "Bottle", id: "bottle" },
    { img: "/5.webp", name: "Tote Bags", id: "tote" },
    { img: "/hoodie.jpg", name: "Hoodies", id: "hoodies" },
    { img: "/sticker.jpg", name: "Stickers", id: "stickers" },
  ];

  const products = [
    { title: "Bella + Canvas Sweatshirt", desc: "Holly Jolly Vibes", img: "/1.webp", price: "₹631.99", rating: 4.8, reviews: 245, id: "p1" },
    { title: "Kids Longsleeve Shirt", desc: "Stay at Hogwarts", img: "/2.webp", price: "₹429.99", rating: 4.6, reviews: 182, id: "p2" },
    { title: "Caps", desc: "Christmasbear Embroidered", img: "/cap.png", price: "₹726.99", rating: 4.9, reviews: 328, id: "p3" },
    { title: "Jersey", desc: "Official Cookie Tester", img: "/jersey.webp", price: "₹621.99", rating: 4.7, reviews: 215, id: "p4" },
    { title: "Tote Bag", desc: "Nice for Christmas?", img: "/5.webp", price: "₹551.99", rating: 4.5, reviews: 167, id: "p5" },
  ];

  const handleAddToCart = (productId: string) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  /* ================= AUTO SCROLL (DESKTOP ONLY) ================= */
  useEffect(() => {
    if (window.innerWidth < 768) return;

    const interval = setInterval(() => {
      if (!isHovering && scrollRef.current) {
        const el = scrollRef.current;
        el.scrollLeft += 1;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollLeft = 0;
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isHovering]);

  /* ================= FAKE LOADING ================= */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // Navigate to editor with selected category
    window.location.href = `/editor?category=${categoryName.toLowerCase()}`;
  };

  return (
    <section className="w-full bg-linear-to-b from-white via-gray-50 to-white">
      {/* ================= HERO BANNER ================= */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 pt-8 sm:pt-12 md:pt-16 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-xs sm:text-sm font-semibold text-amber-600 uppercase tracking-wider">Create & Design</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
          Design Your <span className="bg-linear-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Own Products</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mb-6">
          Choose from our collection of premium products and customize them with your unique designs. Express yourself with every creation.
        </p>
      </div>

      {/* ================= CREATE YOUR DESIGN ================= */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Choose Your Product
          </h2>
          <Link href="/products" className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 transition">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Carousel */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-4 scroll-smooth"
        >
          {(loading ? Array(7).fill(null) : categories).map((item, i) => (
            <button
              key={i}
              onClick={() => !loading && handleCategoryClick(item.name)}
              className="group flex flex-col items-center flex-shrink-0 cursor-pointer transition-all duration-300 focus:outline-none"
              disabled={loading}
            >
              <div
                className={`
                  relative
                  w-24 h-24
                  sm:w-32 sm:h-32
                  md:w-40 md:h-40
                  rounded-2xl overflow-hidden
                  bg-white
                  ring-2
                  transition-all duration-300
                  ${selectedCategory === item?.name 
                    ? 'ring-teal-500 shadow-lg -translate-y-1' 
                    : 'ring-gray-200 shadow-sm hover:ring-teal-400 hover:shadow-md hover:-translate-y-1'
                  }
                `}
              >
                {loading ? (
                  <div className="w-full h-full bg-linear-to-r from-gray-200 to-gray-300 animate-pulse" />
                ) : (
                  <>
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="object-cover scale-100 transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </>
                )}
              </div>

              <span
                className={`
                  mt-3 px-3 py-1.5 rounded-full
                  text-xs sm:text-sm font-semibold
                  transition-all duration-300
                  ${selectedCategory === item?.name
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-100 text-gray-700 group-hover:bg-teal-50 group-hover:text-teal-600'
                  }
                `}
              >
                {loading ? "" : item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= BESTSELLERS ================= */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Bestsellers
            </h2>
            <p className="text-sm text-gray-600">Most loved by our customers</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex text-sm text-teal-600 hover:text-teal-700 font-semibold items-center gap-1 transition"
          >
            Show all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Carousel */}
        <div
          ref={productsScrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
        >
          {(loading ? Array(6).fill(null) : [...products, ...products]).map(
            (product, i) => (
              <div
                key={i}
                className="
                  flex-shrink-0
                  w-48 sm:w-56 md:w-64
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  shadow-sm
                  transition-all duration-300
                  hover:shadow-2xl
                  hover:-translate-y-2
                  border border-gray-100
                  group
                "
              >
                {/* Image Container */}
                <div className="relative h-40 sm:h-48 md:h-56 bg-gray-50 overflow-hidden">
                  {loading ? (
                    <div className="w-full h-full bg-linear-to-r from-gray-200 to-gray-300 animate-pulse" />
                  ) : (
                    <>
                      <Image
                        src={product.img}
                        alt={product.title}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                        New
                      </div>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="px-4 py-4 space-y-3">
                  {loading ? (
                    <>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2">
                        {product.title}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array(5).fill(null).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < Math.round(product.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({product.reviews})</span>
                      </div>

                      {/* Description & Price */}
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {product.desc}
                      </p>
                      <p className="text-lg font-bold text-teal-600">
                        {product.price}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link
                          href={`/editor?product=${product.id}`}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-3 rounded-lg transition text-center text-sm flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span className="hidden sm:inline">Design</span>
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="flex-1 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {cartItems[product.id] ? cartItems[product.id] : ""}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Show all on mobile */}
        <Link
          href="/products"
          className="sm:hidden flex justify-center mt-6 w-full bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl transition text-center"
        >
          View All Products <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* ================= CTA SECTION ================= */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12">
        <div className="relative bg-linear-to-r from-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Create?
            </h3>
            <p className="text-sm sm:text-base text-white/90 mb-6 max-w-xl">
              Start designing your custom products today. Choose a product, unleash your creativity, and get exactly what you want.
            </p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-teal-600 font-bold px-6 sm:px-8 py-3 rounded-lg transition"
            >
              Start Designing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
