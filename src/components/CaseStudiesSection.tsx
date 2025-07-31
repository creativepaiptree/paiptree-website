// src/components/CaseStudiesSection.tsx
'use client';

import Button from './ui/Button';
import Image from 'next/image';

const CaseStudiesSection = () => {
  return (
    <section className="py-20 bg-gray-300">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Image */}
          <div className="w-full h-80 md:h-96 rounded overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
              alt="Team meeting" 
              width={2070}
              height={400}
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Right Content */}
          <div className="bg-white rounded p-12 shadow-lg h-80 md:h-96 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-black leading-tight">
              There is so much left to build
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Palantirians deliver mission-critical outcomes for the West&apos;s most important institutions.
            </p>
            <Button variant="outline" className="border-black !text-black hover:bg-black hover:!text-white px-6 py-2 text-base">
              LEARN MORE
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
