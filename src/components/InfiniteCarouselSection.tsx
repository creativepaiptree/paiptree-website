'use client';

import { useEffect, useState } from 'react';
import Section from './ui/Section';

interface CarouselCard {
  id: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  backgroundColor?: string;
}

const carouselData: CarouselCard[] = [
  {
    id: '1',
    title: 'CYBERNETIC ENTERPRISE',
    subtitle: 'Building Future Digital Infrastructure',
    backgroundImage: '/p1.png',
    backgroundColor: 'from-gray-100 to-gray-200'
  },
  {
    id: '2',
    title: 'AUTOMATION CORE',
    subtitle: 'Driving Automation Into Every Core Function',
    backgroundImage: '/p2.png',
    backgroundColor: 'from-gray-200 to-gray-300'
  },
  {
    id: '3',
    title: 'AI TRANSFORMATION',
    subtitle: 'AI is Transforming the Enterprise',
    backgroundImage: '/p3.png',
    backgroundColor: 'from-gray-100 to-gray-250'
  },
  {
    id: '4',
    title: 'DATA INTELLIGENCE',
    subtitle: 'Smart Analytics for Better Decisions',
    backgroundImage: '/p4.png',
    backgroundColor: 'from-gray-150 to-gray-200'
  },
  {
    id: '5',
    title: 'DIGITAL WORKFLOW',
    subtitle: 'Streamlined Processes for Maximum Efficiency',
    backgroundImage: '/p5.png',
    backgroundColor: 'from-gray-200 to-gray-100'
  }
];

export default function InfiniteCarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % carouselData.length);
    }, 6000);
    
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <Section 
      className="py-20 overflow-hidden" 
      background="light"
      withNoiseOverlay
    >
      {/* Top Navigation Buttons */}
      <div className="container mx-auto px-6 mb-12">
        <div className="flex justify-center gap-2 flex-wrap">
          {carouselData.map((card, index) => (
            <button
              key={card.id}
              className="relative px-3 py-1 rounded text-black text-xs bg-white overflow-hidden transition-all duration-300"
              onClick={() => setCurrentIndex(index)}
            >
              {/* Background fill animation */}
              <div 
                className={`absolute inset-0 bg-blue-500 opacity-20 ${
                  index === currentIndex && !isPaused 
                    ? 'animate-[fillProgress_6s_linear_infinite]' 
                    : 'w-0'
                }`}
              ></div>
              
              {/* Button text */}
              <span className="relative z-10">{card.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div 
          className="flex gap-6 transition-transform duration-500 ease-in-out"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ 
            transform: `translateX(calc(50vw - 480px - ${currentIndex * 984}px))`
          }}
        >
          {carouselData.map((card, index) => (
            <div
              key={card.id}
              className="flex-shrink-0 w-[960px] h-[600px] relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              {/* Background image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${card.backgroundImage})`
                }}
              ></div>
              
              {/* Background pattern/mockup */}
              <div className="absolute inset-0 opacity-20">
                {card.id === '1' && (
                  <div className="absolute bottom-10 left-6 right-6 h-32 bg-gradient-to-t from-white/10 to-transparent rounded-lg flex items-end justify-center">
                    <div className="grid grid-cols-4 gap-2 p-4 w-full">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 bg-white/20 rounded"></div>
                      ))}
                    </div>
                  </div>
                )}
                {card.id === '2' && (
                  <div className="absolute inset-6 border border-white/20 rounded-lg">
                    <div className="absolute inset-4 grid grid-cols-4 gap-4">
                      <div className="bg-white/10 rounded flex items-center justify-center text-xs text-white/60">QUERY</div>
                      <div className="bg-white/10 rounded flex items-center justify-center text-xs text-white/60">EXPLORE</div>
                      <div className="bg-white/10 rounded flex items-center justify-center text-xs text-white/60">COMPILE</div>
                      <div className="bg-white/10 rounded flex items-center justify-center text-xs text-white/60">EXECUTE</div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded"></div>
                  </div>
                )}
                {card.id === '3' && (
                  <div className="absolute inset-6">
                    <div className="w-full h-full bg-gradient-to-br from-teal-500/20 via-transparent to-green-500/20 rounded-lg flex items-center justify-center">
                      <div className="text-4xl opacity-40">🤖</div>
                    </div>
                  </div>
                )}
                {(card.id === '4' || card.id === '5') && (
                  <div className="absolute inset-6 border border-white/10 rounded-lg flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-white/20 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>

              {/* Label */}
              <div className="absolute top-6 left-6 right-6">
                <div className="inline-block bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2">
                  <h3 className="text-sm text-white mb-1">{card.title}</h3>
                  {card.subtitle && (
                    <p className="text-xl text-white/80">{card.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent"></div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}