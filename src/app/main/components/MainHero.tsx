'use client';

import Image from 'next/image';
import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

export default function MainHero() {
  const { t } = useMainTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} style={{ whiteSpace: 'pre-line' }}>
            {t('hero.title')}
          </h1>
          <p className={styles.heroSub}>{t('hero.sub')}</p>
          <div className={styles.heroBtns}>
            <a href="mailto:contact@paiptree.com" className={styles.btnPrimary}>
              {t('hero.cta1')}
            </a>
            <a href="#platforms" className={styles.btnSecondary}>
              {t('hero.cta2')}
            </a>
          </div>
        </div>
        <Image
          src="/p1.png"
          alt="paiptree platform"
          width={640}
          height={480}
          className={styles.heroImage}
          priority
        />
      </div>
    </section>
  );
}
