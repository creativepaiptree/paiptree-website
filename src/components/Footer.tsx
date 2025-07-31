// src/components/Footer.tsx
'use client';

import Link from 'next/link';

const Footer = () => {
  const footerSections = {
    'OFFERINGS': [
      'Anti-Money Laundering',
      'Automotive & Mobility', 
      'Data Protection',
      'Defense',
      'Energy',
      'Federal Health',
      'FedStart',
      'Financial Services',
      'Food & Beverage',
      'Palantir for Builders',
      'Govt Financial Management',
      'Hospital Operations',
      'Insurance',
      'Intelligence',
      'Life Sciences',
    ],
    'IMPACT STUDIES': [
      'Airbus',
      'Axel Springer',
      'Cleveland Clinic',
      'Concordance',
      'Doosan Infracore',
      'Fujitsu',
      'HHS & CDC',
      'Jacobs',
      'Kinder Morgan',
      'NHS',
      'Pacific Gas & Electric',
    ],
    'CAPABILITIES': [
      'AI + ML',
      'AIP for Developers',
      'Data Integration',
      'Digital Twin',
      'Dynamic Scheduling',
      'Edge AI',
      'Marketplace',
      'MetaConstellation',
      'Pipeline Builder',
      'Process Mining',
      'Real-Time Alerting',
      'Streaming',
      'Titanium',
      'Warp Speed'
    ],
    'DOCUMENTS': [
      'Developer Community',
      'Platform Documentation',
      'Palantir Developers',
      'Trust Center',
      'Modern Slavery Statement',
      'Cookies',
      'Privacy and Civil Liberties',
      'Palantir Explained',
      'Sustainability',
      'Human Rights Policy',
      'Privacy Statement',
      'Terms of Use'
    ]
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Column - Copyright & Social */}
          <div className="md:col-span-1">
            <div className="mb-8">
              <p className="text-gray-600 text-sm mb-1">© 2025 Paiptree Inc.</p>
              <p className="text-gray-600 text-sm mb-8">All rights reserved.</p>
              
              <div className="space-y-2">
                <button className="block w-full text-left px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50">YOUTUBE</button>
                <button className="block w-full text-left px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50">INSTAGRAM</button>
                <button className="block w-full text-left px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50">LINKEDIN</button>
                <button className="block w-full text-left px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50">GITHUB</button>
              </div>
            </div>
          </div>

          {/* Right Columns - Link Sections */}
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title} className="md:col-span-1">
              <h4 className="font-medium text-gray-500 text-[10px] mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
