'use client';

import { useMemo } from 'react';

interface WeightDistributionProps {
  lang: 'ko' | 'en';
}

// Seeded random for consistent values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const t = {
  weightDistribution: { ko: '체중 분포', en: 'WEIGHT DISTRIBUTION' },
  barn: { ko: '동', en: 'BARN' },
  weightsAt: { ko: '체중 측정 시각', en: 'Weights at' },
};

const WeightDistribution = ({ lang }: WeightDistributionProps) => {
  const bars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const randomPart = seededRandom(i + 1) * 20;
      const height = Math.round(Math.max(20, Math.sin(i * 0.4) * 60 + 70 + randomPart) * 100) / 100;
      const opacity = Math.round((0.6 + (height / 200) * 0.4) * 100) / 100;
      return { height, opacity };
    });
  }, []);

  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium">{t.weightDistribution[lang]}</h3>
        <div className="text-right">
          <p className="text-gray-300 font-medium">21 {t.barn[lang]}</p>
          <p className="text-gray-500 text-sm">{t.weightsAt[lang]} 01.28 01:00</p>
        </div>
      </div>

      {/* Distribution bars placeholder */}
      <div className="h-[120px] flex items-end justify-center gap-1">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="w-4 bg-[#8b5cf6] rounded-t"
            style={{ height: `${bar.height}%`, opacity: bar.opacity }}
          />
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
        <span>0</span>
        <span>500</span>
        <span>1000</span>
        <span>1500</span>
        <span>2000</span>
        <span>2500</span>
        <span>3000</span>
        <span>3500</span>
      </div>
    </div>
  );
};

export default WeightDistribution;
