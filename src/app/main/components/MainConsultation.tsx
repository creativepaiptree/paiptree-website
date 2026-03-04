'use client';

import Image from 'next/image';
import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

export default function MainConsultation() {
  const { t } = useMainTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.consultGrid}>
          <Image
            src="/p2.png"
            alt="Consultation"
            width={640}
            height={480}
            className={styles.consultImage}
            priority={false}
          />
          <div className={styles.consultContent}>
            <h2 className={styles.sectionTitle} style={{ whiteSpace: 'pre-line' }}>
              {t('consult.title')}
            </h2>
            <p className={styles.bodyText}>{t('consult.desc')}</p>
            <div>
              <a href="mailto:contact@paiptree.com" className={styles.btnPrimary}>
                {t('consult.cta')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
