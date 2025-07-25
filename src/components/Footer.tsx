// src/components/Footer.tsx
import Link from 'next/link';

const Footer = () => {
  const footerLinks = {
    Company: [
      { name: 'Board of Directors', href: '/company/board' },
      { name: 'Partners', href: '/partners' },
      { name: 'Safety', href: '/company/safety' },
      { name: 'Research', href: '/research' },
      { name: 'Careers', href: '/careers' },
      { name: 'News', href: '/news' },
    ],
    Models: [
      { name: 'Image', href: '/models/image' },
      { name: 'Video', href: '/models/video' },
      { name: 'Audio', href: '/models/audio' },
      { name: '3D', href: '/models/3d' },
    ],
    Deployment: [
      { name: 'Self-Hosted License', href: '/deployment/self-hosted' },
      { name: 'Platform API', href: '/deployment/api' },
      { name: 'Cloud Platforms', href: '/deployment/cloud' },
    ],
    Resources: [
      { name: 'Learning Hub', href: '/resources/learning' },
      { name: 'Customer Stories', href: '/resources/customers' },
      { name: 'Contact Us', href: '/contact' },
    ],
  };

  return (
    <footer className="bg-black border-t border-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Paiptree</h3>
            <p className="text-gray-400 text-sm">
              Unlocking the power of open-source generative AI to expand human creativity.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
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
            © {new Date().getFullYear()} Paiptree Ltd. All Rights Reserved.
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
