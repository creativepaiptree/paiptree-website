'use client';

import { useState } from 'react';
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
      <nav className="glass-card px-6 py-4 container-max">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-gmarket" style={{ fontWeight: 700, color: '#00ABE6' }}>
              paiptree.
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link body-md font-medium transition-all duration-300 ${
                  isActiveMenu(item.href) 
                    ? 'nav-link-active' 
                    : 'text-gradient-hover'
                }`}
              >
                {t(`header.nav.${item.label.toLowerCase()}`)}
              </a>
            ))}
            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                }`}></span>
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/20">
            <div className="space-y-4">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block nav-link body-md font-medium transition-all duration-300 ${
                    isActiveMenu(item.href) 
                      ? 'nav-link-active' 
                      : 'text-gradient-hover'
                  }`}
                >
                  {t(`header.nav.${item.label.toLowerCase()}`)}
                </a>
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