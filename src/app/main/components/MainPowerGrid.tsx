'use client';

import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

const cells = ['a', 'b', 'c', 'd'] as const;

export default function MainPowerGrid() {
  const { t } = useMainTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{t('power.title')}</h2>

        <div className={styles.powerGrid}>
          {cells.map((key) => (
            <div key={key} className={styles.powerCell}>
              <span className={styles.powerLabel}>
                —— {t(`power.${key}.label`)}
              </span>
              <h3 className={styles.cardTitle}>{t(`power.${key}.title`)}</h3>
              <p className={styles.bodyText}>{t(`power.${key}.desc`)}</p>
              <a href="#" className={styles.arrowLink}>
                ↳ {t(`power.${key}.link`)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
