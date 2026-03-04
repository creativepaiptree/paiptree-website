'use client';

import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

const items = ['01', '02', '03'] as const;

export default function MainRecognition() {
  const { t } = useMainTranslation();

  return (
    <section className={`${styles.section} ${styles.recognitionBg}`}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{t('recognition.title')}</h2>
        <p className={styles.tagline} style={{ marginTop: '12px' }}>
          {t('recognition.tagline')}
        </p>

        <div className={styles.recognitionGrid}>
          {items.map((num) => (
            <div key={num} className={styles.recognitionCell}>
              <span className={styles.recognitionStat}>
                {t(`recognition.${num}.stat`)}
              </span>
              <p className={styles.bodyText}>{t(`recognition.${num}.desc`)}</p>
              <a href="#" className={styles.arrowLink}>
                ↳ {t(`recognition.${num}.link`)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
