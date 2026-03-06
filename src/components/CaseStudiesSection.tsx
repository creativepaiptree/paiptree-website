// src/components/CaseStudiesSection.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

const CaseStudiesSection = () => {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container-max px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Image */}
          <div className="w-full h-80 md:h-96 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
              alt="Paiptree team"
              width={2070}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Content */}
          <div className="bg-white p-12 h-80 md:h-96 flex flex-col items-start justify-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-6 text-black leading-tight">
              농업의 미래,<br />아직 만들어야 할 것들이 많습니다
            </h2>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
              Paiptree는 AI와 데이터로 양계 산업의 생산·물류·품질 의사결정을 자동화합니다.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-black text-black text-sm px-6 py-2.5 hover:bg-black hover:text-white transition-colors duration-200"
            >
              자세히 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
