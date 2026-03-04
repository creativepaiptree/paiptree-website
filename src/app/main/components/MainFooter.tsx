'use client';

import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

const columns = [
  { titleKey: 'footer.col1.title', links: ['footer.col1.l1', 'footer.col1.l2', 'footer.col1.l3'] },
  { titleKey: 'footer.col2.title', links: ['footer.col2.l1', 'footer.col2.l2', 'footer.col2.l3'] },
  { titleKey: 'footer.col3.title', links: ['footer.col3.l1', 'footer.col3.l2', 'footer.col3.l3'] },
  { titleKey: 'footer.col4.title', links: ['footer.col4.l1', 'footer.col4.l2', 'footer.col4.l3'] },
];

export default function MainFooter() {
  const { t } = useMainTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {columns.map((col) => (
            <div key={col.titleKey}>
              <p className={styles.footerColTitle}>{t(col.titleKey)}</p>
              {col.links.map((lk) => (
                <a key={lk} href="#" className={styles.footerLink}>
                  {t(lk)}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>{t('footer.copy')}</span>
          <div className={styles.footerBottomLinks}>
            <a href="#" className={styles.footerBottomLink}>{t('footer.privacy')}</a>
            <a href="#" className={styles.footerBottomLink}>{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
