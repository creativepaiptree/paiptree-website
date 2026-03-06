// src/components/PartnersSection.tsx
'use client';

import Image from 'next/image';

const PartnersSection = () => {
  const partnerLogos = [
    { name: '디캠프', src: '/partners/1.디캠프.png', width: 240 },
    { name: '아산나눔재단', src: '/partners/2.아산나눔재단.png', width: 280 },
    { name: '건국대학교', src: '/partners/3.건국대학교.png', width: 260 },
    { name: 'kcav', src: '/partners/4.kcav.png', width: 200 },
    { name: '씨제이', src: '/partners/5.씨제이.png', width: 240 },
    { name: 'sk', src: '/partners/6.sk.png', width: 210 },
    { name: '체리부로', src: '/partners/7.체리부로.png', width: 240 },
    { name: 'KGB', src: '/partners/8.KGB.png', width: 200 },
    { name: '신우', src: '/partners/9.신우.png', width: 200 },
    { name: '금화', src: '/partners/10.금화.png', width: 220 },
    { name: '아임닭', src: '/partners/11.아임닭.png', width: 200 },
    { name: '한라씨에프엔', src: '/partners/12.한라씨에프엔.png', width: 280 },
    { name: '아프', src: '/partners/13.아프.png', width: 180 },
    { name: '창젠', src: '/partners/14.창젠.png', width: 200 },
    { name: '니폰산소', src: '/partners/15.니폰산소.png', width: 240 },
    { name: '크라운', src: '/partners/16.크라운.png', width: 220 },
    { name: '인비소', src: '/partners/17.인비소.png', width: 200 },
    { name: '동서', src: '/partners/18.동서.png', width: 180 },
    { name: '에임비랩', src: '/partners/19.에임비랩.png', width: 240 },
    { name: '금계', src: '/partners/20.금계.png', width: 200 },
  ];

  return (
    <section className="py-20 overflow-hidden" style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-line)' }}>
      <div className="container-max px-6 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/04</span>
          <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
          <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>PARTNERS</span>
        </div>
        <h3 className="type-heading-m" style={{ color: 'var(--color-text)' }}>Global Partners</h3>
      </div>

      {/* Partners Carousel — edge fade */}
      <div
        className="relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-x-12 infinite-scroll opacity-50" aria-label="파트너사 목록">
          {[...partnerLogos, ...partnerLogos].map((logo, index) => (
            <Image
              key={`${logo.name}-${index}`}
              src={logo.src}
              alt={`${logo.name} logo`}
              width={logo.width * 0.8}
              height={80}
              style={{ filter: 'brightness(0) invert(1)' }}
              className="h-auto flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
