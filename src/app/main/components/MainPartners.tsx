'use client';

import Image from 'next/image';
import { useMainTranslation } from '../data/mainTranslations';
import styles from '../main.module.css';

const partners = [
  { name: '디캠프', src: '/partners/1.디캠프.png' },
  { name: '아산나눔재단', src: '/partners/2.아산나눔재단.png' },
  { name: '건국대학교', src: '/partners/3.건국대학교.png' },
  { name: 'KCAV', src: '/partners/4.kcav.png' },
  { name: 'CJ', src: '/partners/5.씨제이.png' },
  { name: 'SK', src: '/partners/6.sk.png' },
  { name: '체리부로', src: '/partners/7.체리부로.png' },
  { name: 'KGB', src: '/partners/8.KGB.png' },
  { name: '신우', src: '/partners/9.신우.png' },
  { name: '금화', src: '/partners/10.금화.png' },
  { name: '아임닭', src: '/partners/11.아임닭.png' },
  { name: '한라씨에프엔', src: '/partners/12.한라씨에프엔.png' },
  { name: '아프', src: '/partners/13.아프.png' },
  { name: '창젠', src: '/partners/14.창젠.png' },
  { name: '니폰산소', src: '/partners/15.니폰산소.png' },
  { name: '크라운', src: '/partners/16.크라운.png' },
  { name: '인비소', src: '/partners/17.인비소.png' },
  { name: '동서', src: '/partners/18.동서.png' },
  { name: '에임비랩', src: '/partners/19.에임비랩.png' },
  { name: '금계', src: '/partners/20.금계.png' },
];

export default function MainPartners() {
  const { t } = useMainTranslation();

  return (
    <section className={`${styles.section} ${styles.partnersBg}`}>
      <div className={styles.sectionInner}>
        <div className={styles.partnersCaption}>
          <span className={styles.caption}>{t('partners.caption')}</span>
        </div>

        <div className={styles.partnerGrid}>
          {partners.map((p) => (
            <Image
              key={p.name}
              src={p.src}
              alt={`${p.name} logo`}
              width={120}
              height={48}
              className={styles.partnerLogo}
              style={{ width: 'auto', height: '36px', maxWidth: '100%' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
