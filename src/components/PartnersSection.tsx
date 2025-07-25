// src/components/PartnersSection.tsx
const PartnersSection = () => {
  const partnerLogos = [
    // Placeholder logos. Replace with actual partner logos.
    { name: 'aws', src: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', width: 100 },
    { name: 'nvidia', src: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Nvidia_logo.svg/2560px-Nvidia_logo.svg.png', width: 120 },
    { name: 'microsoft-azure', src: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg', width: 140 },
    { name: 'lenovo', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lenovo_Global_Corporate_Logo.png/2560px-Lenovo_Global_Corporate_Logo.png', width: 120 },
    { name: 'huggingface', src: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg', width: 140 },
  ];

  return (
    <section className="py-12 bg-black overflow-hidden">
      <div className="container mx-auto px-6 text-center max-w-6xl">
        <h2 className="text-lg font-medium text-gray-500 mb-12">
          Trusted by the world&apos;s most innovative businesses.
        </h2>
        <div className="relative">
          <div className="flex items-center gap-x-16 infinite-scroll opacity-60">
            {/* 첫 번째 세트 */}
            {partnerLogos.map((logo, index) => (
              <img
                key={`first-${logo.name}-${index}`}
                src={logo.src}
                alt={`${logo.name} logo`}
                style={{ width: `${logo.width * 0.8}px`, filter: 'brightness(0) invert(1)' }}
                className="h-auto flex-shrink-0"
              />
            ))}
            {/* 두 번째 세트 (무한 루프를 위한 복제) */}
            {partnerLogos.map((logo, index) => (
              <img
                key={`second-${logo.name}-${index}`}
                src={logo.src}
                alt={`${logo.name} logo`}
                style={{ width: `${logo.width * 0.8}px`, filter: 'brightness(0) invert(1)' }}
                className="h-auto flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
