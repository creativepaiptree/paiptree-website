import Header from '@/components/Header';
import VideoHeroSection from '@/components/VideoHeroSection';
import CreativeUsecasesSection from '@/components/CreativeUsecasesSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import PartnersSection from '@/components/PartnersSection';
import NewsSection from '@/components/NewsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      <main>
        <VideoHeroSection />
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