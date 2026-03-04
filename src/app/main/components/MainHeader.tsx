'use client';

import { useState } from 'react';
import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

const navKeys = ['fm', 'scm', 'tms', 'blog'] as const;

export default function MainHeader() {
  const { t, language, toggleLanguage } = useMainTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="/main" className={styles.headerLogo}>paiptree.</a>

        {/* Desktop nav */}
        <nav className={styles.headerNav}>
          {navKeys.map((key) => (
            <a key={key} href={`#${key}`} className={styles.headerNavLink}>
              {t(`nav.${key}`)}
            </a>
          ))}
        </nav>

        {/* Desktop right */}
        <div className={styles.headerRight}>
          <button className={styles.langBtn} onClick={toggleLanguage}>
            {language === 'ko' ? 'EN' : 'KO'}
          </button>
          <a href="mailto:contact@paiptree.com" className={styles.btnPrimary} style={{ padding: '10px 24px', fontSize: '14px' }}>
            {t('nav.cta')}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileOverlayHeader}>
            <a href="/main" className={styles.headerLogo}>paiptree.</a>
            <button
              className={styles.mobileOverlayClose}
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <nav className={styles.mobileOverlayNav}>
            {navKeys.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className={styles.mobileOverlayLink}
                onClick={() => setOpen(false)}
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
            <button className={styles.langBtn} onClick={toggleLanguage}>
              {language === 'ko' ? 'EN' : 'KO'}
            </button>
            <a href="mailto:contact@paiptree.com" className={styles.btnPrimary}>
              {t('nav.cta')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
