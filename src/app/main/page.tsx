'use client';

import styles from './main.module.css';
import MainBanner from './components/MainBanner';
import MainHeader from './components/MainHeader';
import MainHero from './components/MainHero';
import MainPlatforms from './components/MainPlatforms';
import MainRecognition from './components/MainRecognition';
import MainConsultation from './components/MainConsultation';
import MainPowerGrid from './components/MainPowerGrid';
import MainPartners from './components/MainPartners';
import MainDemoCTA from './components/MainDemoCTA';
import MainFooter from './components/MainFooter';

export default function MainPage() {
  return (
    <div className={styles.root}>
      <MainBanner />
      <MainHeader />
      <main>
        <MainHero />
        <MainPlatforms />
        <MainRecognition />
        <MainConsultation />
        <MainPowerGrid />
        <MainPartners />
        <MainDemoCTA />
      </main>
      <MainFooter />
    </div>
  );
}
