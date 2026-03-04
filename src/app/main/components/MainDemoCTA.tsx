'use client';

import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

export default function MainDemoCTA() {
  const { t } = useMainTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.demoCta}>
          <h2 className={styles.sectionTitle}>{t('demo.title')}</h2>
          <p className={styles.tagline}>{t('demo.sub')}</p>
          <a href="mailto:contact@paiptree.com" className={styles.btnPrimary}>
            {t('demo.cta')}
          </a>
        </div>
      </div>
    </section>
  );
}
