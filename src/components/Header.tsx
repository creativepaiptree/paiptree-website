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
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="container-max px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-gmarket hover:opacity-80 transition-opacity"
            style={{ fontWeight: 700, color: 'var(--accent)' }}
          >
            paiptree.
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link text-sm font-medium transition-colors duration-200 ${
                  isActiveMenu(item.href)
                    ? 'nav-link-active'
                    : 'hover:text-white'
                }`}
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
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <div className="space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-sm font-medium transition-colors duration-200 ${
                    isActiveMenu(item.href)
                      ? 'nav-link-active'
                      : 'text-white/60 hover:text-white'
                  }`}
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