'use client';

import { useState, useEffect } from 'react';
import Button from './ui/Button';
import { NavigationItem } from '@/types';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderProps {
  className?: string;
}

const navigationItems: NavigationItem[] = [
  { label: 'Products', href: '/stable-image' },
  { label: 'Research', href: '/research' },
  { label: 'News', href: '/news' },
  { label: 'Partners', href: '/partners' },
  { label: 'Careers', href: '/careers' }
];

export default function Header({ className = '' }: HeaderProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 max-w-7xl mx-auto">
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
                className="text-gray-200 transition-colors text-sm font-medium"
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#00ABE6'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = ''}
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
                  className="block text-gray-300 transition-colors text-sm font-medium"
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#00ABE6'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = ''}
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