'use client';

import { Sun } from 'lucide-react';

interface HeaderProps {
  lang: 'ko' | 'en';
}

const t = {
  sunny: { ko: '맑음', en: 'Sunny' },
  humidity: { ko: '습도', en: 'Humidity' },
  rain: { ko: '강수', en: 'Rain' },
  none: { ko: '없음', en: 'None' },
  cycleCompleted: { ko: '사이클 완료', en: 'CYCLE COMPLETED' },
  awaitingPlacement: { ko: '입추 대기중', en: 'AWAITING PLACEMENT' },
  thu: { ko: '목', en: 'Thu' },
};

const Header = ({ lang }: HeaderProps) => {
  return (
    <div className="flex gap-4">
      {/* Left Card - Weather Info */}
      <div className="bg-[#161b22] p-4 border border-[#30363d] rounded-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-light text-[#3fb950]">33.2°</span>
            <div className="flex items-center gap-1 text-[#3fb950]">
              <Sun className="w-5 h-5" />
              <span className="text-sm">{t.sunny[lang]}</span>
            </div>
          </div>

          <div className="h-12 w-px bg-gray-700" />

          <div className="space-y-1">
            <p className="text-gray-300 font-medium">{lang === 'ko' ? '02/05(목)' : 'Thu, 02/05'}</p>
            <p className="text-gray-400 text-sm">18:24</p>
            <div className="text-sm">
              <span className="text-gray-400">{t.humidity[lang]} </span>
              <span className="text-[#3fb950]">32%</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">{t.rain[lang]} </span>
              <span className="text-[#3fb950]">0%</span>
              <span className="text-gray-400"> 0mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Card - Cycle Status */}
      <div className="flex-1 bg-[#161b22] p-4 border border-[#30363d] rounded-lg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-200 tracking-wide">{t.cycleCompleted[lang]}</h2>
          <p className="text-gray-500 text-sm mt-1">{t.awaitingPlacement[lang]}</p>
          <p className="text-gray-400 text-sm mt-1">2025-12-20 ~ 2026-01-28</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
