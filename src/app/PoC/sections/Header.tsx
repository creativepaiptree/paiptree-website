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
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-[#3fb950]">33.2°</span>
            <div className="flex items-center gap-1 text-[#3fb950]">
              <Sun className="w-4 h-4" />
              <span className="text-sm font-bold">{t.sunny[lang]}</span>
            </div>
          </div>

            <div className="h-9 w-px bg-gray-700" />

            <div className="space-y-1 min-w-[120px] text-left">
              <div className="flex items-center justify-between text-sm text-gray-300 font-medium">
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
        <div className="w-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-gray-400 font-medium">OVERVIEW</h2>
              <span className="px-1 py-[1px] text-[10px] font-semibold text-[#3fb950] bg-[#3fb950]/15 border border-[#3fb950]">Growing</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span>Sensors | 02.07 20:00</span>
              <span>Weight | 02.07 11:00</span>
            </div>
            </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="text-center">
              <p className="text-sm leading-none text-[#3fb950] font-semibold mb-1">House(s)</p>
              <p className="text-sm text-gray-200">Age 35</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#3fb950] font-semibold mb-1">Rearing Count</p>
              <p className="text-sm text-gray-200">6,400</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#3fb950] font-semibold mb-1">Survival Rate</p>
              <p className="text-sm text-gray-200">100%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#3fb950] font-semibold mb-1">Est. Weight</p>
              <p className="text-sm text-gray-200">1,081g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#3fb950] font-semibold mb-1">Temp/Humid</p>
              <p className="text-sm text-gray-200">0°C/0%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
