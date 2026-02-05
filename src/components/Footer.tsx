// src/components/Footer.tsx
'use client';

import Link from 'next/link';

const Footer = () => {
  const footerSections = {
    'COMPANY': [
      'About',
      'Services',
      'Culture',
      'Careers'
    ],
    'PRODUCT': [
      'Platform',
      'Features',
      'Pricing',
      'API',
      '3d matrix'
    ],
    'RESOURCES': [
      'Blog',
      'Newsroom',
      'Documentation',
      'Support'
    ],
    'LEGAL': [
      'Privacy Policy',
      'Terms of Service',
      'Contact Us'
    ]
  };

  return (
    <footer className="py-12 px-6" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-max">
        {/* Logo & Description */}
        <div className="mb-12">
          <Link href="/" className="text-2xl font-gmarket inline-block mb-4" style={{ fontWeight: 700, color: '#00ABE6' }}>
            paiptree.
          </Link>
          <p className="body-md max-w-md" style={{ color: 'var(--text-secondary)' }}>
            AI 기반 스마트 양계 플랫폼으로 농장부터 유통까지 연결합니다.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={link === '3d matrix' ? '/3d_matrix/' : '#'}
                      className="body-sm hover:text-white transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link}
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
            © 2025 Paiptree Inc. All Rights Reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link href="#" className="body-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Instagram
            </Link>
            <Link href="#" className="body-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
              LinkedIn
            </Link>
            <Link href="#" className="body-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
