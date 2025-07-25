// src/components/NewsSection.tsx
import Button from './ui/Button';
import Link from 'next/link';

const NewsSection = () => {
  const newsItems = [
    {
      title: 'Stable Diffusion 3.5 Models Optimized with TensorRT Deliver 2X Faster Performance',
      date: 'Jun 12, 2025',
      link: '/news/stable-diffusion-3-5-tensorrt',
    },
    {
      title: 'Stable Video 4D 2.0: New Upgrades for High-Fidelity Novel-Views and 4D Generation',
      date: 'May 20, 2025',
      link: '/news/stable-video-4d-2-0',
    },
    {
      title: 'Stability AI and Arm Collaborate to Release Stable Audio Open Small',
      date: 'May 14, 2025',
      link: '/news/stability-ai-arm-collaboration',
    },
  ];

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-medium tracking-tight">News</h2>
          <Link href="/news">
            <Button variant="secondary">View all news</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {newsItems.map((item, index) => (
            <Link href={item.link} key={index} className="group cursor-pointer">
              <div className="border-t border-gray-800 pt-6 hover:border-gray-700 transition-colors duration-300">
                <p className="text-gray-500 text-sm mb-3 font-medium">{item.date}</p>
                <h3 className="text-lg leading-tight group-hover:text-gray-300 transition-colors duration-300">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
