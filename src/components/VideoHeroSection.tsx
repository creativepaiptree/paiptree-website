// src/components/VideoHeroSection.tsx
import Button from './ui/Button';

const VideoHeroSection = () => {
  return (
    <section className="relative h-screen flex items-center overflow-hidden" 
             style={{
               backgroundImage: 'url("https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop")',
               backgroundSize: 'cover',
               backgroundPosition: 'center right',
               backgroundRepeat: 'no-repeat'
             }}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6 text-white tracking-tight">
            We'll help you make it like nobody's business.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
            No creative challenge too big, no timeline too tight. Get to production with paiptree., your enterprise-ready creative partner.
          </p>
          <div>
            <Button size="lg" variant="primary" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90">
              Let's get started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHeroSection;
