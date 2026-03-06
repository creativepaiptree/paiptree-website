// src/components/CTACardsSection.tsx
import Link from 'next/link';

const ctas = [
  {
    href: '/services',
    label: '서비스 살펴보기',
    bg: 'var(--color-light-bg-alt)',
    text: 'var(--color-light-text)',
    border: 'var(--color-light-line)',
  },
  {
    href: '/careers',
    label: '함께 만들어가기',
    bg: 'var(--color-light-text)',
    text: 'var(--color-light-bg)',
    border: 'var(--color-light-text)',
  },
];

const CTACardsSection = () => (
  <section className="py-0" style={{ background: 'var(--color-light-bg-alt)' }}>
    <div className="container-max px-6 py-16">
      <div className="flex items-center gap-3 mb-12">
        <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>/06</span>
        <span className="w-6 h-px" style={{ background: 'var(--color-light-line)' }} />
        <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>GET STARTED</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ border: '1px solid var(--color-light-line)' }}>
        {ctas.map(({ href, label, bg, text, border }) => (
          <Link
            key={href}
            href={href}
            className="group flex p-10 md:p-14 items-end justify-between transition-colors duration-200"
            style={{ background: bg, borderRight: `1px solid ${border}`, minHeight: '200px' }}
          >
            <h3 className="type-heading-m leading-none" style={{ color: text }}>{label}</h3>
            <svg
              className="flex-shrink-0 ml-4 transition-transform duration-200 group-hover:translate-x-1"
              width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: text }}
            >
              <path strokeLinecap="square" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CTACardsSection;