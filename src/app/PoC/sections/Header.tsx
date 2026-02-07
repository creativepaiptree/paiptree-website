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
      <div className="basis-[35%] flex-shrink-0 bg-[#161b22] p-3 border border-[#30363d]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-[#3fb950]">33.2°</span>
            <div className="flex items-center gap-1 text-[#3fb950]">
              <Sun className="w-4 h-4" />
              <span className="text-sm font-bold">{t.sunny[lang]}</span>
            </div>
          </div>

          <div className="h-9 w-px bg-gray-700" />

          <div className="flex-1 flex justify-center">
            <div className="space-y-1 min-w-[120px] text-left">
              <div className="flex items-center justify-between text-gray-300 font-medium">
                <span>{lang === 'ko' ? '02/05(목)' : 'Thu, 02/05'}</span>
                <span className="text-gray-400">18:24</span>
              </div>
              <div className="text-sm flex items-center justify-between">
                <span className="text-gray-400">{t.humidity[lang]}</span>
                <span className="text-[#3fb950]">32%</span>
              </div>
              <div className="text-sm flex items-center justify-between">
                <span className="text-gray-400">{t.rain[lang]}</span>
                <span className="text-[#3fb950]">0% 0mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Card - Cycle Status */}
      <div className="flex-1 bg-[#161b22] p-3 border border-[#30363d] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-200 tracking-wide">{t.cycleCompleted[lang]}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{t.awaitingPlacement[lang]}</p>
          <p className="text-gray-400 text-sm mt-0.5">2025-12-20 ~ 2026-01-28</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
