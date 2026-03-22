import Image from 'next/image';
import { partnerLogos } from '@/content/siteContent';
import SectionEyebrow from './SectionEyebrow';

type PartnersStripProps = {
  number?: string;
  heading: string;
  body?: string;
};

export default function PartnersStrip({
  number = '/06',
  heading,
  body,
}: PartnersStripProps) {
  return (
    <section
      className="py-24 overflow-hidden"
      style={{
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-line)',
      }}
    >
      <div className="container-max px-6 mb-12">
        <SectionEyebrow number={number} label="PARTNERS" className="mb-6" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <h2
            className="type-heading-l whitespace-pre-line"
            style={{ color: 'var(--color-text)', maxWidth: '18ch' }}
          >
            {heading}
          </h2>
          {body ? (
            <p
              className="type-body"
              style={{ color: 'var(--color-text-sub)', maxWidth: '40rem' }}
            >
              {body}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="relative"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-x-12 infinite-scroll opacity-50" aria-label="파트너사 목록">
          {[...partnerLogos, ...partnerLogos].map((logo, index) => (
            <Image
              key={`${logo.name}-${index}`}
              src={logo.src}
              alt={`${logo.name} 로고`}
              width={logo.width * 0.8}
              height={72}
              style={{ filter: 'brightness(0) invert(1)' }}
              className="h-auto flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
