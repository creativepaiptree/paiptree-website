import Header from '@/components/Header';
import VideoHeroSection from '@/components/VideoHeroSection';
import InfiniteCarouselSection from '@/components/InfiniteCarouselSection';
import CreativeUsecasesSection from '@/components/CreativeUsecasesSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import PartnersSection from '@/components/PartnersSection';
import NewsSection from '@/components/NewsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-black overflow-x-hidden">
      <Header />
      <main>
        <VideoHeroSection />
        <InfiniteCarouselSection />
        <CreativeUsecasesSection />
        <CaseStudiesSection />
        <PartnersSection />
        <NewsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}