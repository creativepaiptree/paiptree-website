'use client';

import { useState } from 'react';
import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

export default function MainBanner() {
  const { t } = useMainTranslation();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.bannerText}>
        {t('banner.text')} <span aria-hidden>→</span>
      </span>
      <button
        className={styles.bannerClose}
        onClick={() => setVisible(false)}
        aria-label="Close banner"
      >
        ✕
      </button>
    </div>
  );
}
