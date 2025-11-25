// src/components/CTACardsSection.tsx
'use client';

import Link from 'next/link';

const CTACardsSection = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request a Demo Card */}
          <Link href="/request-demo" className="group w-full">
            <div className="bg-gray-200 hover:bg-gray-300 transition-colors duration-300 rounded p-4 h-40 flex items-start justify-between">
              <h3 className="text-5xl font-medium text-black">
                Request a Demo
              </h3>
              <svg 
                className="w-12 h-12 text-black group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0 ml-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>

          {/* Start Building Card */}
          <Link href="/get-started" className="group w-full">
            <div className="bg-black hover:bg-gray-800 transition-colors duration-300 rounded p-4 h-40 flex items-start justify-between">
              <h3 className="text-5xl font-medium text-white">
                Start Building
              </h3>
              <svg 
                className="w-12 h-12 text-white group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0 ml-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTACardsSection;