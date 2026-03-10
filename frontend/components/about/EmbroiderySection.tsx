import Image from "next/image";

export default function EmbroiderySection() {
  return (
    <section className="bg-[#939393] py-10 md:py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        {/* Desktop Layout */}
<div className="hidden md:grid grid-cols-2 gap-12 lg:gap-16 items-center">
  {/* Content */}
  <div>
    <h2 className="text-[#333333] text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
      Create your own embroidery design
    </h2>
    <p className="text-[#333333] text-lg mb-8">
      Choose a product and have it embroidered with your own idea.
    </p>
    <button className="bg-transparent border-2 border-[#333333] text-[#333333] px-8 py-3.5 rounded-full text-base font-medium hover:bg-[#333333] hover:text-white transition-colors">
      Create now
    </button>
  </div>

  {/* Image */}
  <div className="w-full flex justify-center">
    <Image
      src="/cap-man.png"
      alt="Custom embroidered cap"
      width={720}
      height={570}
      className="w-full max-w-[720px] h-auto"
    />
  </div>
</div>


        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Content */}
          <div className="mb-7 flex flex-col items-center text-center gap-0">
            <h2 className="text-[#333333] text-start text-4xl font-bold leading-tight mb-4">
              Create your own embroidery design
            </h2>
            <p className="text-[#333333] text-start text-base mb-2">
              Choose a product and have it embroidered with your own idea.
            </p>
            <button className="bg-transparent border-2 border-[#333333] text-[#333333] px-5 py-3 rounded-full text-base font-medium hover:bg-[#333333] hover:text-white transition-colors">
              Create now
            </button>
          </div>

          {/* Image */}
          <div>
            <Image
              src="/cap-man.png"
              alt="Custom embroidered cap"
              width={300}
              height={310}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
