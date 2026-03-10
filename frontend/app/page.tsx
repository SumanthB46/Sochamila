import HeroSection from "@/components/hero/HeroSection";
import DesignSection from "@/components/design/DesignSection";
import AboutSection from "@/components/about/AboutSection";
import EmbroiderySection from "@/components/about/EmbroiderySection";
import CustomerReviews from "@/components/design/CustomerReviews";
import PopularProducts from "@/components/design/PopularProducts";
import TrendingSection from "@/components/design/TrendingSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DesignSection />     
      <PopularProducts />
      <AboutSection />
      <TrendingSection />
      <EmbroiderySection />
      <CustomerReviews />
    </>
  );
}
