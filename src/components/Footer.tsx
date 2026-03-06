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
  <footer className="py-12" style={{ background: 'var(--bg-secondary)' }}>
    <div className="container-max px-6">
      {/* Logo & Description */}
      <div className="mb-12">
        <Link
          href="/"
          className="text-2xl font-gmarket inline-block mb-4"
          style={{ fontWeight: 700, color: 'var(--accent)' }}
        >
          paiptree.
        </Link>
        <p className="body-md max-w-md" style={{ color: 'var(--text-secondary)' }}>
          AI 기반 스마트 양계 플랫폼으로 농장부터 유통까지 연결합니다.
        </p>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {footerLinks.map(({ title, items }) => (
          <div key={title}>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h4>
            <ul className="space-y-3">
              {items.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="body-sm hover:text-white transition-colors duration-200"
                    style={{ color: 'var(--text-secondary)' }}
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
      <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="body-sm" style={{ color: 'var(--text-muted)' }}>
          © 2026 Paiptree Inc. All Rights Reserved.
        </p>
        <div className="flex items-center gap-4">
          {['Instagram', 'LinkedIn', 'GitHub'].map((name) => (
            <Link key={name} href="#" className="body-sm hover:text-white transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
              {name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
