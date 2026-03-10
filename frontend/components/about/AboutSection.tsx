import { PenTool, ShoppingBag } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="relative bg-[#9F9576] py-16 md:py-24 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Subtle background depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">

        {/* ================= DESKTOP ================= */}
        <div className="hidden md:flex items-center gap-12 lg:gap-16">

          {/* VIDEO */}
          <div className="md:w-3/5 shrink-0 rounded-2xl overflow-hidden shadow-2xl group">
            <video
              src="/video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="
                w-full h-full object-cover
                transition duration-700 ease-out
                group-hover:scale-[1.03]
              "
            />
          </div>

          {/* CONTENT */}
          <div className="md:w-1/2">

            {/* Intro */}
            <div className="mb-8">
              <span className="
                inline-block mb-3 px-4 py-1
                rounded-full bg-white/80
                text-[#333333] text-sm font-semibold
              ">
                SochaMila Studio
              </span>

              <p className="text-[#333333] text-3xl lg:text-4xl font-bold leading-tight">
                Design, preview, and sell custom T-shirts —
                <br className="hidden lg:block" />
                all in one powerful editor
              </p>

              <p className="mt-4 text-[#333333]/90 max-w-lg">
                Turn your ideas into real products using our easy-to-use
                mockup creator built for creators, brands, and entrepreneurs.
              </p>
            </div>

            {/* FEATURES */}
            <div className="space-y-8 mt-10">

              {/* Feature 1 */}
              <div className="
                flex gap-6 items-start
                p-4 rounded-2xl
                hover:bg-white/20
                transition group
              ">
                <div className="
                  w-14 h-14 rounded-2xl
                  bg-white
                  flex items-center justify-center
                  shadow-md ring-1 ring-black/10
                  transition
                  group-hover:scale-110
                  group-hover:shadow-xl
                ">
                  <PenTool className="w-7 h-7 text-[#333333]" />
                </div>

                <div>
                  <h3 className="text-[#333333] text-xl font-semibold mb-2">
                    Design Your Mockup
                  </h3>
                  <p className="text-[#333333]/90">
                    Upload artwork, add text, or generate AI designs and see
                    real-time previews on high-quality T-shirt mockups.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="
                flex gap-6 items-start
                p-4 rounded-2xl
                hover:bg-white/20
                transition group
              ">
                <div className="
                  w-14 h-14 rounded-2xl
                  bg-white
                  flex items-center justify-center
                  shadow-md ring-1 ring-black/10
                  transition
                  group-hover:scale-110
                  group-hover:shadow-xl
                ">
                  <ShoppingBag className="w-7 h-7 text-[#333333]" />
                </div>

                <div>
                  <h3 className="text-[#333333] text-xl font-semibold mb-2">
                    Customize & Launch
                  </h3>
                  <p className="text-[#333333]/90">
                    Choose colors, sizes, and print placement. Order instantly
                    or publish your design to sell with zero inventory.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4 mt-12">
              <button className="
                bg-[#333333] text-white
                px-9 py-4 rounded-full
                font-semibold shadow-lg
                transition
                hover:scale-105 hover:shadow-xl
              ">
                Start Designing
              </button>

              <button className="
                border-2 border-[#3D3D3D]
                text-[#3D3D3D]
                px-9 py-4 rounded-full
                font-semibold
                transition
                hover:bg-[#333333]
                hover:text-white
                hover:scale-105
              ">
                Browse Products
              </button>
            </div>
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden">

          {/* Intro */}
          <div className="mb-8">
            <span className="
              inline-block mb-2 px-3 py-1
              rounded-full bg-white/80
              text-[#333333] text-xs font-semibold
            ">
              SochaMila Studio
            </span>

            <p className="text-[#333333] text-xl font-bold leading-snug">
              Design and preview custom T-shirts in minutes
            </p>

            <p className="mt-3 text-sm text-[#333333]/90">
              A simple mockup editor to turn your ideas into real products.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-8">

            <div className="flex gap-4 items-start">
              <div className="
                w-12 h-12 rounded-xl
                bg-white flex items-center justify-center
                shadow ring-1 ring-black/10
              ">
                <PenTool className="w-6 h-6 text-[#333333]" />
              </div>
              <div>
                <h3 className="text-[#333333] font-semibold">
                  Design Mockups
                </h3>
                <p className="text-sm text-[#333333]/90">
                  Upload designs or generate AI artwork with live previews.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="
                w-12 h-12 rounded-xl
                bg-white flex items-center justify-center
                shadow ring-1 ring-black/10
              ">
                <ShoppingBag className="w-6 h-6 text-[#333333]" />
              </div>
              <div>
                <h3 className="text-[#333333] font-semibold">
                  Customize & Order
                </h3>
                <p className="text-sm text-[#333333]/90">
                  Choose colors, sizes, and place your order instantly.
                </p>
              </div>
            </div>
          </div>

          {/* VIDEO */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
            <video
              src="/video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto object-cover"
            />
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <button className="
              bg-[#333333] text-white
              flex-1 py-3.5 rounded-full
              font-semibold shadow
              transition hover:scale-105
            ">
              Start Designing
            </button>

            <button className="
              border-2 border-[#3D3D3D]
              text-[#3D3D3D]
              flex-1 py-3.5 rounded-full
              transition
              hover:bg-[#333333]
              hover:text-white
              hover:scale-105
            ">
              View Products
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
