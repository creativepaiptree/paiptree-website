// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Footer = () => {
  const { t } = useTranslation();
  
  const footerLinks = {
    Company: [
      { name: t('footer.links.company.boardOfDirectors'), href: '/company/board' },
      { name: t('footer.links.company.partners'), href: '/partners' },
      { name: t('footer.links.company.safety'), href: '/company/safety' },
      { name: t('footer.links.company.research'), href: '/research' },
      { name: t('footer.links.company.careers'), href: '/careers' },
      { name: t('footer.links.company.news'), href: '/news' },
    ],
    Models: [
      { name: t('footer.links.models.image'), href: '/models/image' },
      { name: t('footer.links.models.video'), href: '/models/video' },
      { name: t('footer.links.models.audio'), href: '/models/audio' },
      { name: t('footer.links.models.3d'), href: '/models/3d' },
    ],
    Deployment: [
      { name: t('footer.links.deployment.selfHosted'), href: '/deployment/self-hosted' },
      { name: t('footer.links.deployment.platformApi'), href: '/deployment/api' },
      { name: t('footer.links.deployment.cloudPlatforms'), href: '/deployment/cloud' },
    ],
    Resources: [
      { name: t('footer.links.resources.learningHub'), href: '/resources/learning' },
      { name: t('footer.links.resources.customerStories'), href: '/resources/customers' },
      { name: t('footer.links.resources.contactUs'), href: '/contact' },
    ],
  };

  return (
    <footer className="bg-black border-t border-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Paiptree</h3>
            <p className="text-gray-400 text-sm">
              {t('footer.description')}
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{t(`footer.categories.${title.toLowerCase()}`)}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link.name}
                      </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex space-x-4">
            {/* Add social links here if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
