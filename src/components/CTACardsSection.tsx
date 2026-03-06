// src/components/CTACardsSection.tsx
import Link from 'next/link';

const ctas = [
  { href: '/services', label: '서비스 살펴보기', bg: 'bg-gray-100 hover:bg-gray-200', text: 'text-black' },
  { href: '/careers',  label: '함께 만들어가기',  bg: 'bg-black hover:bg-gray-900',   text: 'text-white' },
];

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CTACardsSection = () => (
  <section className="py-12 bg-white">
    <div className="container-max px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ctas.map(({ href, label, bg, text }) => (
          <Link key={href} href={href} className="group">
            <div className={`${bg} ${text} transition-colors duration-300 p-6 h-40 flex items-start justify-between`}>
              <h3 className="text-4xl md:text-5xl font-medium leading-tight">{label}</h3>
              <ArrowIcon className="w-10 h-10 flex-shrink-0 ml-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CTACardsSection;