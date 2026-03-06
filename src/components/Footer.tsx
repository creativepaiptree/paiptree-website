// src/components/Footer.tsx
import Link from 'next/link';

const footerLinks = [
  {
    title: 'COMPANY',
    items: [
      { label: 'About',    href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Culture',  href: '/culture' },
      { label: 'Careers',  href: '/careers' },
    ],
  },
  {
    title: 'PRODUCT',
    items: [
      { label: 'FarmersMind', href: '#' },
      { label: 'TmS',         href: '/tms' },
      { label: '3D Matrix',   href: '/PoC' },
      { label: 'API',         href: '#' },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      { label: 'Blog',          href: '/blog' },
      { label: 'Newsroom',      href: '/newsroom' },
      { label: 'Documentation', href: '#' },
    ],
  },
  {
    title: 'LEGAL',
    items: [
      { label: 'Privacy Policy',   href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Contact Us',       href: '#' },
    ],
  },
];

const Footer = () => (
  <footer className="py-16" style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-line)' }}>
    <div className="container-max px-6">
      {/* Logo & Description */}
      <div className="mb-12">
        <Link
          href="/"
          className="text-xl font-gmarket inline-block mb-4"
          style={{ fontWeight: 700, color: 'var(--color-accent)' }}
        >
          paiptree.
        </Link>
        <p className="type-body-s max-w-xs" style={{ color: 'var(--color-text-dim)' }}>
          AI 기반 스마트 양계 플랫폼으로<br />농장부터 유통까지 연결합니다.
        </p>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {footerLinks.map(({ title, items }) => (
          <div key={title}>
            <h4 className="type-label mb-4" style={{ color: 'var(--color-text-dim)', letterSpacing: '0.1em' }}>
              {title}
            </h4>
            <ul className="space-y-2">
              {items.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="type-body-s transition-colors duration-200 hover:text-white"
                    style={{ color: 'var(--color-text-sub)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderTop: '1px solid var(--color-line)' }}>
        <p className="type-label" style={{ color: 'var(--color-text-dim)' }}>
          © 2026 Paiptree Inc. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Instagram', 'LinkedIn', 'GitHub'].map((name) => (
            <Link key={name} href="#" className="type-label transition-colors duration-200 hover:text-white" style={{ color: 'var(--color-text-sub)' }}>
              {name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
