'use client';

import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

const platforms = ['01', '02', '03'] as const;

export default function MainPlatforms() {
  const { t } = useMainTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{t('platforms.title')}</h2>
        <p className={styles.tagline} style={{ marginTop: '12px' }}>
          {t('platforms.tagline')}
        </p>

        <div className={styles.platformGrid}>
          {platforms.map((num) => (
            <div key={num} className={styles.platformCard}>
              <span className={styles.platformNum}>{num}</span>
              <h3 className={styles.cardTitle}>{t(`platforms.${num}.title`)}</h3>
              <p className={styles.platformDesc}>{t(`platforms.${num}.desc`)}</p>
              <a href="#" className={styles.arrowLink}>
                ↳ {t(`platforms.${num}.link`)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
