'use client';

import LanguageToggle from './LanguageToggle';

export default function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <nav className="px-6 py-4 container-max">
        <div className="flex items-center justify-between">
          {/* Logo + Blog Label */}
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-gmarket hover:opacity-80 transition-opacity" style={{ fontWeight: 700, color: '#00ABE6' }}>
              paiptree.
            </a>
            <span className="text-base font-medium" style={{ color: '#9CA3AF' }}>
              Blog
            </span>
          </div>

          {/* Language Toggle */}
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
