import Header from '@/components/Header';
import VideoHeroSection from '@/components/VideoHeroSection';
import StatsSection from '@/components/StatsSection';
import InfiniteCarouselSection from '@/components/InfiniteCarouselSection';
import PlatformSection from '@/components/PlatformSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import PartnersSection from '@/components/PartnersSection';
import NewsSection from '@/components/NewsSection';
import CTACardsSection from '@/components/CTACardsSection';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function AboutPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
        <Header />
        <main>
          <VideoHeroSection />
          <StatsSection />
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