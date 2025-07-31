import Header from '@/components/Header';
import VideoHeroSection from '@/components/VideoHeroSection';
import InfiniteCarouselSection from '@/components/InfiniteCarouselSection';
import PlatformSection from '@/components/PlatformSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import PartnersSection from '@/components/PartnersSection';
import NewsSection from '@/components/NewsSection';
import CTACardsSection from '@/components/CTACardsSection';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function Home() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100 text-black overflow-x-hidden">
        <Header />
        <main>
          <VideoHeroSection />
          <InfiniteCarouselSection />
          <PlatformSection />
          <CaseStudiesSection />
          <PartnersSection />
          <NewsSection />
          <CTACardsSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}