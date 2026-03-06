'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationItem } from '@/types';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

const navigationItems: NavigationItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Culture', href: '/culture' },
  { label: 'Blog', href: '/blog' },
  { label: 'Newsroom', href: '/newsroom' },
  { label: 'Careers', href: '/careers' }
];

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // 활성 메뉴 확인 함수
  const isActiveMenu = (href: string) => {
    if (href === '/about') {
      return pathname === '/about' || pathname === '/';
    }
    return pathname === href;
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        background: 'rgba(5,5,5,0.85)',
        borderBottom: '1px solid var(--color-line-mid)',
      }}
    >
      <nav className="container-max px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-gmarket hover:opacity-75 transition-opacity"
            style={{ fontWeight: 700, color: 'var(--color-accent)' }}
          >
            paiptree.
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="type-body-s transition-colors duration-200"
                style={{
                  color: isActiveMenu(item.href) ? 'var(--color-accent)' : 'var(--color-text-sub)',
                }}
                onMouseEnter={e => { if (!isActiveMenu(item.href)) (e.target as HTMLElement).style.color = 'var(--color-text)'; }}
                onMouseLeave={e => { if (!isActiveMenu(item.href)) (e.target as HTMLElement).style.color = 'var(--color-text-sub)'; }}
              >
                {t(`header.nav.${item.label.toLowerCase()}`)}
              </Link>
            ))}
            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
              <span className={`bg-white block transition-all duration-300 ease-out h-px w-6 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`bg-white block transition-all duration-300 ease-out h-px w-6 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`bg-white block transition-all duration-300 ease-out h-px w-6 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4" style={{ borderTop: '1px solid var(--color-line-mid)' }}>
            <div className="space-y-3 pt-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block type-body-s transition-colors duration-200"
                  style={{ color: isActiveMenu(item.href) ? 'var(--color-accent)' : 'var(--color-text-sub)' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(`header.nav.${item.label.toLowerCase()}`)}
                </Link>
              ))}
              <div className="pt-2">
                <LanguageToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}