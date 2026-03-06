// src/components/CaseStudiesSection.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

const CaseStudiesSection = () => {
  return (
    <section className="py-24" style={{ background: 'var(--color-light-bg-alt)' }}>
      <div className="container-max px-6">
        <div className="grid md:grid-cols-2 gap-0" style={{ border: '1px solid var(--color-light-line)' }}>
          {/* Left Image */}
          <div className="w-full h-80 md:h-[480px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
              alt="Paiptree team"
              width={2070}
              height={480}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Content */}
          <div
            className="p-12 md:p-16 flex flex-col justify-center"
            style={{ background: 'var(--color-light-bg)', borderLeft: '1px solid var(--color-light-line)' }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>/03</span>
              <span className="w-6 h-px" style={{ background: 'var(--color-light-line)' }} />
              <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>MISSION</span>
            </div>

            <h2 className="type-heading-m mb-6" style={{ color: 'var(--color-light-text)' }}>
              농업의 미래,<br />아직 만들어야 할 것들이 많습니다
            </h2>
            <p className="type-body mb-10" style={{ color: 'var(--color-light-text-sub)' }}>
              Paiptree는 AI와 데이터로 양계 산업의 생산·물류·품질 의사결정을 자동화합니다.
            </p>
            <Link href="/about" className="btn-site-link" style={{ color: 'var(--color-light-text-sub)' }}>
              자세히 보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
